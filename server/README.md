# Math Paws — сервер (Express + Prisma)

REST API для гри: перевірка живості сервісу, аутентифікація, математичні задачі з JWT-токеном задачі, магазин і аватар, збереження **ігрових** сесій і агрегованого прогресу в **PostgreSQL** через **Prisma ORM 7** (підключення **`@prisma/adapter-pg`** і пул **`pg`**).

## Що потрібно встановити локально

- **Node.js** (LTS) і **npm**
- **PostgreSQL** (або тільки Docker — див. кореневий `docker-compose.yml`)

## Швидкий старт (без Docker лише для сервера)

```bash
cd server
npm install
cp .env.example .env
```

У `.env` вкажи робочий **`DATABASE_URL`**. У репозиторії Postgres для хоста зазвичай слухає порт **5433** (мапа з контейнера) — див. кореневий [README.md](../README.md) і `docker-compose.yml`.

```bash
npx prisma migrate deploy
node prisma/seed.js   # коти (якщо немає за іменем) + товари магазину (якщо таблиця порожня)
npm run dev
```

За замовчуванням сервер слухає **http://localhost:4001** (`PORT` у `src/config/env.js`). У **`docker compose up`** для контейнера `server` задано **`PORT=4000`** і проброс **4000:4000**.

**Якщо на порту 4000 «порожня відповідь»** (часто Windows + Docker Desktop) — працюй локально з **`PORT=4001`** у `.env`. Для середовища з вимогою **8080**: `PORT=8080`.

## Повний стек через Docker

З кореня репозиторію:

```bash
docker compose up --build
```

- API: **http://localhost:4000**
- Клієнт очікує `NEXT_PUBLIC_API_BASE_URL=http://localhost:4000` (у compose вже так).
- Postgres усередині мережі compose: хост `postgres`, порт **5432**; з машини хоста — зазвичай **localhost:5433**.
- У dev-контейнері сервера міграції Prisma і `node prisma/seed.js` виконуються автоматично перед стартом `npm run dev`, тож для першого запуску окремі команди зазвичай не потрібні.

## Prisma

| Файл | Призначення |
|------|-------------|
| `prisma/schema.prisma` | Моделі та enum-и (URL БД тут не задається — лише `provider`) |
| `prisma.config.ts` | У **Prisma 7** URL для CLI (`migrate`, `studio`) береться з `datasource.url` через `env("DATABASE_URL")` |
| `src/db/prisma.js` | Singleton `PrismaClient` з адаптером PostgreSQL для runtime |

Після зміни схеми:

```bash
npx prisma migrate dev --name короткий_опис
npx prisma generate
```

Перегляд даних:

```bash
npx prisma studio
```

### Сід `prisma/seed.js`

- **Коти:** три записи з іменами на кшталт «Пухнастик», «Розумник», «Зірка» — додаються, якщо кота з таким **ім’ям** ще немає.
- **Магазин:** масив `CustomizationOption` записується **лише якщо** таблиця порожня (`count === 0`).

## Моделі даних

| Модель | Поля / поведінка (коротко) |
|--------|----------------------------|
| `User` | `email` (унікальний), `password` (nullable — у гостей немає), `name`, `candyBalance`, `selectedCatId`, `createdAt` |
| `Cat` | `name`, `Rarity`, `imageUrl` |
| `UserCat` | Розблоковані коти користувача; `@@unique([userId, catId])` |
| `CustomizationOption` | Елемент магазину: `name`, `CustomizationType`, `imageUrl`, `price`, `Rarity` |
| `UserCustomization` | Покупка: власність на опцію; `@@unique([userId, customizationId])` |
| `UserCatCustomization` | Що **зараз одягнуто** по типу (один предмет на тип); `@@unique([userId, type])` |
| `Progress` | Рекорди: `operationType`, `level` (1…10 у API), `highScore`, `bestStreak`; `@@unique([userId, operationType, level])` |
| `GameSession` | Одна збережена сесія: `score`, `correctAnswers`, `wrongAnswers`, `operationType`, `level`, `createdAt` |
| `ErrorLog` | Невірні відповіді в режимі з JWT-задачею: числа, `correctAnswer`, `userAnswer`, `attempts`, `createdAt` |

