package com.animalwelfare.controller;

import com.animalwelfare.model.Animal;
import com.animalwelfare.service.AnimalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST API endpoints — exposes animal data as JSON.
 * Base URL: /api/animals
 */
@RestController
@RequestMapping("/api/animals")
@RequiredArgsConstructor
public class AnimalRestController {

    private final AnimalService animalService;

    @GetMapping
    public ResponseEntity<List<Animal>> getAvailableAnimals() {
        return ResponseEntity.ok(animalService.getAvailableAnimals());
    }

    @GetMapping("/all")
    public ResponseEntity<List<Animal>> getAllAnimals() {
        return ResponseEntity.ok(animalService.getAllAnimals());
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getStats() {
        return ResponseEntity.ok(Map.of(
            "available", animalService.countAvailable(),
            "adopted",   animalService.countAdopted()
        ));
    }

    @GetMapping("/filter")
    public ResponseEntity<List<Animal>> filterByCategory(
            @RequestParam(defaultValue = "") String category) {
        return ResponseEntity.ok(animalService.filterByCategory(category));
    }
}
