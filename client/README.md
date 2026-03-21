# Game Math Client

## Run locally

1. Install dependencies:

```bash
npm install
```

2. Create local env file:

```bash
cp .env.example .env.local
```

3. Start development server:

```bash
npm run dev
```

Client runs at `http://localhost:3000`.

## Environment

- `NEXT_PUBLIC_API_BASE_URL` - base URL for backend API, default `http://localhost:4000`.

## Structure

- `app` - Next.js App Router pages/layout.
- `lib/api` - reusable API client and endpoint functions.
- `lib/config.ts` - runtime config values.
