# Planning Poker

A tool to play [Planning Poker](https://en.wikipedia.org/wiki/Planning_poker).

## Usage

When the JAR file is executed, a web server will be started and listen at <http://localhost:8080>.

Configuration may be done
using [properties](https://docs.spring.io/spring-boot/docs/current/reference/html/howto.html#howto.properties-and-configuration.external-properties-location).

### Requirements

- JRE 17

### Authentication

Authentication is possible via AD (Active Directory).
The following properties must be set:

- `planning-poker.auth.active-directory.domain`: The domain name.
- `planning-poker.auth.active-directory.url` The LDAP URL.

The following properties are optional:

- `planning-poker.auth.active-directory.search-filter` A custom search filter.
  See `org.springframework.security.ldap.authentication.ad.ActiveDirectoryLdapAuthenticationProvider.setSearchFilter` for details.

### Extensions

Extensions may be enabled
by [starting the application with additional profiles](https://docs.spring.io/spring-boot/docs/current/reference/html/howto.html#howto.properties-and-configuration.set-active-spring-profiles).

#### Aha!

The [Aha!](https://www.aha.io/ideas/overview) extension can be enabled by starting the application with the profile `extension:aha`.
The following additional properties must be set:

- `planning-poker.extension.aha.account-domain`: The subdomain part that the target Aha! instance is running on. For example, if you
  use `https://example.aha.io`, this would be `example`.
- `planning-poker.extension.aha.client-id`: The Aha! OAuth2 client ID. See <https://www.aha.io/api/oauth2> for details.
- `planning-poker.extension.aha.redirect-uri`: The Aha! OAuth2 redirect URI. Should be the address the application is running on.

Note that the Aha! Integration only works when the application is available under HTTPS.

##### Usage

If the topic of a room is set to an Aha! idea ID or URL, a button to submit the average score to Aha! will show up after voting completes.

## Development

### Requirements

- Node.js 18
- JDK 17
- Maven
- IntelliJ IDEA

### HTTPS

Create a keystore with a self-signed certificate (https://www.baeldung.com/spring-boot-https-self-signed-certificate) and adapt
the `application-development.properties` parameters.
Then export the certificate and its key, and make them available for Vite (`vite.config.ts`).

### Development Mode

Start the run config `backend:dev` and `frontend:dev` and go to <https://localhost:8443>.

### Build for Production

Start the run config `package`.
This will:

1) compile the backend.
2) compile the frontend.
3) copy the compiled frontend into the compiled backend resources.
4) package the whole bunch as JAR.

### Known Issues

Problem: The web app does not reflect changes to the code, and the React dev tools report that it is running in production mode.

Solution: Delete the `target` folder, it probably contains old build artifacts of the web app.

### Architecture

#### Validation & State Transitions

The general request validation is done in the REST controllers, as is the transition of states (e.g., joining rooms or voting).
Integrity related validation is done in the persistence layer, such as clearing votes of observers.

The persistence layer is treated as the single-source-of-truth.

#### Extensions

Extensions are primarily controlled using spring profiles that start with the prefix `extension:`. This is then delegated to the web app.