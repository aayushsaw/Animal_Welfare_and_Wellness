package com.animalwelfare.service;

import com.animalwelfare.dto.AnimalDto;
import com.animalwelfare.model.Animal;
import com.animalwelfare.model.Animal.AnimalStatus;
import com.animalwelfare.model.User;
import com.animalwelfare.repository.AnimalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * AnimalService handles all business logic for stray animal management.
 */
@Service
@RequiredArgsConstructor
public class AnimalService {

    private final AnimalRepository animalRepository;

    @Value("${app.upload.dir:uploads/animals}")
    private String uploadDir;

    public List<Animal> getAvailableAnimals() {
        return animalRepository.findByStatus(AnimalStatus.AVAILABLE);
    }

    public List<Animal> getAllAnimals() {
        return animalRepository.findAll();
    }

    public List<Animal> getAnimalsByUser(User user) {
        return animalRepository.findByPostedBy(user);
    }

    public List<Animal> getAnimalsAdoptedBy(User user) {
        return animalRepository.findByAdoptedBy(user);
    }

    public List<Animal> filterByCategory(String category) {
        if (category == null || category.isBlank()) {
            return getAvailableAnimals();
        }
        return animalRepository.findAvailableByCategory(category);
    }

    @Transactional
    public Animal publishAnimal(AnimalDto dto, User postedBy) throws IOException {
        Animal animal = new Animal();
        animal.setCategory(dto.getCategory());
        animal.setSubcategory(dto.getSubcategory());
        animal.setLocation(dto.getLocation());
        animal.setColor(dto.getColor());
        animal.setDescription(dto.getDescription());
        animal.setStatus(AnimalStatus.AVAILABLE);
        animal.setPostedBy(postedBy);

        if (dto.getImageFile() != null && !dto.getImageFile().isEmpty()) {
            String imagePath = saveImage(dto.getImageFile());
            animal.setImagePath(imagePath);
        }

        return animalRepository.save(animal);
    }

    @Transactional
    public boolean adoptAnimal(Long animalId, User adoptingUser) {
        Optional<Animal> opt = animalRepository.findById(animalId);
        if (opt.isEmpty()) return false;

        Animal animal = opt.get();
        if (animal.getStatus() == AnimalStatus.ADOPTED) return false;

        animal.setStatus(AnimalStatus.ADOPTED);
        animal.setAdoptedBy(adoptingUser);
        animal.setAdoptedAt(LocalDateTime.now());
        animalRepository.save(animal);
        return true;
    }

    public long countAvailable() {
        return animalRepository.countByStatus(AnimalStatus.AVAILABLE);
    }

    public long countAdopted() {
        return animalRepository.countByStatus(AnimalStatus.ADOPTED);
    }

    public long countPostedBy(User user) {
        return animalRepository.countByPostedBy(user);
    }

    public long countAdoptedBy(User user) {
        return animalRepository.countByAdoptedBy(user);
    }

    private String saveImage(MultipartFile file) throws IOException {
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String original = file.getOriginalFilename();
        String ext = (original != null && original.contains("."))
                ? original.substring(original.lastIndexOf(".")) : ".jpg";

        String uniqueName = UUID.randomUUID() + ext;
        Files.copy(file.getInputStream(), uploadPath.resolve(uniqueName), StandardCopyOption.REPLACE_EXISTING);
        return "/uploads/animals/" + uniqueName;
    }
}
