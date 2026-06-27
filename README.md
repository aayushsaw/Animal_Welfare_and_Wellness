# Animal Welfare and Wellness Platform

A full-stack Java web application built with **Spring Boot**, **Spring Security**, **Spring Data JPA**, and **Thymeleaf**.

## Tech Stack

| Layer        | Technology                          |
|-------------|-------------------------------------|
| Backend      | Java 17, Spring Boot 3.2            |
| Security     | Spring Security 6 (BCrypt + Sessions)|
| Data Layer   | Spring Data JPA + Hibernate         |
| Database     | H2 (dev) / MySQL (prod)             |
| Frontend     | Thymeleaf + Bootstrap 5             |
| Build Tool   | Maven                               |
| Tests        | JUnit 5, Mockito, Spring MVC Test   |

## Features

- **User Auth** — Register, login, logout with BCrypt password hashing
- **Browse Animals** — Filter available stray animals by category
- **Post a Stray** — Upload animal details + photo (requires login)
- **Adopt an Animal** — Claim an animal with one click (requires login)
- **My Contributions** — Dashboard showing animals you've posted and adopted
- **REST API** — `/api/animals` endpoints (JSON) for future mobile clients
- **H2 Console** — `/h2-console` for dev/demo database inspection

## Running the App

### Prerequisites
- Java 17+
- Maven 3.8+

### Steps

```bash
cd animal-welfare-java
mvn spring-boot:run
```

App starts at: **http://localhost:8080**

### Demo Credentials

| Username   | Password      |
|-----------|---------------|
| Aayush    | aayush123     |
| Manthan   | manthan123    |
| Shahili   | shahili123    |
| Aakansha  | aakansha123   |

### H2 Database Console
http://localhost:8080/h2-console
- JDBC URL: `jdbc:h2:mem:animalwelfaredb`
- Username: `sa` | Password: *(empty)*

## REST API

| Endpoint                     | Description                   |
|-----------------------------|-------------------------------|
| `GET /api/animals`           | Available animals (JSON)      |
| `GET /api/animals/all`       | All animals                   |
| `GET /api/animals/stats`     | Adoption statistics           |
| `GET /api/animals/filter?category=dog` | Filter by category |

## Project Structure

```
src/
├── main/java/com/animalwelfare/
│   ├── AnimalWelfareApplication.java     # Entry point
│   ├── config/
│   │   ├── SecurityConfig.java           # Spring Security rules
│   │   ├── DataSeeder.java               # Demo data on startup
│   │   └── WebConfig.java                # Static resource mapping
│   ├── controller/
│   │   ├── HomeController.java           # Home + About
│   │   ├── AuthController.java           # Login + Register
│   │   ├── AnimalController.java         # Browse + Post + Adopt
│   │   ├── DashboardController.java      # My Contributions
│   │   └── AnimalRestController.java     # REST API
│   ├── service/
│   │   ├── UserService.java              # User business logic
│   │   └── AnimalService.java            # Animal business logic
│   ├── repository/
│   │   ├── UserRepository.java           # JPA for users
│   │   └── AnimalRepository.java         # JPA for animals
│   ├── model/
│   │   ├── User.java                     # User entity
│   │   └── Animal.java                   # Animal entity
│   └── dto/
│       ├── RegistrationDto.java          # Registration form DTO
│       └── AnimalDto.java                # Animal publish form DTO
└── main/resources/
    ├── templates/                        # Thymeleaf HTML templates
    ├── static/css/style.css              # Custom CSS
    └── application.properties            # App config
```

## Switching to MySQL (Production)

1. Add MySQL dependency to `pom.xml`:
```xml
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
</dependency>
```

2. Update `application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/animalwelfaredb
spring.datasource.username=root
spring.datasource.password=yourpassword
spring.jpa.database-platform=org.hibernate.dialect.MySQL8Dialect
spring.jpa.hibernate.ddl-auto=update
```
