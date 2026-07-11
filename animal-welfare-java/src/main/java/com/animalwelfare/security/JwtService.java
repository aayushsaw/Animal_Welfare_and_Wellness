package com.animalwelfare.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * JwtService — handles all JWT token operations.
 *
 * Responsibilities:
 * - Generate access tokens with user claims (roles, userId)
 * - Validate token signature and expiry
 * - Extract claims for downstream use
 *
 * Security:
 * - HS256 algorithm with a ≥256-bit secret (set via environment variable)
 * - Access tokens are short-lived (default: 15 minutes)
 * - Refresh tokens are long-lived (default: 7 days) and stored in DB
 */
@Service
public class JwtService {

    private final Environment env;

    @Value("${app.jwt.secret}")
    private String secretKey;

    @Value("${app.jwt.expiration-ms}")
    private long jwtExpirationMs;

    public JwtService(Environment env) {
        this.env = env;
    }

    @PostConstruct
    public void validateKey() {
        if (secretKey == null || secretKey.isBlank()) {
            throw new IllegalStateException("JWT Secret Key (JWT_SECRET) is not configured! The application cannot start.");
        }
        boolean isProd = java.util.Arrays.asList(env.getActiveProfiles()).contains("prod");
        if (isProd && secretKey.contains("ThisIsAVeryLongSecretKey")) {
            throw new IllegalStateException("JWT Secret Key (JWT_SECRET) is still set to the default fallback in production profile! Change the secret key immediately.");
        }
    }

    public String generateToken(UserDetails userDetails) {
        return generateToken(new HashMap<>(), userDetails);
    }

    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return Jwts.builder()
                .claims(extraClaims)
                .subject(userDetails.getUsername())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(getSigningKey())
                .compact();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(
            java.util.Base64.getEncoder().encodeToString(secretKey.getBytes())
        );
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
