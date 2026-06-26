package com.animalwelfare.service;

import com.animalwelfare.model.Animal;
import com.animalwelfare.model.Animal.AnimalStatus;
import com.animalwelfare.model.User;
import com.animalwelfare.repository.AnimalRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AnimalServiceTest {

    @Mock
    private AnimalRepository animalRepository;

    @InjectMocks
    private AnimalService animalService;

    @Test
    void adoptAnimal_withAvailableAnimal_setsStatusAdopted() {
        Animal animal = new Animal();
        animal.setStatus(AnimalStatus.AVAILABLE);
        User user = new User("Jane", "Doe", "janedoe", "pwd");

        when(animalRepository.findById(1L)).thenReturn(Optional.of(animal));
        when(animalRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        boolean result = animalService.adoptAnimal(1L, user);

        assertThat(result).isTrue();
        assertThat(animal.getStatus()).isEqualTo(AnimalStatus.ADOPTED);
        assertThat(animal.getAdoptedBy()).isEqualTo(user);
    }

    @Test
    void adoptAnimal_withAlreadyAdoptedAnimal_returnsFalse() {
        Animal animal = new Animal();
        animal.setStatus(AnimalStatus.ADOPTED);

        when(animalRepository.findById(1L)).thenReturn(Optional.of(animal));

        boolean result = animalService.adoptAnimal(1L, new User());

        assertThat(result).isFalse();
        verify(animalRepository, never()).save(any());
    }

    @Test
    void adoptAnimal_withNonExistentAnimal_returnsFalse() {
        when(animalRepository.findById(99L)).thenReturn(Optional.empty());

        boolean result = animalService.adoptAnimal(99L, new User());

        assertThat(result).isFalse();
    }
}
