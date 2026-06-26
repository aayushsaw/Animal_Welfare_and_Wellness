package com.animalwelfare.repository;

import com.animalwelfare.model.Animal;
import com.animalwelfare.model.Animal.AnimalStatus;
import com.animalwelfare.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Data access layer for Animal entity.
 */
@Repository
public interface AnimalRepository extends JpaRepository<Animal, Long> {

    List<Animal> findByStatus(AnimalStatus status);

    List<Animal> findByPostedBy(User user);

    List<Animal> findByAdoptedBy(User user);

    @Query("SELECT a FROM Animal a WHERE a.status = 'AVAILABLE' AND LOWER(a.category) LIKE LOWER(CONCAT('%', :category, '%'))")
    List<Animal> findAvailableByCategory(@Param("category") String category);

    long countByStatus(AnimalStatus status);

    long countByPostedBy(User user);

    long countByAdoptedBy(User user);
}
