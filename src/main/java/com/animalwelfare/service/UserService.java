package com.animalwelfare.service;

import com.animalwelfare.dto.RegistrationDto;
import com.animalwelfare.model.User;
import com.animalwelfare.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Optional;

/**
 * UserService handles registration, lookup, and Spring Security integration.
 * Implements UserDetailsService so Spring Security loads users from the DB.
 */
@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                new ArrayList<>()
        );
    }

    /**
     * Register a new user. Returns an error message, or null on success.
     */
    @Transactional
    public String register(RegistrationDto dto) {
        if (!dto.passwordsMatch()) {
            return "Passwords do not match";
        }
        if (userRepository.existsByUsername(dto.getUsername())) {
            return "Username '" + dto.getUsername() + "' is already taken";
        }

        User user = new User(
                dto.getFirstName(),
                dto.getLastName(),
                dto.getUsername(),
                passwordEncoder.encode(dto.getPassword())
        );
        userRepository.save(user);
        return null;
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }
}