**Enum-и** (рядки саме такі, великі літери): `Rarity`, `OperationType` (`ADD` \| `SUB` \| `MUL` \| `DIV`), `CustomizationType` (`FUR` \| `EYES` \| `ACCESSORY` \| `BACKGROUND`).

### Важливо: де з’являється `GameSession`

- **`POST /api/progress`** (гість без JWT): створює `GameSession` і оновлює `Progress.highScore` для **рівня 1**.
- **`POST /api/problem/answer`** (користувач з JWT): оновлює баланс цукерок, `Progress` (рахунок/стрік) і при помилці пише в **`ErrorLog`** — **рядок `GameSession` для цього потоку не створюється**.

## Формат відповідей і помилок

Успіх (типово):

```json
{ "success": true, "data": { ... } }
```

Помилка (через `HttpError` або 500):

```json
{ "success": false, "error": { "message": "...", "details": null } }
```

Захищені маршрути очікують заголовок:

```http
Authorization: Bearer <token>
```

де `<token>` — значення **`data.token`** з відповіді `POST /api/register` або `POST /api/login` (у документації та старих клієнтах інколи помилково пишуть `accessToken` — у цьому сервері поле називається **`token`**).

## JWT: два типи токенів

| Тип | Поле `kind` | TTL | Призначення |
|-----|-------------|-----|-------------|
| Вхід | `auth` | **7 діб** | `Authorization: Bearer …` для захищених маршрутів |
| Задача | `problem` | **15 хв** | `problemToken` у тілі/запиті; містить `sub` (user id), операцію, числа, правильну відповідь, рівень |

Секрет: `JWT_SECRET` (у production обов’язково довгий випадковий рядок).

## CORS

- У **`development`** (`NODE_ENV=development`) дозволено **будь-який** `Origin` (`cors` з `origin: true`), щоб Next.js на іншому localhost-порту не ламався.
- У **production** дозволено лише **`CORS_ORIGIN`** (наприклад `https://твій-домен`).

## API

Усі маршрути з таблиць нижче (крім `GET /`) під префіксом **`/api`**.

### Публічні маршрути

| Метод | Шлях | Опис |
|--------|------|------|
| `GET` | `/` | Коротке повідомлення + підказка про `/api/health` |
| `GET` | `/api/health` | `data.status`, `service`, `timestamp` (ISO) |
| `POST` | `/api/register` | Реєстрація |
| `POST` | `/api/login` | Вхід |
| `GET` | `/api/shop` | Каталог `CustomizationOption` |
| `POST` | `/api/progress` | Зберегти **гостьову** сесію (без JWT) |
| `GET` | `/api/progress/:childName` | Сесії та `Progress` для гостя за відображуваним ім’ям |

**`POST /api/register`** — тіло JSON:

| Поле | Обов’язкове | Опис |
|------|-------------|------|
| `email` | так | Рядок; нормалізується `trim` + lower case |
| `password` | так | Мінімум **6** символів |
| `name` | ні | Відображуване ім’я |

Відповідь **201**: `data.token`, `data.user` (`id`, `email`, `name`, `candyBalance`). Додатково в транзакції користувачу прив’язується **перший кіт за алфавітом імені** (`UserCat`), якщо в БД є хоч один кіт.

**`POST /api/login`** — `email`, `password`. Відповідь **200**: така ж структура `data.token` / `data.user`. Помилка **401** при невірних даних.

**`GET /api/shop`** — **200**: `data.items` — масив опцій з усіма полями моделі, сортування: `rarity` потім `price` зростання.

**`POST /api/progress`** — гостьовий сейв (див. окремий підрозділ нижче).

**`GET /api/progress/:childName`** — **200** навіть якщо користувача ще не було: `data.childName`, `data.sessions` (до 50 останніх за часом), `data.progress` (масив записів `Progress` або `[]`).

### Захищені маршрути (JWT `kind: auth`)

| Метод | Шлях | Опис |
|--------|------|------|
| `GET` | `/api/account` | Дані акаунту: баланс, котик, інвентар, прогрес, останні помилки |
| `GET` | `/api/problem` | Нова задача |
| `POST` | `/api/problem/answer` | Перевірка відповіді |
| `GET` | `/api/hint` | Текст підказки для поточного `problemToken` |
| `POST` | `/api/shop/buy` | Покупка за цукерки |
| `GET` | `/api/inventory` | Куплені предмети |
| `POST` | `/api/avatar/update` | Обраний кіт і/або екіпіровка |
| `GET` | `/api/errors` | Журнал помилкових відповідей |

