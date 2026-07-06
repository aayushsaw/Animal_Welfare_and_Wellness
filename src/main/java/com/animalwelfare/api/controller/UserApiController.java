package com.animalwelfare.api.controller;

import com.animalwelfare.api.dto.user.UserProfileResponse;
import com.animalwelfare.api.response.ApiResponse;
import com.animalwelfare.domain.model.User;
import com.animalwelfare.domain.repository.UserRepository;
import com.animalwelfare.exception.ResourceNotFoundException;
import com.animalwelfare.service.AnimalService;import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

/**
 * User API — /api/v1/users
 *
 *   GET /me        — current user's full profile with stats
 *   GET /{username} — public profile (username, join date — no sensitive data)
 */
@Tag(name = "Users", description = "User profile and dashboard data")
@RestController
@RequestMapping("/api/v1/users")
@SecurityRequirement(name = "bearerAuth")
public class UserApiController {

    private final UserRepository userRepository;
    private final AnimalService animalService;

    public UserApiController(UserRepository userRepository, AnimalService animalService) {
        this.userRepository = userRepository;
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
}
