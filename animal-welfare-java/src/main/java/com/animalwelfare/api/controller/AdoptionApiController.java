package com.animalwelfare.api.controller;

import com.animalwelfare.api.dto.adoption.AdoptionResponse;
import com.animalwelfare.api.dto.adoption.AdoptionReviewRequest;
import com.animalwelfare.api.response.ApiResponse;
import com.animalwelfare.api.response.PagedResponse;
import com.animalwelfare.service.AdoptionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Adoption API — /api/v1/adoptions
 *
 * User endpoints:
 *   GET  /my             — my adoption requests
 *   DELETE /{id}/cancel  — cancel my pending request
 *
 * Admin/Volunteer endpoints:
 *   GET  /               — all requests (filterable by status)
 *   PUT  /{id}/review    — approve or reject a request
 */
@Tag(name = "Adoptions", description = "Adoption request workflow management")
@RestController
@RequestMapping("/api/v1/adoptions")
@SecurityRequirement(name = "bearerAuth")
public class AdoptionApiController {

    private final AdoptionService adoptionService;

    public AdoptionApiController(AdoptionService adoptionService) {
        this.adoptionService = adoptionService;
    }

    @Operation(summary = "Get all adoption requests submitted by the current user")
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<AdoptionResponse>>> getMyRequests(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<AdoptionResponse> requests = adoptionService.getMyRequests(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(requests));
    }

    @Operation(summary = "Cancel a pending adoption request")
    @DeleteMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<Void>> cancelRequest(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        adoptionService.cancelRequest(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Adoption request cancelled"));
    }

    @Operation(summary = "List all adoption requests — Admin/Volunteer only")
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'VOLUNTEER')")
    public ResponseEntity<ApiResponse<PagedResponse<AdoptionResponse>>> getAllRequests(
            @RequestParam(defaultValue = "PENDING") String status,
            @RequestParam(defaultValue = "0")       int page,
            @RequestParam(defaultValue = "20")      int size) {
        PagedResponse<AdoptionResponse> data = adoptionService.getAllByStatus(status, page, size);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @Operation(summary = "Approve or reject an adoption request — Admin/Volunteer only")
    @PutMapping("/{id}/review")
    @PreAuthorize("hasAnyRole('ADMIN', 'VOLUNTEER')")
    public ResponseEntity<ApiResponse<AdoptionResponse>> reviewRequest(
            @PathVariable Long id,
            @Valid @RequestBody AdoptionReviewRequest review,
            @AuthenticationPrincipal UserDetails userDetails) {
        AdoptionResponse response = adoptionService.reviewRequest(id, review, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Adoption request " + review.getDecision().toLowerCase(), response));
    }
}
