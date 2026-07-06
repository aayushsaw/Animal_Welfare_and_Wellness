package com.animalwelfare.api.dto.animal;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

/**
 * Request DTO for creating or updating an animal listing.
 * Images are handled separately via multipart endpoints.
 */
public class AnimalRequest {

    @Size(max = 100)
    private String name;

    @NotBlank(message = "Category is required (e.g. DOG, CAT, RABBIT)")
    private String category;

    @Size(max = 100)
    private String breed;

    @Positive(message = "Age in months must be a positive number")
    private Integer ageMonths;

    private String gender;      // MALE, FEMALE, UNKNOWN

    @Size(max = 100)
    private String color;

    @NotBlank(message = "Location is required")
    @Size(max = 255, message = "Location must not exceed 255 characters")
    private String location;

    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;

    @Size(max = 100)
    private String healthStatus;

    private boolean vaccinated = false;
    private boolean neutered   = false;

    // Getters
    public String getName()         { return name; }
    public String getCategory()     { return category; }
    public String getBreed()        { return breed; }
    public Integer getAgeMonths()   { return ageMonths; }
    public String getGender()       { return gender; }
    public String getColor()        { return color; }
    public String getLocation()     { return location; }
    public String getDescription()  { return description; }
    public String getHealthStatus() { return healthStatus; }
    public boolean isVaccinated()   { return vaccinated; }
    public boolean isNeutered()     { return neutered; }

    // Setters
    public void setName(String v)         { this.name = v; }
    public void setCategory(String v)     { this.category = v; }
    public void setBreed(String v)        { this.breed = v; }
    public void setAgeMonths(Integer v)   { this.ageMonths = v; }
    public void setGender(String v)       { this.gender = v; }
    public void setColor(String v)        { this.color = v; }
    public void setLocation(String v)     { this.location = v; }
    public void setDescription(String v)  { this.description = v; }
    public void setHealthStatus(String v) { this.healthStatus = v; }
    public void setVaccinated(boolean v)  { this.vaccinated = v; }
    public void setNeutered(boolean v)    { this.neutered = v; }
}
