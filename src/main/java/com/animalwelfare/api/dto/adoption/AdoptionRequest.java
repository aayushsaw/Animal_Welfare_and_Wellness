package com.animalwelfare.api.dto.adoption;

import jakarta.validation.constraints.Size;

/** Request body when a user submits an adoption request. */
public class AdoptionRequest {

    @Size(max = 1000, message = "Message must not exceed 1000 characters")
    private String message;

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
