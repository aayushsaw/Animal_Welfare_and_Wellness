package com.animalwelfare.domain.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Role entity.
 * Seeded via Flyway: ROLE_USER, ROLE_ADMIN, ROLE_VOLUNTEER
 */
@Entity
@Table(name = "roles")
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String name;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Role() {}

    public Role(String name) { this.name = name; }

    public Long getId()            { return id; }
    public String getName()        { return name; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setId(Long id)     { this.id = id; }
    public void setName(String n)  { this.name = n; }
}
