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

## Deploy (Render — recommended)

No Fly CLI or global app names. Free tier works for the assignment.

### Option A — Blueprint (fastest)

1. Push this repo to GitHub (`main` branch must include `render.yaml`).
2. Go to [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**.
3. Connect repo `MicrosoftRajan/EpifiShare` (or your fork).
4. When prompted for env vars, paste from your local `.env`:
   - `MONGODB_URI` — Atlas connection string
   - `ABOUT_NAME` — e.g. `Rajan Yadav`
   - `ABOUT_EMAIL` — your email  
   (`JWT_SECRET` is auto-generated; you can keep it or replace in the dashboard.)
5. Click **Apply**. Wait for deploy (~2–5 min).
6. Open `https://epifi-share-api.onrender.com/about` (name may vary slightly).
7. **Submit that base URL** for the assignment (e.g. `https://epifi-share-api.onrender.com`).

### Option B — Web Service (manual)

1. **New** → **Web Service** → connect GitHub repo.
2. Settings:
   - **Root directory:** leave empty (repo root)
   - **Runtime:** Node
   - **Build:** `npm install`
   - **Start:** `npm start`
   - **Health check path:** `/health`
3. **Environment** (add all):

   | Key | Value |
   |-----|--------|
   | `MONGODB_URI` | Atlas URI from `.env` |
   | `JWT_SECRET` | long random string |
   | `JWT_EXPIRES_IN` | `24h` |
   | `ABOUT_NAME` | your name |
   | `ABOUT_EMAIL` | your email |
   | `SEED_ON_START` | `false` |
   | `COOKIE_SECURE` | `true` |
   | `NODE_ENV` | `production` |

4. Deploy → copy the `*.onrender.com` URL.

**MongoDB Atlas:** In Atlas → **Network Access** → allow `0.0.0.0/0` (or Render’s IPs) so the cloud service can reach the cluster.

**Cold start:** Free tier sleeps after ~15 min idle; first request may take ~30s.

### Frontend (optional)

On Vercel, set `NEXT_PUBLIC_API_URL` to your Render URL (e.g. `https://epifi-share-api.onrender.com`).

## Quick test

```bash
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@test.com","password":"secret12"}'

curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@test.com","password":"secret12"}'
```
