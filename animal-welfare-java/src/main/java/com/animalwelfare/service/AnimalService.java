package com.animalwelfare.service;

import com.animalwelfare.api.dto.animal.AnimalRequest;
import com.animalwelfare.api.dto.animal.AnimalResponse;
import com.animalwelfare.api.response.PagedResponse;
import com.animalwelfare.domain.model.Animal;
import com.animalwelfare.domain.model.Animal.AnimalStatus;
import com.animalwelfare.domain.model.AnimalImage;
import com.animalwelfare.domain.model.User;
import com.animalwelfare.domain.repository.AnimalRepository;
import com.animalwelfare.domain.repository.UserRepository;
import com.animalwelfare.exception.BusinessException;
import com.animalwelfare.exception.ResourceNotFoundException;
import com.animalwelfare.infrastructure.ImageStorageService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * AnimalService — all business logic for animal management.
 *
 * Business rules preserved from original project + enhanced:
 * - Any authenticated user can post a stray animal
 * - Only the poster or an ADMIN can edit/delete their listing
 * - Animals cannot be deleted once adopted
 * - Multiple images supported; first upload is auto-set as primary
 */
@Service
public class AnimalService {

    private final AnimalRepository animalRepository;
    private final UserRepository userRepository;
    private final ImageStorageService imageStorageService;

    public AnimalService(AnimalRepository animalRepository,
                         UserRepository userRepository,
                         ImageStorageService imageStorageService) {
        this.animalRepository    = animalRepository;
        this.userRepository      = userRepository;
        this.imageStorageService = imageStorageService;
    }

    /** Paginated available animals with optional category filter */
    @Transactional(readOnly = true)
    public PagedResponse<AnimalResponse> getAvailableAnimals(String category, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Animal> animals;
        if (category != null && !category.isBlank()) {
            animals = animalRepository.findByCategoryIgnoreCaseAndStatus(
                    category.toUpperCase(), AnimalStatus.AVAILABLE, pageable);
        } else {
            animals = animalRepository.findByStatus(AnimalStatus.AVAILABLE, pageable);
        }
        return new PagedResponse<>(animals.map(AnimalResponse::from));
    }

    /** Single animal by ID — includes images */
    @Transactional(readOnly = true)
    public AnimalResponse getById(Long id) {
        Animal animal = animalRepository.findByIdWithImages(id)
                .orElseThrow(() -> new ResourceNotFoundException("Animal", id));
        return AnimalResponse.from(animal);
    }

    /** All animals posted by a user — for My Contributions dashboard */
    @Transactional(readOnly = true)
    public List<AnimalResponse> getByUser(String username) {
        User user = getUser(username);
        return animalRepository.findByPostedByWithImages(user).stream()
                .map(AnimalResponse::from)
                .collect(Collectors.toList());
    }

    /** Animals adopted by a user (approved adoption requests) */
    @Transactional(readOnly = true)
    public List<AnimalResponse> getAdoptedByUser(String username) {
        User user = getUser(username);
        return animalRepository.findAdoptedByUser(user).stream()
                .map(AnimalResponse::from)
                .collect(Collectors.toList());
    }

