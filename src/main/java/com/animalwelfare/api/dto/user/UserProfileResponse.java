package com.animalwelfare.api.dto.user;

import com.animalwelfare.domain.model.User;

import java.time.LocalDateTime;
import java.util.Set;

/** Safe user profile — never exposes password or sensitive fields. */
public class UserProfileResponse {

    private Long id;
    private String firstName;
    private String lastName;
    private String username;
    private String email;
    private Set<String> roles;
    private boolean emailVerified;
    private LocalDateTime createdAt;
    private long animalsPosted;
    private long adoptionsCompleted;

    public static UserProfileResponse from(User user) {
        UserProfileResponse r = new UserProfileResponse();
        r.id            = user.getId();
        r.firstName     = user.getFirstName();
        r.lastName      = user.getLastName();
        r.username      = user.getUsername();
        r.email         = user.getEmail();
        r.emailVerified = user.isEmailVerified();
        r.createdAt     = user.getCreatedAt();
        r.roles         = user.getRoles().stream()
                .map(role -> role.getName().replace("ROLE_", ""))
                .collect(java.util.stream.Collectors.toSet());
        return r;
    }

    // Getters
    public Long getId()                  { return id; }
    public String getFirstName()         { return firstName; }
    public String getLastName()          { return lastName; }
    public String getUsername()          { return username; }
    public String getEmail()             { return email; }
    public Set<String> getRoles()        { return roles; }
    public boolean isEmailVerified()     { return emailVerified; }
    public LocalDateTime getCreatedAt()  { return createdAt; }
    public long getAnimalsPosted()       { return animalsPosted; }
    public long getAdoptionsCompleted()  { return adoptionsCompleted; }

    // Setters for stats
    public void setAnimalsPosted(long v)      { this.animalsPosted = v; }
    public void setAdoptionsCompleted(long v) { this.adoptionsCompleted = v; }
}
