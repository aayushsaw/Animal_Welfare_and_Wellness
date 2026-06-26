package com.animalwelfare.service;

import com.animalwelfare.dto.RegistrationDto;
import com.animalwelfare.model.User;
import com.animalwelfare.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Spy
    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @InjectMocks
    private UserService userService;

    private RegistrationDto validDto;

    @BeforeEach
    void setUp() {
        validDto = new RegistrationDto();
        validDto.setFirstName("John");
        validDto.setLastName("Doe");
        validDto.setUsername("johndoe");
        validDto.setPassword("secret123");
        validDto.setConfirmPassword("secret123");
    }

    @Test
    void register_withValidData_savesUserAndReturnsNull() {
        when(userRepository.existsByUsername("johndoe")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        String error = userService.register(validDto);

        assertThat(error).isNull();
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void register_withDuplicateUsername_returnsErrorMessage() {
        when(userRepository.existsByUsername("johndoe")).thenReturn(true);

        String error = userService.register(validDto);

        assertThat(error).contains("already taken");
        verify(userRepository, never()).save(any());
    }

    @Test
    void register_withMismatchedPasswords_returnsErrorMessage() {
        validDto.setConfirmPassword("differentpassword");

        String error = userService.register(validDto);

        assertThat(error).contains("do not match");
        verify(userRepository, never()).save(any());
    }

    @Test
    void findByUsername_whenUserExists_returnsUser() {
        User user = new User("John", "Doe", "johndoe", "encodedPwd");
        when(userRepository.findByUsername("johndoe")).thenReturn(Optional.of(user));

        Optional<User> result = userService.findByUsername("johndoe");

        assertThat(result).isPresent();
        assertThat(result.get().getUsername()).isEqualTo("johndoe");
    }
}
