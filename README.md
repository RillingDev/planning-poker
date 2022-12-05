# Planning-Poker

## Usage

When the JAR file is executed, a web server will be started and listens at <http://localhost:8080>.

### Extensions

#### Aha!

The Aha! extension can be enabled by starting the application with the profile `extension:aha`.
The following additional configuration flags must be defined:

- `planning-poker.extension.aha.key`: The Aha! API key.
- `planning-poker.extension.aha.subdomain`: The subdomain part that the target Aha! instance is running on. For example, if you
  use `https://example.aha.io`, this would be `example`.
- `planning-poker.extension.aha.score-fact-names`: A comma seperated list of score-facts, which are the elements that make up idea scores in
  Aha!.
  See <https://www.aha.io/api/resources/ideas/create_an_idea_with_a_score> for details.

### User Management

In order to add encrypted credentials for new users to the database,
see <https://docs.spring.io/spring-security/reference/features/authentication/password-storage.html#authentication-password-storage-boot-cli>.

## Development

### Requirements

- Node.js 18
- JDK 17
- Maven
- IntelliJ IDEA

### Development Mode

Start the run config `backend:dev` and `frontend:dev` and go to <http://localhost:8080>.

### Build for Production

Start the run config `package`.
This will:

1) compile the backend.
2) compile the frontend into the compiled backend files directory.
3) package the whole bunch as JAR.
