# SufferNotGamesWorkshop

A full-stack web service for writing and playing with homebrew rules for Warhammer 40,000.

## What it does

The application is built around two main areas:

**Rules Writing** — the core of the application. Authors create and manage custom factions and units, define their datasheets, abilities, and profiles, and publish them as versioned rule sets. Available unit types and stat line characteristics (e.g. Movement, Toughness, Save) are configurable, allowing the system to adapt to any homebrew rule set. Version management ensures changes are tracked and older versions remain accessible.

**Army Building** — consumes the published rules. Players browse the available factions and their units, then assemble armies by picking units within configured point limits. Faction and unit presentation is formatted for use at the table.

## Tech Stack

| Layer | Choice |
|---|---|
| Backend | Kotlin + Spring Boot 3.x |
| Frontend | React (TypeScript) + Vite |
| Database | PostgreSQL + Spring Data JPA + Hibernate |
| Migrations | Flyway |
| Build | Gradle (Kotlin DSL) |

## Getting Started

### Prerequisites

- JDK 21+
- Node.js 20+
- Docker 20+ (used for the database quickstart and required by Testcontainers when running backend tests)

### 1. Start the database

The application expects a PostgreSQL database named `workshop` on port 5432 with username and password both set to `workshop`.

**Docker:**

```bash
docker run -d \
  --name workshop-db \
  -e POSTGRES_DB=workshop \
  -e POSTGRES_USER=workshop \
  -e POSTGRES_PASSWORD=workshop \
  -p 5432:5432 \
  postgres:15
```

**Local PostgreSQL:**

```sql
CREATE USER workshop WITH PASSWORD 'workshop';
CREATE DATABASE workshop OWNER workshop;
```

Flyway applies all schema migrations automatically on first startup.

### 2. Run the backend

```bash
./gradlew bootRun
```

The API is available at `http://localhost:8080`. To override the database connection, set the following environment variables before running:

```bash
export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/workshop
export SPRING_DATASOURCE_USERNAME=workshop
export SPRING_DATASOURCE_PASSWORD=workshop
```

### 3. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend dev server starts at `http://localhost:5173` and proxies API requests to the backend at `localhost:8080`. Both servers must be running for the full application to work.

### Running tests

```bash
# Backend — Testcontainers spins up a PostgreSQL container automatically; Docker must be running
./gradlew test

# Frontend
cd frontend && npm test
```

## Deployment

The application is configured to deploy on [Render](https://render.com) (web service) backed by a [Neon](https://neon.tech) serverless PostgreSQL database. Both have free tiers sufficient for demonstration use.

The `render.yaml` blueprint at the repo root defines the web service. Render auto-deploys on every push to `main`.

See the step-by-step setup instructions below in this section for the one-time manual configuration required.

### Linting and formatting

```bash
# Kotlin — check
./gradlew ktlintCheck

# Kotlin — auto-fix
./gradlew ktlintFormat

# TypeScript — type check
cd frontend && npm run typecheck

# TypeScript — ESLint
cd frontend && npm run lint
```

CI runs all of the above on every pull request.
