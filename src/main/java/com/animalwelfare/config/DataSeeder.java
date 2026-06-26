package com.animalwelfare.config;

import com.animalwelfare.model.Animal;
import com.animalwelfare.model.Animal.AnimalStatus;
import com.animalwelfare.model.User;
import com.animalwelfare.repository.AnimalRepository;
import com.animalwelfare.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Seeds the database with demo users and animals on startup.
 * Mirrors the original JSON data from the Angular project.
 */
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final AnimalRepository animalRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return; // Already seeded
        }

        // Seed Users (from original userData.json)
        User aayush   = createUser("Aayush",   "Shah",  "Aayush",   "aayush123");
        User manthan  = createUser("Manthan",  "Patel", "Manthan",  "manthan123");
        User shahili  = createUser("Shahili",  "Mehta", "Shahili",  "shahili123");
        User aakansha = createUser("Aakansha", "Joshi", "Aakansha", "aakansha123");

        // Seed Animals (from original list_adopt.json)
        createAnimal("dog",  "Labrador", "USA", "black", "Large size",  "/images/stray/stray1.jpg",  aayush,   manthan,  AnimalStatus.ADOPTED);
        createAnimal("dog",  "Labrador", "USA", "black", "Medium size", "/images/stray/stray2.jpg",  manthan,  null,     AnimalStatus.AVAILABLE);
        createAnimal("dog",  "Labrador", "USA", "black", "Medium size", "/images/stray/stray3.jpg",  shahili,  aayush,   AnimalStatus.ADOPTED);
        createAnimal("dog",  "Labrador", "USA", "black", "Small size",  "/images/stray/stray4.jpg",  aayush,   null,     AnimalStatus.AVAILABLE);
        createAnimal("cat",  "None",     "USA", "black", "Medium size", "/images/stray/stray5.jpg",  aakansha, null,     AnimalStatus.AVAILABLE);
        createAnimal("cat",  "None",     "USA", "black", "Medium size", "/images/stray/stray6.jpg",  manthan,  aakansha, AnimalStatus.ADOPTED);
        createAnimal("cat",  "None",     "USA", "black", "Medium size", "/images/stray/stray7.jpg",  aayush,   shahili,  AnimalStatus.ADOPTED);
        createAnimal("cat",  "Labrador", "USA", "black", "Medium size", "/images/stray/stray8.jpg",  aayush,   null,     AnimalStatus.AVAILABLE);
        createAnimal("cat",  "Labrador", "USA", "black", "Small size",  "/images/stray/stray9.jpg",  aakansha, shahili,  AnimalStatus.ADOPTED);
        createAnimal("cat",  "None",     "USA", "black", "Medium size", "/images/stray/stray10.jpg", manthan,  aakansha, AnimalStatus.ADOPTED);
        createAnimal("cat",  "None",     "USA", "black", "Medium size", "/images/stray/stray11.jpg", aayush,   null,     AnimalStatus.AVAILABLE);
        createAnimal("dog",  "None",     "USA", "black", "Medium size", "/images/stray/stray12.jpg", aakansha, null,     AnimalStatus.AVAILABLE);

        System.out.println("==> Animal Welfare: Database seeded with demo users and animals.");
        System.out.println("==> Login with: Aayush / aayush123");
    }

    private User createUser(String firstName, String lastName, String username, String rawPassword) {
        User user = new User(firstName, lastName, username, passwordEncoder.encode(rawPassword));
        return userRepository.save(user);
    }

    private void createAnimal(String category, String subcategory, String location,
                               String color, String desc, String imagePath,
                               User postedBy, User adoptedBy, AnimalStatus status) {
        Animal a = new Animal();
        a.setCategory(category);
        a.setSubcategory(subcategory);
        a.setLocation(location);
        a.setColor(color);
        a.setDescription(desc);
        a.setImagePath(imagePath);
        a.setPostedBy(postedBy);
        a.setStatus(status);
        if (adoptedBy != null) {
            a.setAdoptedBy(adoptedBy);
            a.setAdoptedAt(LocalDateTime.now());
        }
        animalRepository.save(a);
    }
}