**`GET /api/account`**

Повертає зведені дані для дашборду користувача:

- `data.user` — базова інформація користувача (`id`, `email`, `name`, `candyBalance`);
- `data.selectedCat` — активний кіт або `null`;
- `data.unlockedCats[]` — усі відкриті котики;
- `data.inventory[]` — куплені предмети з вкладеним `option`;
- `data.equipped[]` — активні кастомізації;
- `data.progress[]` — записи `Progress` для різних операцій і рівнів;
- `data.recentErrors[]` — останні помилки з `ErrorLog`.

**`GET /api/problem`**

Query:

| Параметр | За замовчуванням | Опис |
|----------|------------------|------|
| `operationType` | `ADD` | `ADD` \| `SUB` \| `MUL` \| `DIV` (без урахування регістру в діапазоні, у відповіді — верхній регістр) |
| `level` | `1` | Ціле **1…10** (обмтачається в коді) |

Відповідь **200**: `data.problemToken`, `number1`, `number2`, `operationType`, `level`, `display` (рядок на кшталт `3 + 4 = ?`).

Генерація чисел залежить від рівня (ширші діапазони для додавання/віднімання, обмеження для множення/ділення) — реалізація: `src/utils/math-problem.js`.

**`POST /api/problem/answer`**

Тіло: `{ "problemToken": "…", "answer": <число> }`.

- Токен має бути валідним **`problem`** JWT і `sub` = id поточного користувача.
- Якщо **невірно**: пишеться `ErrorLog`, відповідь **200** з `data.correct: false`, `data.message`.
- Якщо **вірно**: нараховується **`CANDY_PER_CORRECT`** (див. env), для пари `(operationType, level)` у `Progress` поля **`highScore`** і **`bestStreak`** збільшуються на **1** (на відміну від гостьового `POST /api/progress`, де `highScore` = max з сесій). Відповідь **200**: `correct`, `candyEarned`, `candyBalance`, `message`.

**`GET /api/hint`**

Передай `problemToken` одним із способів:

- query: `?problemToken=…`
- поле `problemToken` в **тілі** запиту (Express все одно читає `req.body`, якщо клієнт його передав разом із **GET** — рідко; зазвичай достатньо query)
- заголовок `x-problem-token`

**`POST /api/shop/buy`** — `{ "customizationId": "<uuid>" }`. Перевірки: існування товару, баланс, дубль покупки. **200**: повідомлення, `customizationId`, новий `candyBalance`.

**`GET /api/inventory`** — **200**: `data.items[]` з `id`, `customizationId`, `option` (повна `CustomizationOption`).

**`POST /api/avatar/update`**

Тіло: потрібно хоча б одне з полів:

- `selectedCatId` — uuid кота; кіт має існувати і бути в `UserCat` для цього користувача.
- `equipped` — масив `{ "customizationId", "type" }`, де `type` збігається з типом предмета в БД; предмет має бути куплений (`UserCustomization`).

**200**: `selectedCatId`, `selectedCat`, `equipped` (масив `UserCatCustomization` з вкладеною `customization`).

**`GET /api/errors`**

Query: `limit` — скільки останніх записів (за замовчуванням **50**, максимум **200**). Відповідь **200**: `data.errors` — масив `ErrorLog` за `userId` поточного користувача.

## Гостьовий прогрес: `POST /api/progress`

Без JWT. Використовується для збереження сесії з клієнта під «ім’ям дитини».

| Поле | Тип | Обов’язкове | Опис |
|------|-----|-------------|------|
| `childName` | string | так | Відображуване ім’я |
| `operation` | string | так | Рівно одне з: `add`, `subtract`, `multiply`, `divide` |
| `totalQuestions` | integer | так | > 0 |
| `answered` | integer | так | 0…`totalQuestions` |
| `correct` | integer | так | 0…`answered` |
| `completedAt` | string (ISO-дата) | так | Валідна дата; для `GameSession.createdAt` |

Логіка:

