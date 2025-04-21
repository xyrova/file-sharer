FROM maven:3.9.9-sapmachine-21 AS build

WORKDIR /app

COPY ./pom.xml .
COPY ./src/ ./src/

RUN mvn clean package -DskipTests

# Second stage - minimal runtime
FROM eclipse-temurin:21-jdk-alpine

WORKDIR /app

RUN mkdir ./file_storage/

COPY --from=build /app/target/*.jar /app/app.jar

ENV DB_URL="jdbc:mysql://mysql-server:3306/fileSharer?createDatabaseIfNotExist=true" \
    DB_USERNAME="" \
    DB_PASSWORD="" \
    SERVER_PORT="9090" \
    FILE_STORAGE_DIRECTORY="/app/file_storage/"

EXPOSE 9090

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
