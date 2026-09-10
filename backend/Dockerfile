# -----------------------------------------------------------------------------
# Stage 1: Build Stage
# -----------------------------------------------------------------------------
FROM maven:3.9.9-eclipse-temurin-21 AS builder

WORKDIR /build

# Pre-fetch dependencies in a separate layer to leverage Docker layer caching
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and package application artifact (skipping tests since CI runs them)
COPY src ./src
RUN mvn clean package -DskipTests -B

# -----------------------------------------------------------------------------
# Stage 2: Runtime Stage
# -----------------------------------------------------------------------------
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Create a non-privileged user and group for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy executable jar from build stage
COPY --from=builder /build/target/backend-*.jar app.jar

# Grant ownership to non-privileged user
RUN chown -R appuser:appgroup /app

USER appuser

# Expose Spring Boot default port
EXPOSE 8080

# Default to production profile (overridable via environment variable)
ENV SPRING_PROFILES_ACTIVE=prod

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
