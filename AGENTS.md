<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Точка входа для AI-агентов

**Прежде чем писать код — открыть [docs/README.md](./docs/README.md).** Там собраны правила работы, дизайн-система и план разработки:

- [docs/ai-rules/nextjs.md](./docs/ai-rules/nextjs.md) — расширенная версия этого файла с конкретными граблями проекта (App Router, Server/Client boundaries, middleware как `proxy.ts`, `params: Promise<...>`)
- [docs/ai-rules/git-workflow.md](./docs/ai-rules/git-workflow.md) — коммит+пуш в `origin/main` после каждого изменения, сообщения **на русском**
- [docs/ai-rules/coding-standards.md](./docs/ai-rules/coding-standards.md) — CSS Modules (без Tailwind), брейкпоинты, RBAC через `can.*`, `apiError`, `logActivity`
- [docs/design-system/](./docs/design-system/) — токены, компоненты, экраны
- [docs/plans/README.md](./docs/plans/README.md) — история закрытых планов 01–11
- [docs/plan-12-responsive/README.md](./docs/plan-12-responsive/README.md) — **активный план** (адаптив mobile/tablet), структура по 16 dev-ролям

## Архитектурные CSS-правила (must-know)

Основной заголовок этих правил — в [app/globals.css](./app/globals.css), полная версия — в [docs/ai-rules/coding-standards.md](./docs/ai-rules/coding-standards.md). Главное:

- **Брейкпоинты:** `≤ 767px` mobile, `768–1023px` tablet, `≥ 1024px` desktop. Литералы пишутся вручную в `@media`, источник правды — переменные `--bp-*` в `globals.css`. Новых брейкпоинтов не вводить.
- **Высоты в полноэкранных элементах** (модалки, sheet, лайтбокс) — только `dvh`/`svh`, никогда `vh`. На iOS Safari `100vh` ≠ visible height, под URL-баром получится скролл.
- **Hover-эффекты** оборачивать в `@media (hover: hover) { ... }` — иначе на тач-экранах состояние `:hover` залипает после тапа до следующего касания.
- **Touch-targets** ≥ 44×44 px на мобиле (WCAG 2.5.5). Иконки-кнопки расширяем через padding/`::before`.
- **Inputs** на мобиле — `font-size: 16px` минимум, иначе iOS зумит viewport при фокусе.
- **Safe-area** (PWA на iPhone с вырезом): `BottomNav` и full-screen sheets — `padding-bottom: max(var(--spacing-3), env(safe-area-inset-bottom))`.
