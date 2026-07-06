package com.animalwelfare.security;

import com.animalwelfare.domain.model.User;
import com.animalwelfare.domain.repository.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Collectors;

/**
 * UserDetailsServiceImpl — bridges our User entity with Spring Security.
 *
 * Loads users with their roles in a single query using JOIN FETCH
 * to avoid lazy loading issues and N+1 problems.
 *
 * Roles are mapped to GrantedAuthority so Spring Security's
 * @PreAuthorize, hasRole(), etc. work correctly.
 */
@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    public UserDetailsServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsernameWithRoles(username)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "User not found with username: " + username));

        var authorities = user.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority(role.getName()))
                .collect(Collectors.toSet());

        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                !user.isAccountLocked(),   // enabled
                true,                       // accountNonExpired
                true,                       // credentialsNonExpired
                !user.isAccountLocked(),   // accountNonLocked
                authorities
        );
    }
}
