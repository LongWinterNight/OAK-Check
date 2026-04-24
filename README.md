# OAK·Check

Внутренний CRM студии архитектурной визуализации OAK3D для управления производственными чек-листами по шотам (3ds Max · V-Ray / Corona). Используется 3D-артистами, лидами, QA, пост-продакшеном, PM'ами и админами.

## Стек

- **Next.js 16** (App Router, Turbopack в dev)
- **React 19** + **TypeScript**
- **CSS Modules** + CSS custom properties (без Tailwind)
- **Prisma 7** + **PostgreSQL**
- **NextAuth 5** (Credentials + JWT + invite-flow)
- **Zustand** (client state), **TanStack Query** (server state)
- **SSE** для real-time (свой emitter без Pusher/Redis)

## Быстрый старт

```bash
pnpm install
cp .env.example .env.local  # заполнить DATABASE_URL, NEXTAUTH_SECRET, etc.
pnpm db:migrate
pnpm db:seed
pnpm dev                     # http://localhost:3000
```

## Документация

**Первая точка входа — [docs/README.md](./docs/README.md).**

- **[docs/ai-rules/](./docs/ai-rules/)** — правила работы с кодовой базой (обязательно читать перед первым кодом)
  - [nextjs.md](./docs/ai-rules/nextjs.md) — Next.js breaking changes
  - [git-workflow.md](./docs/ai-rules/git-workflow.md) — коммит+пуш после каждого изменения (русский)
  - [coding-standards.md](./docs/ai-rules/coding-standards.md) — CSS/React/API стандарты
- **[docs/design-system/](./docs/design-system/)** — токены, компоненты, экраны
- **[docs/plans/](./docs/plans/)** — история планов 01–11
- **[docs/plan-12-responsive/](./docs/plan-12-responsive/)** — активный план (адаптив), структурирован по 16 dev-ролям

## CRM-роли (end-users)

`ARTIST · LEAD · QA · POST · PM · ADMIN` — источник правды [lib/roles.ts](./lib/roles.ts).

## Команды

```bash
pnpm dev          # dev-сервер
pnpm build        # production build
pnpm start        # production start
pnpm lint         # eslint
pnpm test         # vitest
pnpm db:migrate   # prisma migrate dev
pnpm db:seed      # seed data
pnpm db:studio    # prisma studio
```

## Repo

- GitHub: [LongWinterNight/OAK-Check](https://github.com/LongWinterNight/OAK-Check)
- Ветка: `main`
