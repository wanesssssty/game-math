# Math Paws — клієнт (Next.js)

Фронтенд гри-тренажера математики: сторінки режимів, тест, магазин, інвентар, демо-логін.

## Технології

- **Next.js 16** (App Router), **React 19**, **TypeScript**
- **Tailwind CSS v4** — стилізація через utility-класи
- **shadcn/ui** — `Button`, `Card`, `Input`, `Badge`, `Dialog`, `Progress`, `Tabs` тощо (`components/ui/`)

## Запуск

```bash
npm install
cp .env.example .env.local
npm run dev
```

Відкрий **http://localhost:3000**.

## Змінні середовища

Файл **`.env.local`**:

| Змінна | Опис |
|--------|------|
| `NEXT_PUBLIC_API_BASE_URL` | Базовий URL бекенду (за замовчуванням `http://localhost:4001`; з Docker — `http://localhost:4000`) |

## Маршрути

| Шлях | Опис |
|------|------|
| `/` | Головна: hero, вкладки тем, картки режимів |
| `/addition` | Гра на додавання |
| `/subtraction` | Віднімання |
| `/multiplication` | Множення |
| `/division` | Ділення |
| `/test` | Змішаний тест (10 кроків), прогрес, аватар-блок, журнал помилок |
| `/login` | Демо-форма входу |
| `/shop` | Магазин (демо-монети та покупки) |
| `/inventory` | Інвентар предметів |

## Важливі файли

| Шлях | Призначення |
|------|-------------|
| `app/layout.tsx` | Кореневий layout, шрифти, темна тема (`dark`) |
| `app/globals.css` | Tailwind + токени shadcn |
| `components/site-frame.tsx` | Хедер, навігація, футер |
| `components/operation-game.tsx` | Ігри +, −, ×, ÷ (10 питань, збереження прогресу на API) |
| `components/mixed-test.tsx` | Змішаний тест |
| `lib/api/client.ts` | HTTP-клієнт, формат `{ success, data \| error }` |
| `lib/progress-storage.ts` | `POST /api/progress` + fallback у `localStorage` |
| `lib/store-items.ts` | Дані предметів для магазину/інвентарю |

## Скрипти

```bash
npm run dev      # розробка
npm run build    # production build
npm run start    # запуск production
npm run lint     # ESLint
```

Документація всього репозиторію: [кореневий README](../README.md).
