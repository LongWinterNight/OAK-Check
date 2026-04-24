# Next.js specifics — это не тот Next.js

> **Важно:** эта версия Next.js содержит breaking changes. API, конвенции и структура файлов могут отличаться от того, что в твоей training data. Перед использованием незнакомого API — читать документацию в `node_modules/next/dist/docs/`. Обращать внимание на deprecation notices.

Этот файл собирает специфику, на которую наступали в проекте.

## App Router (не Pages Router)

- Все страницы в `app/`, не `pages/`
- Layout — через `layout.tsx`, не `_app.tsx` / `_document.tsx`
- Route groups в скобках: `(app)/`, `(auth)/` — не участвуют в URL
- Dynamic segments: `[id]`, catch-all `[...slug]`
- Server Components по умолчанию; для клиентских — `'use client'` в начале файла

## Server vs Client components

- **Server Components** не могут использовать `useState`, `useEffect`, browser API (`window`, `document`, `localStorage`)
- Компоненты, которые импортируют Zustand/NextAuth-хуки — обязаны быть `'use client'`
- `useThemeStore` из [store/useThemeStore.ts](../../store/useThemeStore.ts) — client-only

## Metadata / viewport (App Router)

- `metadata` экспортируется из `layout.tsx` или `page.tsx` (не через `<Head>`)
- `viewport` — отдельный экспорт (не поле внутри `metadata` в новых версиях):
  ```ts
  export const viewport = {
    width: 'device-width',
    initialScale: 1,
    viewportFit: 'cover',
  };
  ```

## Middleware

- Файл называется `proxy.ts` (в этом проекте), а не `middleware.ts` — стандартный Next.js паттерн переименован под `proxy.ts`. **Не создавать `middleware.ts` параллельно.**
- Matcher и логика RBAC — в [proxy.ts](../../proxy.ts)

## Route handlers (API)

- Экспорт именованных функций: `GET`, `POST`, `PATCH`, `DELETE`
- Контекст второй аргумент: `{ params: Promise<{ id: string }> }` — параметры нужно `await` в новых версиях:
  ```ts
  export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    ...
  }
  ```

## Кэш и revalidation

- `revalidatePath` / `revalidateTag` — из `next/cache`
- В этом проекте очистка кэша идёт через [app/api/admin/revalidate/route.ts](../../app/api/admin/revalidate/route.ts)

## Image / Fonts

- `next/image` для картинок, но для рендеров внутри чеклиста — обычный `<img>`, т.к. source — динамический user-upload без фиксированных размеров
- Шрифты — Google Fonts через CSS `@import url(...)` в [globals.css](../../app/globals.css), не через `next/font`

## Checks before you write

- [ ] Читал `node_modules/next/dist/docs/` для используемого API? (особенно для `cookies()`, `headers()`, `redirect()`, `notFound()`)
- [ ] Не вводишь `middleware.ts` (у нас `proxy.ts`)
- [ ] Не смешиваешь Server и Client Component импорты
- [ ] `viewport` отдельным экспортом, не внутри `metadata`

## Оригинальный источник

Этот файл расширяет [oak-check/AGENTS.md](../../AGENTS.md). Исходный `AGENTS.md` оставлен, потому что он автоматически подтягивается через `@AGENTS.md` в [CLAUDE.md](../../CLAUDE.md).
