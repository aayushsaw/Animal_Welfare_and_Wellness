package com.animalwelfare.api.dto.animal;

import com.animalwelfare.domain.model.Animal;
import com.animalwelfare.domain.model.AnimalImage;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Response DTO for Animal.
 *
 * NEVER expose the entity directly — this controls exactly what the API returns.
 * Flattens nested relationships (postedBy → just username/id) to avoid
 * circular references and over-fetching.
 */
public class AnimalResponse {

    private Long id;
    private String name;
    private String category;
    private String breed;
    private Integer ageMonths;
    private String gender;
    private String color;
    private String location;
    private String description;
    private String healthStatus;
    private boolean vaccinated;
    private boolean neutered;
    private String status;
    private String primaryImageUrl;
    private List<ImageInfo> images;
    private PostedByInfo postedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // ---- Static factory from entity ----
    public static AnimalResponse from(Animal animal) {
        AnimalResponse r = new AnimalResponse();
        r.id             = animal.getId();
        r.name           = animal.getName();
        r.category       = animal.getCategory();
        r.breed          = animal.getBreed();
        r.ageMonths      = animal.getAgeMonths();
        r.gender         = animal.getGender();
        r.color          = animal.getColor();
        r.location       = animal.getLocation();
        r.description    = animal.getDescription();
        r.healthStatus   = animal.getHealthStatus();
        r.vaccinated     = animal.isVaccinated();
        r.neutered       = animal.isNeutered();
        r.status         = animal.getStatus() != null ? animal.getStatus().name() : null;
        r.primaryImageUrl = animal.getPrimaryImageUrl();
        r.createdAt      = animal.getCreatedAt();
        r.updatedAt      = animal.getUpdatedAt();

        r.images = animal.getImages().stream()
                .map(ImageInfo::from)
                .collect(Collectors.toList());

        if (animal.getPostedBy() != null) {
            r.postedBy = PostedByInfo.from(animal.getPostedBy());
        }
        return r;
    }

    // ---- Nested DTOs ----
    public static class ImageInfo {
        private Long id;
        private String imageUrl;
        private boolean isPrimary;
        private int displayOrder;

        public static ImageInfo from(AnimalImage img) {
            ImageInfo i  = new ImageInfo();
            i.id         = img.getId();
            i.imageUrl   = img.getImageUrl();
            i.isPrimary  = img.isPrimary();
            i.displayOrder = img.getDisplayOrder();
            return i;
        }
        public Long getId()          { return id; }
        public String getImageUrl()  { return imageUrl; }
        public boolean isPrimary()   { return isPrimary; }
        public int getDisplayOrder() { return displayOrder; }
    }

    public static class PostedByInfo {
        private Long id;
        private String username;
        private String fullName;

        public static PostedByInfo from(com.animalwelfare.domain.model.User user) {
            PostedByInfo p = new PostedByInfo();
            p.id       = user.getId();
            p.username = user.getUsername();
            p.fullName = user.getFullName();
            return p;
        }
        public Long getId()        { return id; }
        public String getUsername(){ return username; }
        public String getFullName(){ return fullName; }
    }

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
    public String getStatus()        { return status; }
    public String getPrimaryImageUrl(){ return primaryImageUrl; }
    public List<ImageInfo> getImages(){ return images; }
    public PostedByInfo getPostedBy() { return postedBy; }
    public LocalDateTime getCreatedAt(){ return createdAt; }
    public LocalDateTime getUpdatedAt(){ return updatedAt; }
}
