# SchemeSetu

SchemeSetu bridges everyday citizens to the government welfare schemes — subsidies, scholarships, pensions — they actually qualify for, explained in plain language.

## Monorepo Structure

- **`/backend`**: Spring Boot 3 (Java 21) backend service built with Maven, PostgreSQL (pgvector), Redis, Flyway, and Spring AI.
- **`/frontend`**: React + Vite + TypeScript single-page application.
- **`docker-compose.yml`**: Infrastructure configuration for PostgreSQL 16 (`pgvector`) and Redis 7.
- **`/docs`**: Project documentation directory.

## Documentation

Project documentation can be found in the [/docs](./docs) directory.

## Getting Started

### Prerequisites

- Java 21+
- Node.js 20+ & npm
- Docker & Docker Compose

### Running Infrastructure

Start local dev dependencies (PostgreSQL 16 with pgvector extension & Redis 7):

```bash
docker compose up -d
```

### Running Backend

```bash
cd backend
./mvnw spring-boot:run
```

### Running Frontend

```bash
cd frontend
npm install
npm run dev
```
