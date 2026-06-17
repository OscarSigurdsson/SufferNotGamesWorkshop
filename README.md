# SufferNotGamesWorkshop

A full-stack web service for writing and playing with homebrew rules for Warhammer 40,000.

## What it does

The application is built around two main areas:

**Rules Writing** — the core of the application. Authors create and manage custom factions and units, define their datasheets, abilities, and profiles, and publish them as versioned rule sets. Available unit types and stat line characteristics (e.g. Movement, Toughness, Save) are configurable, allowing the system to adapt to any homebrew rule set. Version management ensures changes are tracked and older versions remain accessible.

**Army Building** — consumes the published rules. Players browse the available factions and their units, then assemble armies by picking units and weapon sets within configured point limits. Faction and unit presentation is formatted for use at the table.

## Tech Stack

| Layer | Choice | Motivation |
|---|---|---|
| Backend language | Kotlin | Concise, null-safe JVM language that reduces boilerplate compared to Java while retaining full Spring Boot compatibility. Data classes, sealed classes, and extension functions map well to the domain model. |
| Backend framework | Spring Boot 3.x | Battle-tested framework with first-class Kotlin support, auto-configuration, and a rich ecosystem (Security, Data, Actuator). Reduces infrastructure wiring so the focus stays on game domain logic. |
| Build tool | Gradle (Kotlin DSL) | Type-safe build scripts in the same language as the application code. Better IDE support and refactoring than Groovy DSL; integrates the Vite frontend build as a Gradle task. |
| Frontend language | TypeScript | Catches API contract mismatches between frontend and backend at compile time, which matters as the game data model evolves. |
| Frontend framework | React | Component model fits the highly compositional nature of the UI (datasheets composed of unit profiles, weapon tables, ability lists). Largest ecosystem for reusable UI primitives. |
| Frontend build | Vite | Fast HMR during development and straightforward config for proxying API calls to the Spring Boot server. Vitest shares the same config, keeping test and build tooling aligned. |
| Database | PostgreSQL | Relational model suits the structured game data (units, factions, weapons, abilities). JSONB columns handle schema-flexible rule payloads without a separate document store. Widely available on free-tier hosting. |
| ORM | Spring Data JPA + Hibernate | Standard Spring persistence layer; repository interfaces eliminate repetitive query code. Flyway handles schema migrations separately, keeping Hibernate in validate-only mode. |
| Backend testing | JUnit 5 + MockK | MockK is idiomatic Kotlin and supports `object` mocking, coroutines, and extension functions where Mockito falls short. Repository tests use Testcontainers against a real PostgreSQL instance rather than an in-memory substitute. |
| Frontend testing | Vitest + React Testing Library | Shares the Vite config so tests and the build use the same module resolution. React Testing Library encourages testing behaviour over implementation details. |
| Formatting | ktlint / ESLint + Prettier | Enforces consistent style across both halves of the codebase without bikeshedding. Both run in CI. |

## Getting Started

### Prerequisites

- JDK 21+
- Node.js 20+
- Docker 20+ (used for the database quickstart and required by Testcontainers when running backend tests)

### 1. Start the database

The application expects a PostgreSQL database named `workshop` on port 5432 with username and password both set to `workshop`.

**Docker (recommended):**

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

The API is available at `http://localhost:8080`.

To connect to a different database, set `DATABASE_URL` before running:

```bash
export DATABASE_URL=postgresql://workshop:workshop@localhost:5432/workshop
./gradlew bootRun
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

CI runs all of the above on every push to `main`.

## Deployment

The application deploys on [Render](https://render.com) (Docker web service) backed by a [Neon](https://neon.tech) serverless PostgreSQL database. Both have free tiers sufficient for demonstration use. Render auto-deploys on every push to `main` via the `render.yaml` Blueprint at the repo root.

### One-time setup

1. **Create a Neon project.** In the Neon dashboard, create a new project and copy the connection string from *Connection Details* → *Pooled connection* → *Connection string*. It will look like:
   ```
   postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

2. **Connect the repo to Render.** In the Render dashboard, click *New → Blueprint* and connect your GitHub repository. Render detects `render.yaml` automatically and creates the web service.

3. **Set the database URL.** In the Render dashboard, open the web service → *Environment* tab. Set the `DATABASE_URL` variable to the Neon connection string from step 1.

4. **Trigger a deploy.** Push any commit to `main` or click *Manual Deploy* in the Render dashboard. Subsequent pushes deploy automatically.
