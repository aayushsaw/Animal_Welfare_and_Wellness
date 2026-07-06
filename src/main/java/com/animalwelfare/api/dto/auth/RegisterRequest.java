package com.animalwelfare.api.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Registration request DTO.
 * Validated before reaching the service layer.
 */
public class RegisterRequest {

    @NotBlank(message = "First name is required")
    @Size(max = 100, message = "First name must not exceed 100 characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 100, message = "Last name must not exceed 100 characters")
    private String lastName;

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    private String username;

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    // Getters
    public String getFirstName()  { return firstName; }
    public String getLastName()   { return lastName; }
    public String getUsername()   { return username; }
    public String getEmail()      { return email; }
    public String getPassword()   { return password; }

    // Setters
    public void setFirstName(String v)  { this.firstName = v; }
    public void setLastName(String v)   { this.lastName = v; }
    public void setUsername(String v)   { this.username = v; }
    public void setEmail(String v)      { this.email = v; }
    public void setPassword(String v)   { this.password = v; }
}
