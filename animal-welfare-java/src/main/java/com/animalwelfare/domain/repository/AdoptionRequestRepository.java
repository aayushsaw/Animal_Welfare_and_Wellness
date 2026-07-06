package com.animalwelfare.domain.repository;

import com.animalwelfare.domain.model.AdoptionRequest;
import com.animalwelfare.domain.model.AdoptionRequest.AdoptionStatus;
import com.animalwelfare.domain.model.Animal;
import com.animalwelfare.domain.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AdoptionRequestRepository extends JpaRepository<AdoptionRequest, Long> {

    Optional<AdoptionRequest> findByAnimalAndRequesterAndStatus(
        Animal animal, User requester, AdoptionStatus status);

    boolean existsByAnimalAndRequesterAndStatus(
        Animal animal, User requester, AdoptionStatus status);

    Page<AdoptionRequest> findByRequester(User requester, Pageable pageable);

    Page<AdoptionRequest> findByStatus(AdoptionStatus status, Pageable pageable);

    @Query("SELECT r FROM AdoptionRequest r JOIN FETCH r.animal a LEFT JOIN FETCH a.images " +
           "WHERE r.requester = :user ORDER BY r.createdAt DESC")
    List<AdoptionRequest> findByRequesterWithAnimal(@Param("user") User user);

    long countByStatus(AdoptionStatus status);
    long countByRequester(User user);
}
