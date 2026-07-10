package com.animalwelfare.domain.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Animal entity — the core domain object of the platform.
 *
 * Represents a stray animal available for rescue or adoption.
 *
 * Design decisions:
 * - images are a separate entity (AnimalImage) to support multiple photos per animal
 * - status is a String-backed enum stored as STRING for readability in DB
 * - postedBy is the user who reported the animal — never nulled out even after adoption
 * - health/medical fields (vaccinated, neutered) are included to support informed adoption
 * - ageMonths allows precise age representation vs vague "young/adult" strings
 */
@Entity
@Table(name = "animals", indexes = {
    @Index(name = "idx_animals_status",    columnList = "status"),
    @Index(name = "idx_animals_category",  columnList = "category"),
    @Index(name = "idx_animals_posted_by", columnList = "posted_by_id")
})
public class Animal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 100)
    private String name;

    @NotBlank
    @Column(nullable = false, length = 50)
    private String category;   // DOG, CAT, RABBIT, BIRD, OTHER

    @Column(length = 100)
    private String breed;

    @Column(name = "age_months")
    private Integer ageMonths;

    @Column(length = 10)
    private String gender;     // MALE, FEMALE, UNKNOWN

    @Column(length = 100)
    private String color;

    @NotBlank
    @Column(nullable = false, length = 255)
    private String location;

    @Column(length = 2000)
    private String description;

    @Column(name = "health_status", length = 100)
    private String healthStatus;

    @Column(nullable = false)
    private boolean vaccinated = false;

    @Column(nullable = false)
    private boolean neutered = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private AnimalStatus status = AnimalStatus.AVAILABLE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "posted_by_id", nullable = false)
    private User postedBy;

    @OneToMany(mappedBy = "animal", cascade = CascadeType.ALL,
               orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("displayOrder ASC, createdAt ASC")
    private List<AnimalImage> images = new ArrayList<>();

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
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum AnimalStatus {
        AVAILABLE, PENDING_APPROVAL, PENDING, ADOPTED, RESCUED, DECEASED, ARCHIVED
    }

    // ---- Constructors ----
    public Animal() {}

    // ---- Getters ----
    public Long getId()              { return id; }
    public String getName()          { return name; }
    public String getCategory()      { return category; }
    public String getBreed()         { return breed; }
    public Integer getAgeMonths()    { return ageMonths; }
    public String getGender()        { return gender; }
    public String getColor()         { return color; }
    public String getLocation()      { return location; }
    public String getDescription()   { return description; }
    public String getHealthStatus()  { return healthStatus; }
    public boolean isVaccinated()    { return vaccinated; }
    public boolean isNeutered()      { return neutered; }
    public AnimalStatus getStatus()  { return status; }
    public User getPostedBy()        { return postedBy; }
    public List<AnimalImage> getImages() { return images; }
    public LocalDateTime getCreatedAt()  { return createdAt; }
    public LocalDateTime getUpdatedAt()  { return updatedAt; }

    /** Returns the primary image URL, or null if no images exist */
    public String getPrimaryImageUrl() {
        return images.stream()
                .filter(AnimalImage::isPrimary)
                .findFirst()
                .map(AnimalImage::getImageUrl)
                .orElse(images.isEmpty() ? null : images.get(0).getImageUrl());
    }

    // ---- Setters ----
    public void setId(Long id)                   { this.id = id; }
    public void setName(String name)             { this.name = name; }
    public void setCategory(String category)     { this.category = category; }
    public void setBreed(String breed)           { this.breed = breed; }
    public void setAgeMonths(Integer ageMonths)  { this.ageMonths = ageMonths; }
    public void setGender(String gender)         { this.gender = gender; }
    public void setColor(String color)           { this.color = color; }
    public void setLocation(String location)     { this.location = location; }
    public void setDescription(String desc)      { this.description = desc; }
    public void setHealthStatus(String h)        { this.healthStatus = h; }
    public void setVaccinated(boolean v)         { this.vaccinated = v; }
    public void setNeutered(boolean n)           { this.neutered = n; }
    public void setStatus(AnimalStatus status)   { this.status = status; }
    public void setPostedBy(User postedBy)       { this.postedBy = postedBy; }
    public void setImages(List<AnimalImage> imgs){ this.images = imgs; }

    public void addImage(AnimalImage image) {
        image.setAnimal(this);
        this.images.add(image);
    }
}
