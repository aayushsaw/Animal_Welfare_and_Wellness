package com.animalwelfare.domain.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Core User entity.
 *
 * Represents every person on the platform — adopters, volunteers, NGO staff,
 * and admins. Roles drive all access control decisions.
 *
 * Design decisions:
 * - email is the canonical identity field (username is an alias for display)
 * - password is always BCrypt-hashed, never stored plain
 * - roles use a join table (user_roles) for clean M:N — no enum coupling
 * - accountLocked supports admin moderation without data deletion
 */
@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_users_username", columnList = "username"),
    @Index(name = "idx_users_email",    columnList = "email")
})
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @NotBlank
    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @NotBlank
    @Size(min = 3, max = 50)
    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @NotBlank
    @Email
    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @NotBlank
    @Column(nullable = false)
    private String password;

    @Column(name = "email_verified", nullable = false)
    private boolean emailVerified = false;

    @Column(name = "account_locked", nullable = false)
    private boolean accountLocked = false;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "user_roles",
        joinColumns        = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles = new HashSet<>();

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

    // ---- Constructors ----
    public User() {}

    // ---- Getters ----
    public Long getId()             { return id; }
    public String getFirstName()    { return firstName; }
    public String getLastName()     { return lastName; }
    public String getUsername()     { return username; }
    public String getEmail()        { return email; }
    public String getPassword()     { return password; }
    public boolean isEmailVerified(){ return emailVerified; }
    public boolean isAccountLocked(){ return accountLocked; }
    public Set<Role> getRoles()     { return roles; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public String getFullName() { return firstName + " " + lastName; }

    // ---- Setters ----
    public void setId(Long id)                   { this.id = id; }
    public void setFirstName(String firstName)   { this.firstName = firstName; }
    public void setLastName(String lastName)      { this.lastName = lastName; }
    public void setUsername(String username)      { this.username = username; }
    public void setEmail(String email)            { this.email = email; }
    public void setPassword(String password)      { this.password = password; }
    public void setEmailVerified(boolean v)       { this.emailVerified = v; }
    public void setAccountLocked(boolean locked)  { this.accountLocked = locked; }
    public void setRoles(Set<Role> roles)         { this.roles = roles; }

    public void addRole(Role role) { this.roles.add(role); }
}
