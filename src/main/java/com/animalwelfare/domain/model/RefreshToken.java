package com.animalwelfare.domain.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * RefreshToken entity — enables JWT refresh token rotation.
 *
 * Design decisions:
 * - stored in DB (not stateless) so we can revoke on logout/compromise
 * - revoked flag avoids hard deletes — provides audit trail
 * - all tokens for a user are revoked on logout or password change
 */
@Entity
@Table(name = "refresh_tokens", indexes = {
    @Index(name = "idx_refresh_token", columnList = "token", unique = true)
})
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, unique = true, length = 512)
    private String token;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(nullable = false)
    private boolean revoked = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); }

    // ---- Constructors ----
    public RefreshToken() {}

    public RefreshToken(User user, String token, LocalDateTime expiresAt) {
        this.user      = user;
        this.token     = token;
        this.expiresAt = expiresAt;
    }

    // ---- Getters ----
    public Long getId()                  { return id; }
    public User getUser()                { return user; }
    public String getToken()             { return token; }
    public LocalDateTime getExpiresAt()  { return expiresAt; }
    public boolean isRevoked()           { return revoked; }
    public LocalDateTime getCreatedAt()  { return createdAt; }

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }

    public boolean isValid() {
        return !revoked && !isExpired();
    }

    // ---- Setters ----
    public void setRevoked(boolean revoked) { this.revoked = revoked; }
}