1. Email гостя: `guest.<slug>@mathpaws.local`, де `slug` з `childName` (lower case, неалфанум → `-`, обрізка). Див. `src/utils/guest-user.js`.
2. `User` upsert за email; `name` оновлюється до `childName`.
3. Створюється **`GameSession`**: `level = 1`, `score = correct`, `wrongAnswers = answered - correct`, `createdAt = completedAt`.
4. **`Progress`**: для `(operationType, level 1)` поле `highScore` стає **максимумом** з попереднього та поточного `correct`; `bestStreak` для гостьового шляху при upsert не змінюється з сесії (залишається як у реалізації `progress.controller.js`).

Відповідь **201**: об’єкт з `userId`, `operation` / `operationType`, підсумками сесії, `gameSessionId` тощо.

## Приклади (curl)

Підстав порт з `.env`: локально часто **4001**, у Docker — **4000**.

```bash
# 1) Health
curl -s http://localhost:4001/api/health

# 2) Реєстрація
curl -s -X POST http://localhost:4001/api/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"user@example.com\",\"password\":\"secret123\",\"name\":\"Тест\"}"

# 3) Лінійним конвеєром: дістань token (потрібен jq)
TOKEN=$(curl -s -X POST http://localhost:4001/api/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"user@example.com\",\"password\":\"secret123\"}" | jq -r '.data.token')

# 4) Задача
curl -s "http://localhost:4001/api/problem?operationType=ADD&level=1" \
  -H "Authorization: Bearer $TOKEN"

# 5) Відповідь (problemToken з кроку 4)
curl -s -X POST http://localhost:4001/api/problem/answer \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"problemToken\":\"PASTE_TOKEN\",\"answer\":7}"

# 6) Магазин і покупка
curl -s http://localhost:4001/api/shop
curl -s -X POST http://localhost:4001/api/shop/buy \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"customizationId\":\"UUID_FROM_SHOP\"}"

# 7) Помилки (останні 20)
curl -s "http://localhost:4001/api/errors?limit=20" \
  -H "Authorization: Bearer $TOKEN"
```

У **Postman** для захищених запитів: **Authorization → Bearer Token** = значення **`data.token`**.

## Змінні середовища

| Змінна | Опис |
|--------|------|
| `NODE_ENV` | `development` або `production` (впливає на CORS) |
| `PORT` | Порт HTTP (за замовчуванням **4001** локально; у compose для сервера — **4000**) |
| `CORS_ORIGIN` | Дозволений origin у production (у dev зазвичай ігнорується на користь вільного localhost) |
| `DATABASE_URL` | Рядок підключення PostgreSQL для Prisma і `pg` |
| `JWT_SECRET` | Секрет підпису всіх JWT |
| `CANDY_PER_CORRECT` | Цукерки за одну правильну відповідь у `POST /api/problem/answer` (за замовчуванням **5**) |

Шаблон: [.env.example](.env.example).

## Скрипти `package.json`

| Скрипт | Команда |
|--------|---------|
| `npm run dev` | `node --watch src/server.js` |
| `npm run start` | `node src/server.js` |
| `npm run prisma:migrate` | `prisma migrate dev` |
| `npm run prisma:generate` | `prisma generate` |

Сід задається в `package.json` → `"prisma": { "seed": "node prisma/seed.js" }`; запуск: `npx prisma db seed`.

## Структура `src/`

```
src/
├── server.js                 # Точка входу: listen(env.port)
├── app.js                    # Express: cors, json, маршрути, 404, error handler
├── config/
│   ├── env.js                # Змінні середовища
│   └── index.js              # Реекспорт config
├── db/
│   └── prisma.js            # PrismaClient + adapter-pg
├── routes/
│   ├── index.js             # apiRouter: публічні маршрути + requireAuth + захищені
│   ├── health.route.js
│   └── progress.route.js    # POST /, GET /:childName (під /api/progress)
├── controllers/
│   ├── auth.controller.js
│   ├── problem.controller.js
│   ├── progress.controller.js
│   ├── shop.controller.js
│   ├── inventory.controller.js
│   ├── avatar.controller.js
│   ├── errors-list.controller.js
│   └── health.controller.js
├── middlewares/
│   ├── auth.js              # requireAuth
│   ├── not-found.js
│   └── error-handler.js
└── utils/
    ├── jwt.js               # auth / problem токени
    ├── password.js
    ├── http-error.js
    ├── math-problem.js
    ├── operation-map.js     # add → ADD, …
    └── guest-user.js      # email гостя
```

Повний опис репозиторію (клієнт, Docker, сценарії): [кореневий README](../README.md).
