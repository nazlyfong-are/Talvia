# Talvia

Plataforma de empleo en línea que conecta trabajadores y empresas y ordena
a los candidatos con un modelo predictivo de compatibilidad.

**Proyecto de aula – Tecnológico Confenalco, Cartagena de Indias – 2026**

Integrantes: Leonardo Manuel Berrio Barreiro, Nazly Patricia Fong Arellano,
Samuel David Pérez Vergara, Luis Eduardo Polo Rodríguez.

## Ver la aplicación en línea

https://talvia-6s9m.onrender.com

Es la forma más rápida de probarla. La primera carga puede tardar unos segundos.
Las cuentas de demostración se entregan por separado, no se publican aquí.

## Qué incluye

- Tres roles: trabajador, empresa y administrador (con código de seguridad).
- Publicación de vacantes, postulaciones y notificaciones por correo.
- Ranking de compatibilidad con un modelo de regresión logística (ONNX).
- Búsqueda y control por voz, y diseño adaptable a teléfono y tablet.

## Tecnologías

Java 25, Spring Boot, Spring Security, JPA/Hibernate, Flyway, Thymeleaf,
PostgreSQL (Neon), Cloudinary, ONNX Runtime, Docker y Render.

## Ejecutarlo en tu equipo

Requisitos: JDK 25 y una base de datos PostgreSQL.

1. Clona el repositorio y entra a la carpeta del proyecto:
   git clone https://github.com/nazlyfong-are/Talvia.git
   cd Talvia/talvia
2. Copia `src/main/resources/application-dev.properties.example` como
   `application-dev.properties` y completa tus datos (base de datos,
   Cloudinary y correo).
3. Ejecuta:
   ./mvnw spring-boot:run     (en Windows: mvnw spring-boot:run)
4. Abre http://localhost:8080

El archivo `application-dev.properties` no está en el repositorio porque
contiene datos privados.

## Ejecutarlo con variables de entorno (como en Render)

Perfil `prod`: define `SPRING_PROFILES_ACTIVE=prod` y estas variables:

| Variable | Descripción |
|---|---|
| DB_URL | jdbc:postgresql://HOST/BASE?sslmode=require |
| DB_USER / DB_PASSWORD | Usuario y contraseña de la base de datos |
| CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET | Datos de Cloudinary |
| MAIL_HOST / MAIL_PORT / MAIL_USER / MAIL_PASSWORD / MAIL_REMITENTE | Servidor de correo |

## Nota sobre el modelo

El modelo se entrenó con datos simulados.
