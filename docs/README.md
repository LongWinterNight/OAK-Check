# OAK·Check — Documentation

Единая точка входа для любого, кто работает с проектом: разработчик, новый AI-агент, дизайнер, QA. Здесь лежат **инструкции по работе**, **дизайн-система** и **планы разработки**.

## Навигация

### [ai-rules/](./ai-rules/) — Правила работы с кодовой базой
Инструкции для AI-агентов и людей, работающих с проектом. Next.js специфика, git-процесс, стандарты CSS/React.

- [ai-rules/README.md](./ai-rules/README.md) — с чего начинать
- [ai-rules/nextjs.md](./ai-rules/nextjs.md) — **важно:** это не тот Next.js, который знает LLM
- [ai-rules/git-workflow.md](./ai-rules/git-workflow.md) — коммит + пуш после каждого изменения, на русском
- [ai-rules/coding-standards.md](./ai-rules/coding-standards.md) — стили, React-правила, ревью-чеклист

### [design-system/](./design-system/) — Дизайн-система
Адаптация handoff-спецификации из `design_handoff_oak_check/` под текущий стек (Next.js + CSS Modules + Zustand).

- [design-system/README.md](./design-system/README.md) — обзор + ссылка на исходный handoff
- [design-system/tokens.md](./design-system/tokens.md) — цвета, отступы, радиусы, шрифты, тени
- [design-system/components.md](./design-system/components.md) — Button, Check3, Badge, OakRing, Avatar, etc.
- [design-system/screens.md](./design-system/screens.md) — AppShell, Dashboard, Checklist, Kanban, Library, Mobile

### [plans/](./plans/) — История и план разработки
Сводка всех Plan-01..11 (закрыты) и ссылка на активный [plan-12-responsive/](./plan-12-responsive/).

- [plans/README.md](./plans/README.md) — индекс всех планов со статусами
- [plans/01-auth-security.md](./plans/01-auth-security.md) … [plans/11-performance.md](./plans/11-performance.md)

### [plan-12-responsive/](./plan-12-responsive/) — Активный план (Apr 2026)
Адаптивность mobile/tablet — 16 файлов, по одному на dev-роль.

---

## Стек проекта (коротко)

- **Framework:** Next.js (App Router). См. [ai-rules/nextjs.md](./ai-rules/nextjs.md) — **обязательно прочитать перед кодом**.
- **Стили:** CSS Modules + CSS custom properties (без Tailwind)
- **State:** Zustand (persist для theme)
- **Сервер:** Prisma + PostgreSQL, NextAuth (JWT + Credentials + invite-flow)
- **Real-time:** SSE через `lib/sse/emitter.ts`

## CRM-роли (end-users)

`ARTIST · LEAD · QA · POST · PM · ADMIN` — источник правды: [lib/roles.ts](../lib/roles.ts).

## Quick start для AI-агента

1. Прочитать [ai-rules/README.md](./ai-rules/README.md) — **первым делом**
2. Прочитать [ai-rules/nextjs.md](./ai-rules/nextjs.md) — breaking changes Next.js
3. Посмотреть [plans/README.md](./plans/README.md) — что уже сделано
4. Открыть [plan-12-responsive/README.md](./plan-12-responsive/README.md) — текущий активный план
5. При вопросах по UI — [design-system/](./design-system/)

## Источники инструкций (исторические)

Эта папка агрегирует рассеянные ранее по проекту инструкции:

| Было где | Что | Куда переехало |
|---|---|---|
| [oak-check/CLAUDE.md](../CLAUDE.md) | `@AGENTS.md` (include-файл) | Остался как есть, авто-загружается Claude Code |
| [oak-check/AGENTS.md](../AGENTS.md) | Next.js breaking changes | [ai-rules/nextjs.md](./ai-rules/nextjs.md) (расширено) |
| `memory/feedback_git_commits.md` | Коммит+пуш+русский | [ai-rules/git-workflow.md](./ai-rules/git-workflow.md) |
| `memory/plan_01..11_*.md` | Планы 01–11 | [plans/01-..-11-*.md](./plans/) |
| `design_handoff_oak_check/README.md` | Дизайн-токены и спеки | [design-system/](./design-system/) |

---

## Автор и правообладатель

Проект разработан **Черненко Алексеем Руслановичем** ([chernenko.alex.r@gmail.com](mailto:chernenko.alex.r@gmail.com), GitHub: [@LongWinterNight](https://github.com/LongWinterNight)).

Архитектура, разработка, дизайн-система, документация — всё единым автором с использованием современного AI-ассистированного стека (Claude Code как coding-партнёр).

Лицензия — Proprietary (All Rights Reserved), см. [LICENSE](../LICENSE).
