# Planning-Poker

## Development

### Requirements

- Node.js 18
- JDK 17
- Maven
- IntelliJ IDEA

### Development Mode

Use the run config 'PlanningpokerApplication' and go to http://localhost:8080

### Build for Production

Run `mvn package`.
This will:

1) compile the backend.
2) compile the frontend into the compiled backend files directory.
3) package the whole bunch as JAR.