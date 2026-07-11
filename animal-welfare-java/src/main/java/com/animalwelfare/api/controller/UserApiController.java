package com.animalwelfare.api.controller;

import com.animalwelfare.api.dto.user.UserProfileResponse;
import com.animalwelfare.api.response.ApiResponse;
import com.animalwelfare.domain.model.User;
import com.animalwelfare.domain.repository.UserRepository;
import com.animalwelfare.domain.repository.AnimalRepository;
import com.animalwelfare.domain.repository.AdoptionRequestRepository;
import com.animalwelfare.domain.repository.RefreshTokenRepository;
import com.animalwelfare.exception.ResourceNotFoundException;
import com.animalwelfare.service.AnimalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * User API — /api/v1/users
 *
 *   GET /me        — current user's full profile with stats
 *   GET /          — get all users (Admin only)
 *   PUT /{id}/suspend  — lock user (Admin only)
 *   PUT /{id}/activate — unlock user (Admin only)
 *   DELETE /{id}       — delete user (Admin only)
 */
@Tag(name = "Users", description = "User profile and dashboard data")
@RestController
@RequestMapping("/api/v1/users")
@SecurityRequirement(name = "bearerAuth")
public class UserApiController {

    private final UserRepository userRepository;
    private final AnimalRepository animalRepository;
    private final AdoptionRequestRepository adoptionRequestRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final AnimalService animalService;

    public UserApiController(UserRepository userRepository,
                             AnimalRepository animalRepository,
                             AdoptionRequestRepository adoptionRequestRepository,
                             RefreshTokenRepository refreshTokenRepository,
                             AnimalService animalService) {
        this.userRepository = userRepository;
        this.animalRepository = animalRepository;
        this.adoptionRequestRepository = adoptionRequestRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.animalService  = animalService;
    }

    @Operation(summary = "Get the authenticated user's profile with contribution stats")
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getMyProfile(
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = userRepository.findByUsernameWithRoles(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", userDetails.getUsername()));

        UserProfileResponse profile = UserProfileResponse.from(user);

        // Inject stats
        long posted  = animalService.getByUser(user.getUsername()).size();
        long adopted = animalService.getAdoptedByUser(user.getUsername()).size();
        profile.setAnimalsPosted(posted);
        profile.setAdoptionsCompleted(adopted);

        return ResponseEntity.ok(ApiResponse.success("Profile loaded", profile));
    }

    @Operation(summary = "Get all users — Admin only")
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<ApiResponse<List<UserProfileResponse>>> getAllUsers() {
        List<UserProfileResponse> users = userRepository.findAllWithRoles().stream()
                .map(user -> {
                    UserProfileResponse profile = UserProfileResponse.from(user);
                    long posted  = animalService.getByUser(user.getUsername()).size();
                    long adopted = animalService.getAdoptedByUser(user.getUsername()).size();
                    profile.setAnimalsPosted(posted);
                    profile.setAdoptionsCompleted(adopted);
                    return profile;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("All users retrieved successfully", users));
    }

    @Operation(summary = "Suspend a user — Admin only")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/suspend")
    public ResponseEntity<ApiResponse<UserProfileResponse>> suspendUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
        user.setAccountLocked(true);
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success("User suspended successfully", UserProfileResponse.from(user)));
    }

    @Operation(summary = "Activate a user — Admin only")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/activate")
    public ResponseEntity<ApiResponse<UserProfileResponse>> activateUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
        user.setAccountLocked(false);
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success("User activated successfully", UserProfileResponse.from(user)));
    }

    @Operation(summary = "Delete a user — Admin only")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
        
        boolean isAdmin = user.getRoles().stream().anyMatch(role -> role.getName().equals("ROLE_ADMIN"));
        if (isAdmin) {
            throw new com.animalwelfare.exception.BusinessException("Cannot delete an Administrator account.");
        }
        
        processUserPurge(user);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully", null));
    }

    @Operation(summary = "Delete my account (GDPR Right to be Forgotten)")
    @Transactional
    @DeleteMapping("/me")
    public ResponseEntity<ApiResponse<Void>> deleteMe(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", userDetails.getUsername()));
        
        boolean isAdmin = user.getRoles().stream().anyMatch(role -> role.getName().equals("ROLE_ADMIN"));
        if (isAdmin) {
            throw new com.animalwelfare.exception.BusinessException("Cannot delete an Administrator account.");
        }
        
        processUserPurge(user);
        return ResponseEntity.ok(ApiResponse.success("Your account has been deleted/anonymized successfully", null));
    }

    private void processUserPurge(User user) {
        // 1. Revoke all refresh tokens
        refreshTokenRepository.revokeAllUserTokens(user);

        // 2. Check if user has active database records
        long postsCount = animalRepository.countByPostedBy(user);
        long requestsCount = adoptionRequestRepository.countByRequester(user);

        if (postsCount > 0 || requestsCount > 0) {
            // Anonymize user to satisfy GDPR without breaking foreign keys
            user.setFirstName("Redacted");
            user.setLastName("User");
            user.setEmail("redacted-" + user.getId() + "@animalwelfare.org");
            user.setUsername("deleted_user_" + user.getId());
            user.setPassword("{noop}redacted_password_" + java.util.UUID.randomUUID().toString());
            user.setAccountLocked(true);
            userRepository.save(user);
        } else {
            // Delete completely
            userRepository.delete(user);
        }
    }
}
