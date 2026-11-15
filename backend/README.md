# Backend Docker image

Start both the frontend and backend with Docker Compose from the project root
(`hello-pc`, the parent of this directory):

```bash
docker compose up --build -d
```

The frontend is available at `http://localhost:5174` and the backend at
`http://localhost:8080`. View logs with `docker compose logs -f` and stop both
services with `docker compose down`. Use `docker compose up --build -d backend`
to start only the backend.

Stop any separately started containers using ports 5174 or 8080 before starting
Compose. Set `FRONTEND_PORT` or `BACKEND_PORT` to use another host port.

Compose connects the frontend to the backend through `http://backend:8080` on
their shared Docker network.
With `sudo`, pass overrides with `sudo env VARIABLE=value docker compose ...`.

To build the image separately, run this from the `backend` directory. Docker
builds the application with Java 21 and Maven 3.9.9:

```bash
docker build -t pc-workshop-backend .
```

Run it:

```bash
docker run --rm --name pc-workshop-backend -p 8080:8080 pc-workshop-backend
```

The backend is available at `http://localhost:8080` and uses the `prod` profile.
Override the profile with `-e SPRING_PROFILES_ACTIVE=dev` if needed.

The first image build needs internet access to download the base images and Maven
dependencies.
