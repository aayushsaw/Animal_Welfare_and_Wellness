package com.animalwelfare.api.dto.adoption;

import com.animalwelfare.domain.model.AdoptionRequest;

import java.time.LocalDateTime;

/** Response DTO for AdoptionRequest entity. */
public class AdoptionResponse {

    private Long id;
    private Long animalId;
    private String animalName;
    private String animalCategory;
    private String primaryImageUrl;
    private Long requesterId;
    private String requesterUsername;
    private String status;
    private String message;
    private String reviewNote;
    private String reviewerUsername;
    private LocalDateTime reviewedAt;
    private LocalDateTime createdAt;

    public static AdoptionResponse from(AdoptionRequest req) {
        AdoptionResponse r     = new AdoptionResponse();
        r.id                   = req.getId();
        r.status               = req.getStatus().name();
        r.message              = req.getMessage();
        r.reviewNote           = req.getReviewNote();
        r.reviewedAt           = req.getReviewedAt();
        r.createdAt            = req.getCreatedAt();

        if (req.getAnimal() != null) {
            r.animalId         = req.getAnimal().getId();
            r.animalName       = req.getAnimal().getName();
            r.animalCategory   = req.getAnimal().getCategory();
            r.primaryImageUrl  = req.getAnimal().getPrimaryImageUrl();
        }
        if (req.getRequester() != null) {
            r.requesterId      = req.getRequester().getId();
            r.requesterUsername = req.getRequester().getUsername();
        }
        if (req.getReviewer() != null) {
            r.reviewerUsername = req.getReviewer().getUsername();
        }
        return r;
    }

    // Getters
    public Long getId()                  { return id; }
    public Long getAnimalId()            { return animalId; }
    public String getAnimalName()        { return animalName; }
    public String getAnimalCategory()    { return animalCategory; }
    public String getPrimaryImageUrl()   { return primaryImageUrl; }
    public Long getRequesterId()         { return requesterId; }
    public String getRequesterUsername() { return requesterUsername; }
    public String getStatus()            { return status; }
    public String getMessage()           { return message; }
    public String getReviewNote()        { return reviewNote; }
    public String getReviewerUsername()  { return reviewerUsername; }
    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public LocalDateTime getCreatedAt()  { return createdAt; }
}
