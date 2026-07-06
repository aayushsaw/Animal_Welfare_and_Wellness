package com.animalwelfare.service;

import com.animalwelfare.api.dto.auth.AuthResponse;
import com.animalwelfare.api.dto.auth.LoginRequest;
import com.animalwelfare.api.dto.auth.RegisterRequest;
import com.animalwelfare.domain.model.RefreshToken;
import com.animalwelfare.domain.model.Role;
import com.animalwelfare.domain.model.User;
import com.animalwelfare.domain.repository.RefreshTokenRepository;
import com.animalwelfare.domain.repository.RoleRepository;
import com.animalwelfare.domain.repository.UserRepository;
import com.animalwelfare.exception.BusinessException;
import com.animalwelfare.exception.DuplicateResourceException;
import com.animalwelfare.exception.ResourceNotFoundException;
import com.animalwelfare.security.JwtService;
import com.animalwelfare.security.UserDetailsServiceImpl;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * AuthService — handles registration, login, token refresh, and logout.
 *
 * Business rules:
 * - Username and email must be unique across all users
 * - New users always get ROLE_USER; admin role requires manual assignment
 * - Access tokens are short-lived JWT (15 min default)
 * - Refresh tokens are stored in DB for revocation support
 * - Logout revokes all refresh tokens for that user
 */
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsServiceImpl userDetailsService;

    @Value("${app.jwt.refresh-expiration-ms}")
    private long refreshExpirationMs;

    public AuthService(UserRepository userRepository,
                       RoleRepository roleRepository,
                       RefreshTokenRepository refreshTokenRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       AuthenticationManager authenticationManager,
                       UserDetailsServiceImpl userDetailsService) {
        this.userRepository        = userRepository;
        this.roleRepository        = roleRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder       = passwordEncoder;
        this.jwtService            = jwtService;
        this.authenticationManager = authenticationManager;
        this.userDetailsService    = userDetailsService;
    }

    /** Register a new user — validates uniqueness, hashes password, assigns USER role. */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException("Username '" + request.getUsername() + "' is already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email '" + request.getEmail() + "' is already registered");
        }

        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseThrow(() -> new ResourceNotFoundException("Default role ROLE_USER not found. Run Flyway migrations."));

        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.addRole(userRole);

        userRepository.save(user);

        return buildAuthResponse(user);
    }

    /** Authenticate credentials, return JWT access + refresh tokens. */
    @Transactional
    public AuthResponse login(LoginRequest request) {
        // Spring Security validates credentials — throws BadCredentialsException on failure
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(), request.getPassword()));

        User user = userRepository.findByUsernameWithRoles(request.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", request.getUsername()));

        return buildAuthResponse(user);
    }

    /** Rotate refresh token — revoke old, issue new access + refresh tokens. */
    @Transactional
    public AuthResponse refreshToken(String token) {
        RefreshToken refreshToken = refreshTokenRepository
                .findByTokenAndRevokedFalse(token)
                .orElseThrow(() -> new BusinessException("Invalid or expired refresh token"));

        if (!refreshToken.isValid()) {
            refreshToken.setRevoked(true);
            refreshTokenRepository.save(refreshToken);
            throw new BusinessException("Refresh token has expired. Please log in again.");
        }

        // Revoke used token (rotation)
        refreshToken.setRevoked(true);
        refreshTokenRepository.save(refreshToken);

        User user = refreshToken.getUser();
        return buildAuthResponse(user);
    }

    /** Revoke all refresh tokens for the user — effectively logs out all sessions. */
    @Transactional
    public void logout(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
        refreshTokenRepository.revokeAllUserTokens(user);
    }

    // ---- Private helpers ----

    private AuthResponse buildAuthResponse(User user) {
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        String accessToken      = jwtService.generateToken(userDetails);
        String newRefreshToken  = createRefreshToken(user);

        Set<String> roles = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toSet());

        return AuthResponse.of(
                accessToken, newRefreshToken,
                user.getId(), user.getUsername(),
                user.getEmail(), user.getFullName(),
                roles
        );
    }

    private String createRefreshToken(User user) {
        String tokenValue  = UUID.randomUUID().toString();
        LocalDateTime exp  = LocalDateTime.now().plusNanos(refreshExpirationMs * 1_000_000L);
        RefreshToken token = new RefreshToken(user, tokenValue, exp);
        refreshTokenRepository.save(token);
        return tokenValue;
    }
}
