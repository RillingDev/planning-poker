ARG BASE_IMAGE="eclipse-temurin:17"
FROM ${BASE_IMAGE}

RUN mkdir /opt/app
WORKDIR /opt/app

COPY target/planning-poker-*.jar /opt/app/app.jar

# Volume for persistent database
VOLUME /opt/app/data

# Expose web app
EXPOSE 8080/tcp

CMD ["java", "-jar", "/opt/app/app.jar"]
