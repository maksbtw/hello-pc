# Backend Docker image

Build from the `backend` directory (Docker builds the application with Java 21
and Maven 3.9.9):

```bash
docker build -t pc-workshop-backend .
```

Run with the local LLM listening on the host's port 8081:

```bash
docker run --rm --name pc-workshop-backend \
  -p 8080:8080 \
  --add-host=host.docker.internal:host-gateway \
  -e LLAMA_URL=http://host.docker.internal:8081 \
  pc-workshop-backend
```

The backend is available at `http://localhost:8080` and uses the `prod` profile.
Override the profile with `-e SPRING_PROFILES_ACTIVE=dev` if needed.

On Linux, the host LLM must listen on an address reachable from Docker's bridge
network; binding only to `127.0.0.1` will not work with the command above. For an
LLM bound to loopback, use host networking instead:

```bash
docker run --rm --name pc-workshop-backend --network host \
  -e LLAMA_URL=http://127.0.0.1:8081 \
  pc-workshop-backend
```

Host networking shares the host's port 8080 directly, so no `-p` is needed.
For an LLM in another container, put both containers on the same Docker network
and set `LLAMA_URL` to its container name and port (for example,
`http://llama:8081`). The image contains only the backend; run the LLM separately.

The first image build needs internet access to download the base images and Maven
dependencies. Once built, the backend can run offline with a local LLM.
