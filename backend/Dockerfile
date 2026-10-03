FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /build

COPY .mvn/ .mvn/
COPY pom.xml ./
RUN mvn -B -ntp dependency:go-offline

COPY src/ src/
RUN mvn -B -ntp package

FROM eclipse-temurin:21-jre-jammy AS runtime
WORKDIR /app

RUN groupadd --system app && useradd --system --gid app app
COPY --from=build --chown=app:app /build/target/pc-workshop-backend-*.jar app.jar

ENV SPRING_PROFILES_ACTIVE=prod
USER app
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
