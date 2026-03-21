# Game Math Server

## Run locally

1. Install dependencies:

```bash
npm install
```

2. Create env file:

```bash
cp .env.example .env
```

3. Start dev server:

```bash
npm run dev
```

Server starts at `http://localhost:4000`.

## API

- `GET /` - base server status
- `GET /api/health` - health check

## Suggested next steps

- add feature routers under `src/routes`
- add controllers/services per domain
- add request validation for each endpoint
- add tests (`vitest` or `jest` + `supertest`)
