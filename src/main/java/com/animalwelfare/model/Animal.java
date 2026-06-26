package com.animalwelfare.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Animal entity - represents a stray animal posted for adoption.
 */
@Entity
@Table(name = "animals")
@Data
@NoArgsConstructor
public class Animal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Category is required")
    @Column(nullable = false)
    private String category;

    @Column
    private String subcategory;

    @NotBlank(message = "Location is required")
    @Column(nullable = false)
    private String location;

    @Column
    private String color;

    @Column(length = 1000)
    private String description;

    @Column(name = "image_path")
    private String imagePath;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AnimalStatus status = AnimalStatus.AVAILABLE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "posted_by_id")
    private User postedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "adopted_by_id")
    private User adoptedBy;

    @Column(name = "posted_at")
    private LocalDateTime postedAt;

    @Column(name = "adopted_at")
    private LocalDateTime adoptedAt;

    @PrePersist
    protected void onCreate() {
        postedAt = LocalDateTime.now();
    }

    public enum AnimalStatus {
        AVAILABLE, ADOPTED
    }
}
