# AI Rules — как работать с этим проектом

Первая точка входа для любого AI-агента (Claude, Copilot, Cursor), который видит эту кодовую базу. Читать **до** первого кода.

## Порядок

1. **[nextjs.md](./nextjs.md)** — **Критично.** Этот Next.js отличается от того, что в training data. Читать документацию в `node_modules/next/dist/docs/` перед использованием новых API.
2. **[git-workflow.md](./git-workflow.md)** — коммит + пуш после каждого изменения, сообщения **на русском**.
3. **[coding-standards.md](./coding-standards.md)** — стандарты CSS/React, правила ревью.

## Контекст проекта

- **Что:** OAK·Check — внутренний CRM студии OAK3D для управления чек-листами шотов (3D-визуализация). См. [../design-system/README.md](../design-system/README.md).
- **CRM-роли:** ARTIST, LEAD, QA, POST, PM, ADMIN. Источник правды — [lib/roles.ts](../../lib/roles.ts).
- **Фаза:** активно дорабатывается адаптив mobile/tablet — [../plan-12-responsive/](../plan-12-responsive/).
- **Репо:** [LongWinterNight/OAK-Check](https://github.com/LongWinterNight/OAK-Check), ветка `main`.

## Что НЕ делать

- Не добавлять Tailwind — проект на CSS Modules + CSS custom properties.
- Не писать mobile-specific компоненты в отдельных файлах без необходимости — адаптив через CSS media queries.
- Не пушить без коммит-сообщения на русском (см. [git-workflow.md](./git-workflow.md)).
- Не использовать `!important` без комментария-причины.
- Не амендить уже запушенные коммиты — создаём новый коммит.
- Не применять устаревшие паттерны Next.js Pages Router — проект на App Router.

## Где лежит что

```
oak-check/
├── app/                    # Next.js App Router
│   ├── (app)/              # авторизованные страницы + layout с Sidebar/TopBar
│   ├── (auth)/             # login, invite
│   └── api/                # роуты
├── components/
│   ├── ui/                 # примитивы (Button, Input, Card...)
│   ├── layout/             # Sidebar, TopBar, BottomNav
│   ├── checklist/          # главная фича
│   ├── kanban/ dashboard/ library/ activity/ projects/
│   └── mobile/             # mobile-специфичные (UploadSheet)
├── lib/                    # roles, auth, activity, rate-limit, sse, zod-schemas, env
├── prisma/                 # schema + migrations
├── store/                  # Zustand
├── types/                  # типы (next-auth.d.ts)
├── docs/                   # ← вы сейчас здесь
├── proxy.ts                # middleware (rbac + rate limit)
└── CLAUDE.md               # → @AGENTS.md → [nextjs.md](./nextjs.md)
```

## Принципы

- **Источник правды для ролей** — [lib/roles.ts](../../lib/roles.ts). Не хардкодить массивы ролей в роутах — использовать `can.*`.
- **Источник правды для дизайн-токенов** — [app/globals.css](../../app/globals.css). Не хардкодить цвета/отступы.
- **Источник правды для API-ошибок** — [lib/api-error.ts](../../lib/api-error.ts). Не писать `NextResponse.json({ error: 'текст' })` — использовать `apiError('CODE')`.
- **Activity logging** — после каждой мутации вызывать `logActivity()` из [lib/activity.ts](../../lib/activity.ts).
