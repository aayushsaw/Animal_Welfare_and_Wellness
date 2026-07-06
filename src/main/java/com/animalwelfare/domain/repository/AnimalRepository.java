package com.animalwelfare.domain.repository;

import com.animalwelfare.domain.model.Animal;
import com.animalwelfare.domain.model.Animal.AnimalStatus;
import com.animalwelfare.domain.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AnimalRepository extends JpaRepository<Animal, Long>,
                                           JpaSpecificationExecutor<Animal> {

    // Fetch with images in one query to avoid N+1
    @Query("SELECT DISTINCT a FROM Animal a LEFT JOIN FETCH a.images LEFT JOIN FETCH a.postedBy WHERE a.id = :id")
    Optional<Animal> findByIdWithImages(@Param("id") Long id);

    Page<Animal> findByStatus(AnimalStatus status, Pageable pageable);

    Page<Animal> findByCategoryIgnoreCaseAndStatus(String category, AnimalStatus status, Pageable pageable);

    List<Animal> findByPostedBy(User user);

    @Query("SELECT a FROM Animal a LEFT JOIN FETCH a.images WHERE a.postedBy = :user ORDER BY a.createdAt DESC")
    List<Animal> findByPostedByWithImages(@Param("user") User user);

    @Query("SELECT a FROM Animal a LEFT JOIN FETCH a.images " +
           "WHERE a.status = 'ADOPTED' AND EXISTS " +
           "(SELECT r FROM AdoptionRequest r WHERE r.animal = a AND r.requester = :user AND r.status = 'APPROVED')")
    List<Animal> findAdoptedByUser(@Param("user") User user);

    long countByStatus(AnimalStatus status);
    long countByPostedBy(User user);
}
