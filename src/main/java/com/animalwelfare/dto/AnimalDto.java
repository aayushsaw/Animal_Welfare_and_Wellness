package com.animalwelfare.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

/**
 * DTO for publishing a stray animal — includes file upload handling.
 */
@Data
public class AnimalDto {

    @NotBlank(message = "Category is required")
    private String category;

    private String subcategory;

    @NotBlank(message = "Location is required")
    private String location;

    private String color;

    private String description;

    private MultipartFile imageFile;
}