    /** Post a new stray animal — preserves original core feature */
    @Transactional
    public AnimalResponse create(AnimalRequest request, String username) {
        User user = userRepository.findByUsernameWithRoles(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
        Animal animal = mapToEntity(request, new Animal());
        animal.setPostedBy(user);
        
        // Admin or Volunteer listings are automatically approved (AVAILABLE).
        // Regular user listings require approval (PENDING).
        boolean isAutoApprove = user.getRoles().stream()
                .anyMatch(r -> r.getName().equals("ROLE_ADMIN") || r.getName().equals("ROLE_VOLUNTEER"));
        
        if (isAutoApprove) {
            animal.setStatus(AnimalStatus.AVAILABLE);
        } else {
            animal.setStatus(AnimalStatus.PENDING);
        }
        
        return AnimalResponse.from(animalRepository.save(animal));
    }

    /** Update animal details — poster or admin only */
    @Transactional
    public AnimalResponse update(Long id, AnimalRequest request, String username) {
        Animal animal = animalRepository.findByIdWithImages(id)
                .orElseThrow(() -> new ResourceNotFoundException("Animal", id));
        assertCanModify(animal, username);
        mapToEntity(request, animal);
        return AnimalResponse.from(animalRepository.save(animal));
    }

    /** Delete an animal listing */
    @Transactional
    public void delete(Long id, String username) {
        Animal animal = animalRepository.findByIdWithImages(id)
                .orElseThrow(() -> new ResourceNotFoundException("Animal", id));
        assertCanModify(animal, username);
        if (animal.getStatus() == AnimalStatus.ADOPTED) {
            throw new BusinessException("Cannot delete an animal that has already been adopted");
        }
        animal.getImages().forEach(img -> imageStorageService.delete(img.getPublicId()));
        animalRepository.delete(animal);
    }

    /** Add an image to an animal listing */
    @Transactional
    public AnimalResponse addImage(Long animalId, MultipartFile file, String username) throws IOException {
        Animal animal = animalRepository.findByIdWithImages(animalId)
                .orElseThrow(() -> new ResourceNotFoundException("Animal", animalId));
        assertCanModify(animal, username);

        ImageStorageService.UploadResult result = imageStorageService.upload(file, "animals");
        boolean isPrimary = animal.getImages().isEmpty();
        AnimalImage image = new AnimalImage(result.url(), result.publicId(), isPrimary);
        image.setDisplayOrder(animal.getImages().size());
        animal.addImage(image);

        return AnimalResponse.from(animalRepository.save(animal));
    }

    /** Approve a pending animal listing — Admin/Volunteer only */
    @Transactional
    public AnimalResponse approveListing(Long id, String username) {
        Animal animal = animalRepository.findByIdWithImages(id)
                .orElseThrow(() -> new ResourceNotFoundException("Animal", id));

        User reviewer = userRepository.findByUsernameWithRoles(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        boolean isAdminOrVolunteer = reviewer.getRoles().stream()
                .anyMatch(r -> r.getName().equals("ROLE_ADMIN") || r.getName().equals("ROLE_VOLUNTEER"));

        if (!isAdminOrVolunteer) {
            throw new AccessDeniedException("Only Admin or Volunteer can approve listings");
        }

        if (animal.getStatus() != AnimalStatus.PENDING) {
            throw new BusinessException("Only PENDING listings can be approved");
        }

        animal.setStatus(AnimalStatus.AVAILABLE);
        return AnimalResponse.from(animalRepository.save(animal));
    }

    /** Get all pending animal listings — Admin/Volunteer only */
    @Transactional(readOnly = true)
    public List<AnimalResponse> getPendingListings(String username) {
        User user = userRepository.findByUsernameWithRoles(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        boolean isAdminOrVolunteer = user.getRoles().stream()
                .anyMatch(r -> r.getName().equals("ROLE_ADMIN") || r.getName().equals("ROLE_VOLUNTEER"));

        if (!isAdminOrVolunteer) {
            throw new AccessDeniedException("Only Admin or Volunteer can view pending listings");
        }

        Pageable pageable = PageRequest.of(0, 100, Sort.by("createdAt").descending());
        return animalRepository.findByStatus(AnimalStatus.PENDING, pageable).getContent().stream()
                .map(AnimalResponse::from)
                .collect(Collectors.toList());
    }

    /** Platform statistics */
    @Transactional(readOnly = true)
    public Map<String, Long> getStats() {
        return Map.of(
                "available", animalRepository.countByStatus(AnimalStatus.AVAILABLE),
                "adopted",   animalRepository.countByStatus(AnimalStatus.ADOPTED),
                "total",     animalRepository.count()
        );
    }

    // ---- Private helpers ----

    private Animal mapToEntity(AnimalRequest req, Animal animal) {
        animal.setName(req.getName());
        animal.setCategory(req.getCategory().toUpperCase());
        animal.setBreed(req.getBreed());
        animal.setAgeMonths(req.getAgeMonths());
        animal.setGender(req.getGender() != null ? req.getGender().toUpperCase() : null);
        animal.setColor(req.getColor());
        animal.setLocation(req.getLocation());
        animal.setDescription(req.getDescription());
        animal.setHealthStatus(req.getHealthStatus());
        animal.setVaccinated(req.isVaccinated());
        animal.setNeutered(req.isNeutered());
        return animal;
    }

    private void assertCanModify(Animal animal, String username) {
        boolean isOwner = animal.getPostedBy() != null
                && animal.getPostedBy().getUsername().equals(username);
        boolean isAdmin = userRepository.findByUsernameWithRoles(username)
                .map(u -> u.getRoles().stream()
                        .anyMatch(r -> r.getName().equals("ROLE_ADMIN")))
                .orElse(false);
        if (!isOwner && !isAdmin) {
            throw new AccessDeniedException("You can only modify animals you posted");
        }
    }

    private User getUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
    }
}
