# Planning Poker

## Usage

When the JAR file is executed, a web server will be started and listen at <http://localhost:8080>.

Configuration may be done
using [properties](https://docs.spring.io/spring-boot/docs/current/reference/html/howto.html#howto.properties-and-configuration.external-properties-location).

### Requirements

- JRE 17

### Authentication

Authentication is possible via AD (Active Directory).
The following properties must be set:

- `planning-poker.auth.active-directory.domain`: The AD domain.
- `planning-poker.auth.active-directory.url` The AD URL.

The following properties are optional:

- `planning-poker.auth.active-directory.search-filter` A custom search filter.
  See `org.springframework.security.ldap.authentication.ad.ActiveDirectoryLdapAuthenticationProvider.setSearchFilter` for details.

### Extensions

Extensions may be enabled
by [starting the application with additional profiles](https://docs.spring.io/spring-boot/docs/current/reference/html/howto.html#howto.properties-and-configuration.set-active-spring-profiles).

#### Aha!

The Aha! extension can be enabled by starting the application with the profile `extension:aha`.
The following additional properties must be set:

- `planning-poker.extension.aha.account-domain`: The subdomain part that the target Aha! instance is running on. For example, if you
  use `https://example.aha.io`, this would be `example`.
- `planning-poker.extension.aha.client-id`: The Aha! OAuth2 client ID. See <https://www.aha.io/api/oauth2> for details.
- `planning-poker.extension.aha.redirect-uri`: The Aha! OAuth2 redirect URI. Should be the address the application is running on.

Note that the Aha! Integration only works when the application is available under HTTPs.

## Development

### Requirements

- Node.js 18
- JDK 17
- Maven
- IntelliJ IDEA

### HTTPS

Create a keystore with a self-signed certificate (https://www.baeldung.com/spring-boot-https-self-signed-certificate) and adapt
the `application-development.properties` parameters.
Then export the certificate and its key, can make them available for Vite (`vite.config.ts`).

### Development Mode

Start the run config `backend:dev` and `frontend:dev` and go to <https://localhost:8443>.

### Build for Production

Start the run config `package`.
This will:

1) compile the backend.
2) compile the frontend into the compiled backend files directory.
3) package the whole bunch as JAR.

### Architecture

#### Validation & State Transitions

The general request validation is done in the REST controllers, as is the transition of states (e.g., joining rooms or voting).
Integrity related validation is done in the persistence layer, such as clearing votes of observers.