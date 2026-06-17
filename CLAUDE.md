# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SufferNotGamesWorkshop is a full-stack web service for writing and playing with homebrew rules for Warhammer 40,000. The application is built around two main areas:

**Rules Writing** — the core of the application. Authors create and manage custom factions and units, define their datasheets, abilities, and profiles, and publish them as versioned rule sets. The system is configurable at the foundation level: available unit types and stat line characteristics (e.g. Movement, Toughness, Save) can be adjusted to fit any homebrew rule set. Version management ensures changes are tracked and older versions remain accessible.

**Army Building** — consumes the published rules. Players browse the available factions and their units, then assemble armies by picking units within configured point limits. The faction and unit presentation is formatted for use at the table.

The frontend consumes the Spring Boot REST API and is served as a web application directly to users in the browser.

## Tech Stack

| Layer | Choice | Motivation |
|---|---|---|
| Backend language | Kotlin | Concise, null-safe JVM language that reduces boilerplate compared to Java while retaining full Spring Boot compatibility. Data classes, sealed classes, and extension functions map well to the domain model. |
| Backend framework | Spring Boot 3.x | Battle-tested framework with first-class Kotlin support, auto-configuration, and a rich ecosystem (Security, Data, Actuator). Reduces infrastructure wiring so the focus stays on game domain logic. |
| Build tool | Gradle (Kotlin DSL) | Type-safe build scripts in the same language as the application code. Better IDE support and refactoring than Groovy DSL; integrates Vite frontend builds as a Gradle task. |
| Frontend language | TypeScript | Catches API contract mismatches between frontend and backend at compile time, which matters as the game data model evolves. |
| Frontend framework | React | Component model fits the highly compositional nature of the UI (datasheets composed of unit profiles, weapon tables, ability lists). Largest ecosystem for reusable UI primitives. |
| Frontend build | Vite | Fast HMR during development and straightforward Vite config for proxying API calls to the Spring Boot server. |
| Database | PostgreSQL | Relational model suits the structured game data (units, factions, weapons, abilities). JSONB columns handle schema-flexible rule payloads without a separate document store. Widely available on free-tier hosting. |
| ORM | Spring Data JPA + Hibernate | Standard Spring persistence layer; repository interfaces eliminate repetitive query code. Flyway handles migrations separately, keeping Hibernate in validate mode. |
| Backend testing | JUnit 5 + MockK | MockK is idiomatic Kotlin (supports `object`, coroutines, extension functions) where Mockito falls short. |
| Frontend testing | Vitest + React Testing Library | Vitest shares the Vite config, keeping test and build tooling aligned. React Testing Library encourages testing behaviour over implementation. |
| Formatting | ktlint / ESLint + Prettier | Enforces consistent style across both halves of the codebase without bikeshedding. |

## Commands

```bash
# Build
./gradlew build

# Run the application
./gradlew bootRun

# Run all tests
./gradlew test

# Run a single test class
./gradlew test --tests "com.suffernot.workshop.SomeTest"

# Run a single test method
./gradlew test --tests "com.suffernot.workshop.SomeTest.someMethod"

# Check formatting
./gradlew ktlintCheck

# Auto-fix formatting
./gradlew ktlintFormat
```

Frontend (run from `frontend/`):

```bash
# Install dependencies
npm install

# Start dev server (proxies API to localhost:8080)
npm run dev

# Run frontend tests
npm test

# Run a single test file
npm test -- UnitCard

# Type-check without emitting
npm run typecheck

# Lint
npm run lint

# Format
npm run format
```

## Architecture

The application follows a layered architecture:

- `controller` — REST endpoints; thin layer that delegates to services
- `service` — business logic and domain rules
- `repository` — Spring Data JPA repositories
- `domain` — JPA entity classes
- `dto` — request/response data classes for the API layer; never expose domain entities directly
- `config` — Spring configuration classes

Configuration lives in `src/main/resources/application.yml`.

Database migrations are managed with Flyway. Migration scripts live in `src/main/resources/db/migration/` and follow the naming convention `V{version}__{description}.sql` (e.g. `V1__create_unit_table.sql`). Never modify an already-applied migration — always add a new one.

## Code Conventions

### Kotlin
- Prefer `val` over `var`; model domain state with immutability
- Use `data class` for DTOs and value objects
- Use `sealed class` to model domain results and error states (e.g. `Result.Success` / `Result.Failure`)
- Use extension functions rather than utility/helper classes
- Prefer functional idioms (`map`, `filter`, `let`, `run`) when they improve clarity
- Use `require()` and `check()` for preconditions instead of manual null/range checks

### Spring Boot
- Constructor injection only — no `@Autowired` field injection
- `@Transactional` belongs on the service layer, not controllers
- All configuration via `application.yml`, not `application.properties`
- REST controllers return `ResponseEntity<T>` and document HTTP status codes explicitly

### Database
- JPA entities use `@Entity` and live in the `domain` package; never use them as API responses
- Use JSONB columns (`@Column(columnDefinition = "jsonb")`) for flexible nested structures such as ability definitions or custom rule payloads
- Prefer lazy loading (`fetch = FetchType.LAZY`) and load associations explicitly in service methods to avoid N+1 queries
- All schema changes go through Flyway migrations — do not use `spring.jpa.hibernate.ddl-auto=update` in any environment
- Repository tests run against a real PostgreSQL instance via Testcontainers, not H2

### Testing
- Use MockK for mocking, not Mockito
- Unit tests mock dependencies with `@MockkBean` or plain `mockk()`
- Integration tests use `@SpringBootTest`
- Repository tests use `@DataJpaTest`

## Frontend

React with TypeScript, built with Vite. Lives in a `frontend/` directory at the project root and communicates with the Spring Boot backend via its REST API.

The Spring Boot dev server proxies frontend requests during development so both run under the same origin. In production, the Gradle build compiles the frontend and places it under `src/main/resources/static` to be served by Spring Boot as static assets.

### Frontend conventions
- Functional components only — no class components
- State management with React Query for server state (API data) and `useState`/`useContext` for local UI state
- Co-locate component styles, tests, and the component file in a single folder (e.g. `UnitCard/UnitCard.tsx`, `UnitCard/UnitCard.test.tsx`)
- API calls go through a typed client layer (`src/api/`) — components never call `fetch` directly
- TypeScript types for API responses are generated from or manually kept in sync with backend DTOs

## Rules for Claude

- When adding a feature, add the full vertical slice: domain entity → repository → service → controller → DTOs
- Do not introduce new Gradle dependencies without confirming with the user
- Warhammer 40k domain terms (datasheet, unit, ability, keyword, profile, faction) have specific meanings — use them accurately and consistently
- Preserve the layered package structure; do not place business logic in controllers or repositories
