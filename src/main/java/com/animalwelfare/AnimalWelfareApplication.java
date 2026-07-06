package com.animalwelfare;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Animal Welfare and Wellness Platform
 *
 * Production-grade Spring Boot REST API for stray animal
 * adoption, welfare news, and community engagement.
 *
 * API Docs:  http://localhost:8080/swagger-ui.html
 * H2 Console: http://localhost:8080/h2-console
 */
@SpringBootApplication
public class AnimalWelfareApplication {

    public static void main(String[] args) {
        SpringApplication.run(AnimalWelfareApplication.class, args);
    }
}
