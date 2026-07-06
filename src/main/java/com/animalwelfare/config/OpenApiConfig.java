package com.animalwelfare.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * OpenAPI / Swagger UI configuration.
 * Access at: http://localhost:8080/swagger-ui.html
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Animal Welfare and Wellness API")
                        .description("""
                                Production-grade REST API for the Animal Welfare and Wellness platform.
                                
                                **Features:**
                                - JWT Authentication with refresh token rotation
                                - Role-based access control (USER, ADMIN, VOLUNTEER)
                                - Animal listing, search, and adoption workflow
                                - Welfare news and campaign content
                                - Cloudinary image storage
                                
                                **Authentication:** Use `POST /api/v1/auth/login` to get a JWT token,
                                then click **Authorize** and enter: `Bearer <your-token>`
                                """)
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Animal Welfare and Wellness")
                                .email("contact@animalwelfare.com"))
                        .license(new License()
                                .name("MIT License")))
                .servers(List.of(
                        new Server().url("http://localhost:8080").description("Local Development")))
                .components(new Components()
                        .addSecuritySchemes("bearerAuth", new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Enter JWT token obtained from /api/v1/auth/login")))
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"));
    }
}
