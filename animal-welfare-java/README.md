# 🐾 Animal Welfare and Wellness Platform

> A production-grade full-stack platform connecting stray animals with loving families.
> Built with Java 21 · Spring Boot 3 · JWT Auth · PostgreSQL · Cloudinary

[![Java](https://img.shields.io/badge/Java-21-orange)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.2-brightgreen)](https://spring.io/projects/spring-boot)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

---

## What is this?

Animal Welfare and Wellness is a community platform for:
- **Rescuers** to post stray animals they've found
- **Adopters** to browse and request to adopt animals
- **Volunteers & NGOs** to review adoption requests
- **Admins** to moderate the platform

The platform grew from a simple Angular proof-of-concept (BhootDaya) into a
production-ready Java REST API, preserving all original animals, news content, and
welfare campaign assets from the original project.

---

## Quick Start

### Requirements
- Java 25 (or 21+)
- Maven (bundled in `.mvn/wrapper/`)

### Run locally (H2 in-memory, no setup)

```bash
git clone https://github.com/aayushsaw/Animal_Welfare_and_Wellness.git
cd Animal_Welfare_and_Wellness/animal-welfare-java

# Windows
.mvn\wrapper\maven\apache-maven-3.9.6\bin\mvn.cmd spring-boot:run
```

App starts at **http://localhost:8080**

### Demo credentials
| Username | Password | Role |
|----------|----------|------|
| `admin` | `password123` | ADMIN + USER |
| `aayush` | `password123` | USER |
| `manthan` | `password123` | USER |

---

## API Docs

**Swagger UI:** http://localhost:8080/swagger-ui.html

**H2 Console (dev):** http://localhost:8080/h2-console
- JDBC URL: `jdbc:h2:mem:animalwelfaredb`
- Username: `sa` · Password: *(empty)*

---

## API Overview

```
POST /api/v1/auth/register       Create account
POST /api/v1/auth/login          Get JWT tokens
POST /api/v1/auth/refresh        Rotate refresh token
POST /api/v1/auth/logout         Revoke all tokens

GET  /api/v1/animals             Browse available animals (paginated)
GET  /api/v1/animals/{id}        Animal details
GET  /api/v1/animals/stats       Platform statistics
POST /api/v1/animals             Post a stray animal 🔒
PUT  /api/v1/animals/{id}        Update listing 🔒
DELETE /api/v1/animals/{id}      Remove listing 🔒
POST /api/v1/animals/{id}/images Upload photo 🔒
POST /api/v1/animals/{id}/adopt  Request adoption 🔒

GET  /api/v1/adoptions/my        My adoption requests 🔒
PUT  /api/v1/adoptions/{id}/review Approve/Reject 🔒 (ADMIN/VOLUNTEER)

GET  /api/v1/news/featured       Homepage carousel articles
GET  /api/v1/news                All published articles
GET  /api/v1/news/category/{cat} Filter by category

GET  /api/v1/users/me            My profile + stats 🔒
```

🔒 = Requires `Authorization: Bearer <token>` header

---

## Architecture

```
┌─────────────────────────────────────┐
│     React + Tailwind (planned)      │
└──────────────┬──────────────────────┘
               │ JWT Bearer
┌──────────────▼──────────────────────┐
│        Spring Boot REST API         │
│  Auth · Animals · Adoptions · News  │
├─────────────────────────────────────┤
│  Spring Security · JWT Filter       │
│  Spring Data JPA · Hibernate        │
├─────────────────────────────────────┤
│   H2 (dev) / PostgreSQL (prod)      │
│   Flyway migrations (V1–V5)         │
└──────────────┬──────────────────────┘
               │
        ┌──────▼──────┐
        │  Cloudinary │ (image CDN)
        └─────────────┘
```

### Package Structure
```
com.animalwelfare/
├── api/           REST controllers + DTOs + response wrappers
├── config/        Security, Cloudinary, OpenAPI config
├── domain/        Entities + JPA repositories
├── exception/     Global exception handler + custom exceptions
├── infrastructure/ Image storage service
├── security/      JWT service + filter + UserDetailsService
└── service/       Business logic (Auth, Animal, Adoption, News)
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | Java 21 (runs on Java 25) |
| Framework | Spring Boot 3.2.2 |
| Security | Spring Security 6 + JWT (jjwt 0.12.3) |
| Data | Spring Data JPA + Hibernate 6 |
| Database | H2 (dev) / PostgreSQL (prod) |
| Migrations | Flyway |
| Image Storage | Cloudinary / Local filesystem fallback |
| API Docs | SpringDoc OpenAPI 2.3 |
| Build | Maven 3.9.6 |
| Testing | JUnit 5 + Mockito |
| Frontend | React + Tailwind + shadcn/ui *(planned)* |

---

## Production Setup

### Switch to PostgreSQL

1. Set environment variables:
```bash
export DB_URL=jdbc:postgresql://localhost:5432/animalwelfaredb
export DB_DRIVER=org.postgresql.Driver
export DB_USERNAME=postgres
export DB_PASSWORD=yourpassword
export SPRING_PROFILES_ACTIVE=prod
export JWT_SECRET=YourLong256BitSecretKeyHere
export CLOUDINARY_CLOUD_NAME=your-cloud
export CLOUDINARY_API_KEY=your-key
export CLOUDINARY_API_SECRET=your-secret
```

2. Run:
```bash
.mvn\wrapper\maven\apache-maven-3.9.6\bin\mvn.cmd spring-boot:run
```

Flyway automatically applies all migrations to PostgreSQL on first start.

### Cloudinary Image Uploads

Set `CLOUDINARY_API_KEY` to a non-empty value and images will automatically
upload to Cloudinary CDN instead of local storage. No code changes needed.

---

## Project Background

This platform was originally an Angular application called "BhootDaya" — a student
project for animal welfare awareness. It had no backend, stored data in JSON files,
and used hardcoded credentials.

This repository represents the complete migration to a production-grade Java
ecosystem while preserving the original project's identity:
- All 12 original stray animal photos are preserved
- All 8 welfare news images from the original carousel are preserved
- The original Pyaar Foundation testimonial is preserved
- The original animal data (Bruno, Whiskers, Max and others) is seeded

The project is designed for a Java developer's resume — demonstrating enterprise
Spring Boot patterns, clean architecture, and professional API design.

---

## License

MIT © Animal Welfare and Wellness
