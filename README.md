# Game Math — коротка документація

Проєкт складається з двох частин:

- `client` — фронтенд на Next.js.
- `server` — бекенд API на Express.

## Що вже є в проєкті

### Клієнт (`client`)
- App Router структура (`app/layout.tsx`, `app/page.tsx`).
- Базовий API-шар (`lib/api`) для запитів на бекенд.
- Конфіг API URL через змінну середовища (`lib/config.ts`).
- Підключений lint (`npm run lint`).

### Сервер (`server`)
- Базовий Express сервер з `CORS` та `JSON` middleware.
- Health endpoint: `GET /api/health`.
- 404 middleware + глобальний error handler.
- Конфіг середовища через `.env`.

## Як запустити локально

### 1) Запуск сервера

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

Сервер стартує на: `http://localhost:4000`.

### 2) Запуск клієнта

```bash
cd client
npm install
cp .env.example .env.local
npm run dev
```

Клієнт стартує на: `http://localhost:3000`.

## Запуск через Docker (dev)

Можна запускати фронт і бек одночасно однією командою.

### Передумова
- Встановлений Docker Desktop (або Docker Engine + Compose).

### Команди

```bash
docker compose up --build
```

Після старту:
- клієнт: `http://localhost:3000`
- сервер: `http://localhost:4000`

Зупинка:

```bash
docker compose down
```

Якщо хочеш прибрати volumes та контейнери:

```bash
docker compose down -v
```

## Корисні команди

### Client
- `npm run dev` — режим розробки.
- `npm run build` — production build.
- `npm run start` — запуск production версії.
- `npm run lint` — перевірка коду ESLint.

### Server
- `npm run dev` — запуск сервера в режимі розробки.
- `npm run start` — звичайний запуск сервера.

## Змінні середовища

### `server/.env`
- `NODE_ENV` — середовище (`development`/`production`).
- `PORT` — порт сервера (за замовчуванням `4000`).
- `CORS_ORIGIN` — дозволений origin для клієнта.

### `client/.env.local`
- `NEXT_PUBLIC_API_BASE_URL` — базовий URL бекенду (зазвичай `http://localhost:4000`).

## Поточна структура (спрощено)

- `client/app` — сторінки та layout.
- `client/lib/api` — API-клієнт і endpoint-функції.
- `server/src/config` — env/config.
- `server/src/routes` — маршрути API.
- `server/src/controllers` — обробники HTTP.
- `server/src/middlewares` — middleware обробки помилок і 404.

## Що робити далі

1. Додавати доменні модулі (наприклад, `users`, `tasks`, `levels`).
2. Підключити валідацію запитів (наприклад, через `zod`).
3. Підключити БД та міграції.
4. Додати авторизацію.
5. Налаштувати тести і CI.
