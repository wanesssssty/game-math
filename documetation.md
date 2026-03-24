# Math Paws (Game Math)

Інтерактивний тренажер математики для дітей: додавання, віднімання, множення, ділення, змішаний тест, магазин та інвентар.  
Фронтенд — **Next.js** (App Router), бекенд — **Express**, дані — **PostgreSQL** через **Prisma**.

---

## Зміст

- [Архітектура](#архітектура)
- [Що є в проєкті](#що-є-в-проєкті)
- [База даних](#база-даних)
- [Швидкий старт (локально)](#швидкий-старт-локально)
- [Docker](#docker)
- [Змінні середовища](#змінні-середовища)
- [API](#api)
- [Корисні команди](#корисні-команди)
- [Структура репозиторію](#структура-репозиторію)
- [Що можна зробити далі](#що-можна-зробити-далі)

---

## Архітектура

| Частина   | Технології |
|-----------|------------|
| **client**| Next.js 16, React 19, TypeScript, Tailwind CSS v4, **shadcn/ui** |
| **server**| Node.js, Express 5, Prisma ORM 7, драйвер `@prisma/adapter-pg` + `pg` |
| **БД**    | PostgreSQL 16 (Docker), міграції Prisma Migrate |

Клієнт звертається до API за `NEXT_PUBLIC_API_BASE_URL` (локально типово **`http://localhost:4001`**, у повному Docker Compose — `http://localhost:4000`).

---

## Що є в проєкті

### Клієнт (`client`)

- **Сторінки:** головна (`/`), режими `/addition`, `/subtraction`, `/multiplication`, `/division`, змішаний тест `/test`, логін `/login`, магазин `/shop`, інвентар `/inventory`.
- **UI:** Tailwind utility-класи, компоненти **shadcn/ui** (`Button`, `Card`, `Input`, `Badge`, `Dialog`, `Progress`, `Tabs` тощо).
- **Ігри:** калькулятор для відповіді, прогрес по 10 питань у режимах операцій, діалоги результатів, журнал помилок у тесті.
- **API-шар:** `lib/api` — уніфіковані запити; `lib/config.ts` — базовий URL бекенду.
- **Прогрес:** після сесії відправка на `POST /api/progress` (fallback у `localStorage`, якщо API недоступний) — `lib/progress-storage.ts`.

Детальніше: [`client/README.md`](./client/README.md).

### Сервер (`server`)

- Express: CORS, JSON, роути під `/api`, обробка 404 та помилок.
- **Prisma** + PostgreSQL: повна ігрова схема (користувачі, коти, кастомізація, прогрес, сесії, журнал помилок).
- Ендпоінти прогресу сумісні з поточним клієнтом (guest-користувач за ім’ям дитини); окремо — **реєстрація/логін**, задачі, магазин, інвентар, аватар, `GET /api/errors` (див. `server/README.md`).

Детальніше: [`server/README.md`](./server/README.md).

---

## База даних

### Підключення

- **Локально з хоста:** Postgres у Docker проброшено на порт **`5433`** (порт `5432` часто зайнятий у Windows).
- **З контейнера `server`:** хост БД — `postgres`, порт **5432** (внутрішня мережа Compose). У `docker-compose.yml` для сервісу `server` задано `DATABASE_URL`.

Рядок підключення для роботи **з твого ПК** (Prisma CLI, локальний Node):

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/game_math?schema=public"
```

### Enum-и (Prisma)

| Enum | Значення |
|------|----------|
| **Rarity** | `COMMON`, `RARE`, `EPIC`, `LEGENDARY` |
| **OperationType** | `ADD`, `SUB`, `MUL`, `DIV` |
| **CustomizationType** | `FUR`, `EYES`, `ACCESSORY`, `BACKGROUND` |

### Таблиці (моделі)

| Модель | Призначення |
|--------|-------------|
| **User** | Користувач: email, пароль, ім’я, баланс цукерок, обраний кіт |
| **Cat** | Кіт: ім’я, рідкість, URL зображення |
| **UserCat** | Які коти розблоковані користувачем (`userId` + `catId` унікальні разом) |
| **CustomizationOption** | Елемент кастомізації: тип, ціна, рідкість, картинка |
| **UserCustomization** | Куплені/відкриті кастомізації |
| **UserCatCustomization** | Активна кастомізація по типу на користувача (`userId` + `type` унікальні) |
| **Progress** | Агрегат по операції та рівню: `highScore`, `bestStreak` (`userId` + `operationType` + `level` унікальні) |
| **GameSession** | Окрема зіграна сесія: рахунок, правильні/неправильні відповіді, час |
| **ErrorLog** | Журнал помилок (операція, числа, відповіді, спроби) |

Міграції лежать у `server/prisma/migrations/`. Після зміни схеми:

```bash
cd server
npx prisma migrate dev    # dev: створити й застосувати міграцію
# або
npx prisma migrate deploy # CI / production
```

**Перегляд таблиць у браузері:**

```bash
cd server
npx prisma studio
```

---

## Швидкий старт (локально)

### 0) PostgreSQL

З кореня репозиторію:

```bash
docker compose up -d postgres
```

Переконайся, що в `server/.env` є `DATABASE_URL` на `localhost:5433` (скопіюй з `server/.env.example`).

### 1) Бекенд

```bash
cd server
npm install
cp .env.example .env
# відредагуй .env за потреби
npx prisma migrate deploy
npm run dev
```

Сервер: **http://localhost:4001** (див. `PORT` у `server/.env`; у Docker без змін — **4000**)

### 2) Фронтенд

```bash
cd client
npm install
cp .env.example .env.local
# NEXT_PUBLIC_API_BASE_URL=http://localhost:4001
npm run dev
```

Клієнт: **http://localhost:3000**

### Що робити, якщо «нічого не запускається» (Windows + Docker)

1. **API не відповідає / curl: Empty reply на порту 4000**  
   Часто порт **4000** зайнятий **`com.docker.backend`** (Docker Desktop), а не Node. Перевір: `netstat -ano | findstr :4000` → якщо PID = `com.docker.backend`, у **`server/.env`** постав **`PORT=4001`** і в **`client/.env.local`** — **`NEXT_PUBLIC_API_BASE_URL=http://localhost:4001`**, потім перезапусти сервер.

2. **Next пише «Port 3000 is in use», стартує на 3001**  
   У `server` у режимі `development` CORS тепер дозволяє будь-який `http://localhost:*`, тож фронт на 3001 має працювати. Або звільни порт 3000.

3. **Помилки Prisma / БД**  
   Підніми Postgres: `docker compose up -d postgres`, перевір `DATABASE_URL` (з хоста — порт **5433**).

---

## Docker

Підняти **postgres + server + client** одночасно:

```bash
docker compose up --build
```

- Клієнт: http://localhost:3000  
- API: http://localhost:4000  
- Postgres на хості: **localhost:5433** (мапінг `5433:5432`)

Зупинка:

```bash
docker compose down
```

З видаленням volume БД:

```bash
docker compose down -v
```

---

## Змінні середовища

### `server/.env` (приклад у `.env.example`)

| Змінна | Опис |
|--------|------|
| `NODE_ENV` | `development` / `production` |
| `PORT` | Порт API (локально за замовчуванням **`4001`**; у `docker-compose` для сервісу `server` залишається `4000`) |
| `CORS_ORIGIN` | Origin фронтенду, напр. `http://localhost:3000` |
| `DATABASE_URL` | PostgreSQL (локально: `localhost:5433`; у Docker для `server` задається в compose) |

### `client/.env.local`

| Змінна | Опис |
|--------|------|
| `NEXT_PUBLIC_API_BASE_URL` | Базовий URL API (`http://localhost:4001` локально; з Compose — `http://localhost:4000`) |

---

## API

Повна таблиця маршрутів, тіла запитів і **приклади curl** — у [`server/README.md`](./server/README.md).

Коротко:

| Метод | Шлях | Опис |
|--------|------|------|
| `GET` | `/` | Статус API |
| `GET` | `/api/health` | Health check |
| `POST` | `/api/register`, `POST /api/login` | Реєстрація та логін (JWT) |
| `GET` | `/api/shop`, `POST /api/shop/buy` | Магазин; покупка з JWT |
| `GET` | `/api/problem`, `POST /api/problem/answer`, `GET /api/hint` | Задачі з токеном `problemToken` (JWT) |
| `GET` | `/api/inventory`, `POST /api/avatar/update`, `GET /api/errors` | Інвентар, аватар, журнал помилок (JWT) |
| `POST` | `/api/progress` | Зберегти сесію прогресу (guest, без JWT) |
| `GET` | `/api/progress/:childName` | Прогрес guest-користувача |

Формат відповіді узгоджений з `lib/api/client.ts` (`success` + `data` / `error`).

---

## Корисні команди

### Корінь / Docker

```bash
docker compose up -d postgres   # лише БД
docker compose up --build       # повний стек dev
```

### Client

```bash
cd client
npm run dev
npm run build
npm run lint
```

### Server

```bash
cd server
npm run dev
npm run start
npx prisma studio
npx prisma migrate deploy
npx prisma generate
npx prisma db seed
```

---

## Структура репозиторію

```
game-math/
├── client/                 # Next.js
│   ├── app/                # сторінки (page.tsx, layout)
│   ├── components/         # SiteFrame, ігри, ui/shadcn
│   ├── lib/                # api, config, progress-storage, store-items
│   └── public/
├── server/                 # Express API
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── prisma.config.ts    # Prisma 7: URL БД для CLI
│   └── src/
│       ├── app.js
│       ├── routes/
│       ├── controllers/
│       ├── db/prisma.js    # PrismaClient + adapter pg
│       └── utils/
├── docker-compose.yml
└── README.md               # цей файл
```

---

## Що можна зробити далі

1. Реєстрація / логін з хешуванням пароля та JWT або сесіями.
2. Прив’язати `childName` до справжнього `userId` замість guest-email.
3. REST для котів, магазину, кастомізації та запису **ErrorLog** з клієнта.
4. Seed-скрипт для `Cat` та `CustomizationOption`.
5. Тести (Vitest/Jest + Supertest для API).
6. CI: lint, build, `prisma migrate deploy` на staging.

---

## Додаткова документація

- [Клієнт](./client/README.md)
- [Сервер і БД](./server/README.md)
