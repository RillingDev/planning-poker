# Planning-Poker

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
