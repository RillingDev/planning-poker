# Architecture

## Structure & Tooling

This application uses both [Spring Boot](https://spring.io/projects/spring-boot) (REST controllers, business logic, persistence layer) and [Vite](https://vitejs.dev/) (frontend).

During development, Spring Boot will be the primary server that serves HTML (`./src/main/resources/templates/index.html`) and the REST API,
while the React frontend is served by Vite and included by the previously mentioned HTML file.
In production, only Spring Boot is active and the built frontend is directly included.

When building the production artifacts, the following steps are performed:

1. compile the backend.
2. compile the frontend.
3. copy the compiled frontend resources into the compiled backend resources.
4. package everything as a JAR file.

## Design Concepts

### Validation & State Transitions

The general request validation is done in the REST controllers, as is the transition of states (e.g., joining rooms or voting).
Integrity related validation is done in the persistence layer, such as enforcing that votes are from the correct card set.

The persistence layer is treated as the single-source-of-truth.

### Extensions

Extensions are primarily controlled using spring profiles that start with the prefix `extension:`.
This is then delegated to the web app. Extensions are globally categorized as either "enabled" or "disabled".
If they are enabled, they may further be activated or deactivated on a per-room basis.

Extensions MAY use the REST API resources at `/api/extensions/{extension-key}` and `/api/rooms/{room-name}/extensions/{extension-key}` to implement own endpoints,
with the first being for global, and the second for per-room options.

Extensions MAY use the attributes associated with their `RoomExtensionConfig` to persist data for rooms.

Extensions SHOULD be as isolated as possible from the main application.

#### Creating a new Extension

1. Create a new entry in the `extension` database table.
2. Create backend controllers.
   1. (Optional) Create an endpoint for global settings under `/api/extensions/my-extension-key`.
   2. (Optional) Create endpoints for per-room settings under `/api/rooms/{room-name}/extensions/my-extension-key`.
3. Create an implementation of the frontend interface `Extension`.

## Guidelines

### Frontend

- For trivial components (buttons, cards), raw HTML should be preferred over React components, to keep complexity low.
