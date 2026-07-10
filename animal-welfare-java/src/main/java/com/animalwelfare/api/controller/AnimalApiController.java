package com.animalwelfare.api.controller;

import com.animalwelfare.api.dto.adoption.AdoptionRequest;
import com.animalwelfare.api.dto.adoption.AdoptionResponse;
import com.animalwelfare.api.dto.animal.AnimalRequest;
import com.animalwelfare.api.dto.animal.AnimalResponse;
import com.animalwelfare.api.response.ApiResponse;
import com.animalwelfare.api.response.PagedResponse;
import com.animalwelfare.service.AdoptionService;
import com.animalwelfare.service.AnimalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

/**
 * Animal API — /api/v1/animals
 *
 * Public (no auth):
 *   GET  /               — paginated list of available animals (filterable)
 *   GET  /{id}           — single animal details
 *   GET  /stats          — platform statistics
 *
 * Protected (JWT required):
 *   POST /               — post a stray animal
 *   PUT  /{id}           — update animal (poster or admin only)
 *   DELETE /{id}         — delete animal (poster or admin only)
 *   POST /{id}/images    — add image to animal
 *   POST /{id}/adopt     — submit adoption request
 */
@Tag(name = "Animals", description = "Browse, post, update, and adopt animals")
@RestController
@RequestMapping("/api/v1/animals")
public class AnimalApiController {

    private final AnimalService animalService;
    private final AdoptionService adoptionService;

    public AnimalApiController(AnimalService animalService, AdoptionService adoptionService) {
        this.animalService   = animalService;
        this.adoptionService = adoptionService;
    }

    // ===================== PUBLIC ENDPOINTS =====================

    @Operation(summary = "List available animals with pagination and category filter")
    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<AnimalResponse>>> getAnimals(
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "12") int size) {

        PagedResponse<AnimalResponse> data = animalService.getAvailableAnimals(category, page, size);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @Operation(summary = "Get a single animal by ID")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AnimalResponse>> getAnimal(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(animalService.getById(id)));
    }

    @Operation(summary = "Platform statistics — available, adopted, total")
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getStats() {
        return ResponseEntity.ok(ApiResponse.success(animalService.getStats()));
    }

    // ===================== PROTECTED ENDPOINTS =====================

    @Operation(summary = "Post a stray animal listing",
               security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping
    public ResponseEntity<ApiResponse<AnimalResponse>> createAnimal(
            @Valid @RequestBody AnimalRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        AnimalResponse created = animalService.create(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Animal posted successfully. Thank you for helping!", created));
    }

    @Operation(summary = "Update an animal listing (poster or admin only)",
               security = @SecurityRequirement(name = "bearerAuth"))
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AnimalResponse>> updateAnimal(
            @PathVariable Long id,
            @Valid @RequestBody AnimalRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        AnimalResponse updated = animalService.update(id, request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Animal updated successfully", updated));
    }

    @Operation(summary = "Delete an animal listing (poster or admin only)",
               security = @SecurityRequirement(name = "bearerAuth"))
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAnimal(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        animalService.delete(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Animal listing removed"));
    }

    @Operation(summary = "Upload an image for an animal",
               security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping(value = "/{id}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<AnimalResponse>> addImage(
            @PathVariable Long id,
            @RequestPart("image") MultipartFile image,
            @AuthenticationPrincipal UserDetails userDetails) throws IOException {
        AnimalResponse updated = animalService.addImage(id, image, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Image uploaded successfully", updated));
    }

    @Operation(summary = "Submit an adoption request",
               security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping("/{id}/adopt")
    public ResponseEntity<ApiResponse<com.animalwelfare.api.dto.adoption.AdoptionResponse>> requestAdoption(
            @PathVariable Long id,
            @Valid @RequestBody AdoptionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        var response = adoptionService.requestAdoption(
                id, request.getMessage(), userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Adoption request submitted successfully", response));
    }

    @Operation(summary = "Approve a pending animal listing — Admin/Volunteer only",
               security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasAnyRole('ADMIN', 'VOLUNTEER')")
    @PutMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<AnimalResponse>> approveListing(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        AnimalResponse approved = animalService.approveListing(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Animal listing approved successfully", approved));
    }

    @Operation(summary = "Get all pending animal listings — Admin/Volunteer only",
               security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasAnyRole('ADMIN', 'VOLUNTEER')")
    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<AnimalResponse>>> getPendingListings(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<AnimalResponse> pending = animalService.getPendingListings(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(pending));
    }

    // ===================== USER-SCOPED ENDPOINTS =====================

    @Operation(summary = "Get all animals posted by the authenticated user",
               security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/my-listings")
    public ResponseEntity<ApiResponse<List<AnimalResponse>>> getMyListings(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<AnimalResponse> animals = animalService.getByUser(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(animals));
    }

    @Operation(summary = "Get all animals adopted by the authenticated user",
               security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/my-adoptions")
    public ResponseEntity<ApiResponse<List<AnimalResponse>>> getMyAdoptions(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<AnimalResponse> animals = animalService.getAdoptedByUser(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(animals));
    }
}
