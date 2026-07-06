package com.animalwelfare.domain.repository;

import com.animalwelfare.domain.model.Role;
import com.animalwelfare.domain.model.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TestEntityManager entityManager;

    @Test
    void findByUsername_whenExists_returnsUser() {
        User user = new User();
        user.setUsername("testuser");
        user.setEmail("test@welfare.com");
        user.setPassword("pwd123");
        user.setFirstName("Test");
        user.setLastName("User");
        entityManager.persistAndFlush(user);

        Optional<User> found = userRepository.findByUsername("testuser");
        assertThat(found).isPresent();
        assertThat(found.get().getEmail()).isEqualTo("test@welfare.com");
    }

    @Test
    void existsByUsername_whenExists_returnsTrue() {
        User user = new User();
        user.setUsername("checkuser");
        user.setEmail("check@welfare.com");
        user.setPassword("pwd123");
        user.setFirstName("Check");
        user.setLastName("User");
        entityManager.persistAndFlush(user);

        boolean exists = userRepository.existsByUsername("checkuser");
        assertThat(exists).isTrue();
    }

    @Test
    void existsByUsername_whenNotExists_returnsFalse() {
        boolean exists = userRepository.existsByUsername("nonexistent");
        assertThat(exists).isFalse();
    }
}
