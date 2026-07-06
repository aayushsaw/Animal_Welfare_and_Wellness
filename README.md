# 🐾 Animal Welfare and Wellness Platform

> A production-grade full-stack monorepo platform connecting stray animals with loving families.
> Built with Java 21 · Spring Boot 3 · React 19 · TypeScript · Tailwind CSS · H2/PostgreSQL · Cloudinary

[![Java](https://img.shields.io/badge/Java-21-orange)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.2-brightgreen)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19.2-blue)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-cyan)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

---

## What is this?

Animal Welfare and Wellness is a community platform for:
- **Rescuers** to post stray animals they've found
- **Adopters** to browse and request to adopt animals
- **Volunteers & NGOs** to review adoption requests
- **Admins** to moderate the platform

The platform grew from a simple Angular proof-of-concept (BhootDaya) into a production-ready monorepo comprising a robust Java REST API and a beautifully designed React SPA, preserving all original animals, news content, and welfare campaign assets from the original project.

---

## Repository Structure

```
Animal Welfare and Wellness/
├── animal-welfare-java/               # Backend Spring Boot REST API
└── animal-welfare-frontend/           # Frontend React + TypeScript SPA
```

---

## Quick Start

### 1. Run the Backend (`animal-welfare-java/`)

**Requirements:**
- Java 25 (or 21+)
- Maven (bundled in `.mvn/wrapper/`)

```bash
cd animal-welfare-java

# Windows
.mvn\wrapper\maven\apache-maven-3.9.6\bin\mvn.cmd spring-boot:run
```

App starts at **http://localhost:8080**

### 2. Run the Frontend (`animal-welfare-frontend/`)

**Requirements:**
- Node.js v20+
- npm v10+

```bash
cd animal-welfare-frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

Vite starts at **http://localhost:5173** (API requests are automatically proxied to backend port `8080`).

---

## Demo Credentials

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
...
```

🔒 = Requires `Authorization: Bearer <token>` header (handled automatically by frontend Axios client).

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

Set `CLOUDINARY_API_KEY` to a non-empty value and images will automatically upload to Cloudinary CDN instead of local storage. No code changes needed.

---

## License

MIT © Animal Welfare and Wellness
