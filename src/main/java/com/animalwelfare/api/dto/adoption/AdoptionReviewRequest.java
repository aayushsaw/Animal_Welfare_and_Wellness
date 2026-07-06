package com.animalwelfare.api.dto.adoption;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Request body when an admin/volunteer reviews an adoption request. */
public class AdoptionReviewRequest {

    @NotBlank(message = "Decision is required")
    @Pattern(regexp = "APPROVED|REJECTED", message = "Decision must be APPROVED or REJECTED")
    private String decision;

    @Size(max = 500, message = "Review note must not exceed 500 characters")
    private String reviewNote;

    public String getDecision()    { return decision; }
    public String getReviewNote()  { return reviewNote; }
    public void setDecision(String v)   { this.decision = v; }
    public void setReviewNote(String v) { this.reviewNote = v; }
}
