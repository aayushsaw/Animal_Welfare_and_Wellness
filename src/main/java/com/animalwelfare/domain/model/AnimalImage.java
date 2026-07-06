package com.animalwelfare.domain.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * AnimalImage entity — supports multiple images per animal.
 *
 * Design decisions:
 * - publicId stores the Cloudinary public_id for deletion/transformation
 * - isPrimary flags which image is shown in cards/thumbnails
 * - displayOrder allows manual reordering
 * - For local/dev assets, imageUrl points to /assets/stray_animals/strayN.jpg
 * - For production uploads, imageUrl is a full Cloudinary CDN URL
 */
@Entity
@Table(name = "animal_images", indexes = {
    @Index(name = "idx_animal_images_animal", columnList = "animal_id")
})
public class AnimalImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "animal_id", nullable = false)
    private Animal animal;

    @Column(name = "image_url", nullable = false, length = 500)
    private String imageUrl;

    // Cloudinary public_id — used for deletion and transformations
    @Column(name = "public_id", length = 255)
    private String publicId;

    @Column(name = "is_primary", nullable = false)
    private boolean isPrimary = false;

    @Column(name = "display_order", nullable = false)
    private int displayOrder = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); }

    // ---- Constructors ----
    public AnimalImage() {}

    public AnimalImage(String imageUrl, String publicId, boolean isPrimary) {
        this.imageUrl  = imageUrl;
        this.publicId  = publicId;
        this.isPrimary = isPrimary;
    }

    // ---- Getters ----
    public Long getId()           { return id; }
    public Animal getAnimal()     { return animal; }
    public String getImageUrl()   { return imageUrl; }
    public String getPublicId()   { return publicId; }
    public boolean isPrimary()    { return isPrimary; }
    public int getDisplayOrder()  { return displayOrder; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    // ---- Setters ----
    public void setId(Long id)              { this.id = id; }
    public void setAnimal(Animal animal)    { this.animal = animal; }
    public void setImageUrl(String url)     { this.imageUrl = url; }
    public void setPublicId(String pid)     { this.publicId = pid; }
    public void setPrimary(boolean primary) { this.isPrimary = primary; }
    public void setDisplayOrder(int order)  { this.displayOrder = order; }
}
