package com.animalwelfare.service;

import com.animalwelfare.api.dto.auth.RegisterRequest;
import com.animalwelfare.domain.model.Role;
import com.animalwelfare.domain.model.User;
import com.animalwelfare.domain.repository.RefreshTokenRepository;
import com.animalwelfare.domain.repository.RoleRepository;
import com.animalwelfare.domain.repository.UserRepository;
import com.animalwelfare.exception.DuplicateResourceException;
import com.animalwelfare.exception.ResourceNotFoundException;
import com.animalwelfare.security.JwtService;
import com.animalwelfare.security.UserDetailsServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock UserRepository userRepository;
    @Mock RoleRepository roleRepository;
    @Mock RefreshTokenRepository refreshTokenRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock JwtService jwtService;
    @Mock AuthenticationManager authenticationManager;
    @Mock UserDetailsServiceImpl userDetailsService;
    @InjectMocks AuthService authService;

    private RegisterRequest validRequest;

    @BeforeEach
    void setUp() {
        validRequest = new RegisterRequest();
        validRequest.setFirstName("John");
        validRequest.setLastName("Doe");
        validRequest.setUsername("johndoe");
        validRequest.setEmail("john@example.com");
        validRequest.setPassword("password123");
    }

    @Test
    void register_withDuplicateUsername_throwsDuplicateResourceException() {
        when(userRepository.existsByUsername("johndoe")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(validRequest))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("johndoe");

        verify(userRepository, never()).save(any());
    }

    @Test
    void register_withDuplicateEmail_throwsDuplicateResourceException() {
        when(userRepository.existsByUsername("johndoe")).thenReturn(false);
        when(userRepository.existsByEmail("john@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(validRequest))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("john@example.com");
    }

    @Test
    void register_withNoRoleInDb_throwsResourceNotFoundException() {
        when(userRepository.existsByUsername(anyString())).thenReturn(false);
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(roleRepository.findByName("ROLE_USER")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.register(validRequest))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("ROLE_USER");
    }

    @Test
    void register_withValidData_savesUser() {
        Role userRole = new Role("ROLE_USER");
        User savedUser = new User();
        savedUser.setId(1L);
        savedUser.setUsername("johndoe");
        savedUser.setEmail("john@example.com");
        savedUser.setFirstName("John");
        savedUser.setLastName("Doe");
        savedUser.setPassword("encoded");
        savedUser.addRole(userRole);

        when(userRepository.existsByUsername(anyString())).thenReturn(false);
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(roleRepository.findByName("ROLE_USER")).thenReturn(Optional.of(userRole));
        when(passwordEncoder.encode(anyString())).thenReturn("encoded");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(userDetailsService.loadUserByUsername(anyString()))
                .thenReturn(new org.springframework.security.core.userdetails.User(
                        "johndoe", "encoded", java.util.List.of()));
        when(jwtService.generateToken(any())).thenReturn("mock-jwt-token");
        when(refreshTokenRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        var response = authService.register(validRequest);

        assertThat(response).isNotNull();
        assertThat(response.getUsername()).isEqualTo("johndoe");
        assertThat(response.getAccessToken()).isEqualTo("mock-jwt-token");
        verify(userRepository, times(1)).save(any(User.class));
    }
}
