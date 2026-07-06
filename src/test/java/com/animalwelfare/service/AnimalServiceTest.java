package com.animalwelfare.service;

import com.animalwelfare.domain.model.Animal;
import com.animalwelfare.domain.model.Animal.AnimalStatus;
import com.animalwelfare.domain.model.User;
import com.animalwelfare.domain.repository.AnimalRepository;
import com.animalwelfare.domain.repository.UserRepository;
import com.animalwelfare.exception.BusinessException;
import com.animalwelfare.exception.ResourceNotFoundException;
import com.animalwelfare.infrastructure.ImageStorageService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AnimalServiceTest {

    @Mock AnimalRepository animalRepository;
    @Mock UserRepository userRepository;
    @Mock ImageStorageService imageStorageService;
    @InjectMocks AnimalService animalService;

    @Test
    void getById_whenExists_returnsResponse() {
        Animal animal = new Animal();
        animal.setId(1L);
        animal.setCategory("DOG");
        animal.setLocation("Mumbai");
        animal.setStatus(AnimalStatus.AVAILABLE);

        when(animalRepository.findByIdWithImages(1L)).thenReturn(Optional.of(animal));

        var response = animalService.getById(1L);
        assertThat(response.getCategory()).isEqualTo("DOG");
    }

    @Test
    void getById_whenNotFound_throwsResourceNotFoundException() {
        when(animalRepository.findByIdWithImages(99L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> animalService.getById(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void delete_whenAnimalAdopted_throwsBusinessException() {
        Animal animal = new Animal();
        animal.setStatus(AnimalStatus.ADOPTED);

        User owner = new User();
        owner.setUsername("aayush");
        owner.setPassword("pwd");
        owner.setFirstName("A");
        owner.setLastName("B");
        owner.setEmail("a@b.com");
        owner.setUsername("aayush");
        animal.setPostedBy(owner);

        when(animalRepository.findByIdWithImages(1L)).thenReturn(Optional.of(animal));
        when(userRepository.findByUsernameWithRoles("aayush")).thenReturn(Optional.of(owner));

        assertThatThrownBy(() -> animalService.delete(1L, "aayush"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("adopted");
    }

    @Test
    void getStats_returnsCorrectCounts() {
        when(animalRepository.countByStatus(AnimalStatus.AVAILABLE)).thenReturn(5L);
        when(animalRepository.countByStatus(AnimalStatus.ADOPTED)).thenReturn(3L);
        when(animalRepository.count()).thenReturn(8L);

        var stats = animalService.getStats();
        assertThat(stats.get("available")).isEqualTo(5L);
        assertThat(stats.get("adopted")).isEqualTo(3L);
        assertThat(stats.get("total")).isEqualTo(8L);
    }
}
