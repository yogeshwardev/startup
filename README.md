# CampusArena

CampusArena is a college-exclusive competitive coding and career preparation platform with student, teacher, and admin portals. This MVP uses React, Tailwind CSS, Monaco Editor, Express, MongoDB, Redis, Socket.IO, and Docker-isolated code execution.

## Structure

- `client` React frontend with role-aware dashboards
- `server` Express API, JWT auth, RBAC, leaderboards, analytics, and queue-backed evaluation
- `docker` container configs for the app and secure code runner

## Core capabilities

- College-email registration and JWT login
- Docker-only code execution for Python, C, C++, and Java
- Hidden test evaluation and submission history
- Global and department leaderboards with live WebSocket updates
- Department war aggregation
- Teacher analytics and admin messaging
- Admin problem management, user management, and analytics
- Fitness and nutrition suggestion engine

## Local setup

1. Copy `server/.env.example` to `server/.env`.
2. Copy `client/.env.example` to `client/.env` if you want custom frontend URLs.
3. Start Docker Desktop or another Docker engine.
4. Run `docker compose up --build` to start MongoDB, Redis, and build the isolated runner image.
5. Start the backend and frontend on the host with `npm.cmd`.

Infrastructure services:

- MongoDB: `mongodb://localhost:27017`
- Redis: `redis://localhost:6379`

Application services started on the host:

- Frontend: `http://localhost:5173`
- API: `http://localhost:5000/api`

## Direct development without Compose

Backend:

```powershell
cd server
npm.cmd install
Copy-Item .env.example .env
npm.cmd run dev
```

Frontend:

```powershell
cd client
npm.cmd install
npm.cmd run dev
```

You still need MongoDB, Redis, and Docker running locally because submissions are evaluated in isolated containers and never on the host.

## Execution sandbox

Every execution is designed to:

- run in a Docker container
- use `--network none`
- enforce CPU and memory limits
- use a 3 second timeout
- mount isolated temp files only

Language commands:

- Python: `python3 main.py`
- C: `gcc main.c -o main && ./main`
- C++: `g++ main.cpp -o main && ./main`
- Java: `javac Main.java && java Main`

## Seed data

```powershell
cd server
npm.cmd install
npm.cmd run seed
```

This creates an admin account and a sample daily problem.

## Default admin seed

- Email: `admin@campusarena.edu`
- Password: `Admin@123`

## Notes

- The backend expects the host machine to have both the Docker CLI and Docker engine available.
- Redis powers the BullMQ queue for parallel execution handling.
- Socket.IO broadcasts leaderboard refreshes after successful evaluation jobs.
