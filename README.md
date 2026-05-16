# Notes Backend (Node.js)

REST API for a multi-user notes service (intern assignment).

## Stack

- **Node.js** + **Express**
- **MongoDB** (`mongoose`)
- **JWT** auth, **bcrypt** password hashing
- **OpenAPI 3.0** at `GET /openapi.json`

## Setup

### Backend (port 3000)

```bash
cp .env.example .env
# Edit .env: MONGODB_URI, JWT_SECRET, ABOUT_NAME, ABOUT_EMAIL

npm install
npm run dev
```

Uses **nodemon** + `server.js` — auto-restarts when you change backend files.

API: `http://localhost:3000`

### Frontend (port 3001) — Next.js

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

App: `http://localhost:3001`

## API endpoints

| Method | Path | Auth |
|--------|------|------|
| POST | `/register` | No |
| POST | `/login` | No |
| GET | `/notes` | Bearer JWT |
| GET | `/notes/:id` | Bearer JWT |
| POST | `/notes` | Bearer JWT |
| PUT | `/notes/:id` | Bearer JWT |
| DELETE | `/notes/:id` | Bearer JWT |
| POST | `/notes/:id/share` | Bearer JWT |
| PATCH | `/notes/:id/pin` | Bearer JWT (custom) |
| GET | `/about` | No |
| GET | `/openapi.json` | No |

## Deploy (Render)

1. Push to GitHub.
2. Create a **Web Service** on [Render](https://render.com), connect the repo.
3. Set env vars: `MONGODB_URI` (MongoDB Atlas connection string), `JWT_SECRET`, `ABOUT_NAME`, `ABOUT_EMAIL`.
4. Submit the service URL (e.g. `https://notes-backend.onrender.com`) as your assignment base URL.

**MongoDB Atlas (free):** Create a cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas), get the connection string, and set `MONGODB_URI`.

## Quick test

```bash
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@test.com","password":"secret12"}'

curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@test.com","password":"secret12"}'
```
