FROM eclipse-temurin:21-jdk AS build

WORKDIR /workspace
COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw -B -ntp dependency:go-offline

COPY src src
RUN ./mvnw -B -ntp clean package -DskipTests

FROM eclipse-temurin:21-jre

RUN useradd --system --create-home --uid 10001 ecommerce
WORKDIR /app
COPY --from=build /workspace/target/ecom-1.0.0.jar app.jar

USER ecommerce
EXPOSE 10000

ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75.0", "-jar", "/app/app.jar"]
