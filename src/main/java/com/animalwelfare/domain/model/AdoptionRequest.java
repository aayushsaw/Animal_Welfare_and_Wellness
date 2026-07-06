package com.animalwelfare.domain.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * AdoptionRequest — models the full adoption workflow.
 *
 * Replaces the original "click-to-adopt" direct status change.
 * Every adoption now has an audit trail with requester, reviewer,
 * message, decision note, and timestamps.
 *
 * Status transitions:
 *   PENDING → APPROVED  (admin/volunteer reviews)
 *   PENDING → REJECTED  (admin/volunteer reviews)
 *   APPROVED → (animal status becomes ADOPTED)
 *
 * Design decisions:
 * - Unique partial index prevents duplicate PENDING requests
 *   (same user cannot have two pending requests for same animal)
 * - reviewer is nullable — populated only when decision is made
 * - message lets adopter explain their situation
 * - reviewNote lets admin give feedback on rejection
 */
@Entity
@Table(name = "adoption_requests", indexes = {
    @Index(name = "idx_adoption_animal",    columnList = "animal_id"),
    @Index(name = "idx_adoption_requester", columnList = "requester_id"),
    @Index(name = "idx_adoption_status",    columnList = "status")
})
public class AdoptionRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "animal_id", nullable = false)
    private Animal animal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_id", nullable = false)
    private User requester;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private AdoptionStatus status = AdoptionStatus.PENDING;

    @Column(length = 1000)
    private String message;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id")
    private User reviewer;

    @Column(name = "review_note", length = 500)
    private String reviewNote;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() { updatedAt = LocalDateTime.now(); }

    public enum AdoptionStatus {
        PENDING, APPROVED, REJECTED, CANCELLED
    }

    // ---- Constructors ----
    public AdoptionRequest() {}

    // ---- Getters ----
    public Long getId()                   { return id; }
    public Animal getAnimal()             { return animal; }
    public User getRequester()            { return requester; }
    public AdoptionStatus getStatus()     { return status; }
    public String getMessage()            { return message; }
    public User getReviewer()             { return reviewer; }
    public String getReviewNote()         { return reviewNote; }
    public LocalDateTime getReviewedAt()  { return reviewedAt; }
    public LocalDateTime getCreatedAt()   { return createdAt; }
    public LocalDateTime getUpdatedAt()   { return updatedAt; }

    // ---- Setters ----
    public void setId(Long id)                       { this.id = id; }
    public void setAnimal(Animal animal)             { this.animal = animal; }
    public void setRequester(User requester)         { this.requester = requester; }
    public void setStatus(AdoptionStatus status)     { this.status = status; }
    public void setMessage(String message)           { this.message = message; }
    public void setReviewer(User reviewer)           { this.reviewer = reviewer; }
    public void setReviewNote(String reviewNote)     { this.reviewNote = reviewNote; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }
}
