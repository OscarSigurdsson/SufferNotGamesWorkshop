# ── 1. Build frontend ─────────────────────────────────────────────────────────
FROM node:20-alpine AS frontend
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci --ignore-scripts
COPY frontend/ ./
RUN npm run build

# ── 2. Build Spring Boot jar ──────────────────────────────────────────────────
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app
# Resolve dependencies in a separate layer so they are cached between rebuilds
COPY gradlew settings.gradle.kts build.gradle.kts ./
COPY gradle/ gradle/
RUN chmod +x gradlew && ./gradlew dependencies --no-daemon -q 2>/dev/null || true
# Copy source and compiled frontend assets, then build the fat jar
COPY src/ src/
COPY --from=frontend /app/dist src/main/resources/static/
RUN ./gradlew bootJar --no-daemon -x test -x ktlintCheck

# ── 3. Runtime ────────────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", \
  "-XX:MaxRAMPercentage=75", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]
