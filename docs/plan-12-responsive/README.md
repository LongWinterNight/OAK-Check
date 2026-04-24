# Plan 12 — Адаптивность (Mobile / Tablet)

Рабочая папка для завершения адаптации OAK·Check. Каждый файл = вклад одной dev-роли в общий план. Идём по папке сверху вниз: открываем файл роли → берём верхний невыполненный пункт → делаем → коммитим → отмечаем `[x]`.

---

## Контекст

**Уже сделано** (коммиты `e97cc95`, `52f2d59`, `e394ca8`, `47521fd`, `d8395c4`):
- Базовый layout под 3 брейкпоинта
- `BottomNav` для мобилы, `Sidebar` схлопывается
- Основные страницы (dashboard, projects, library, activity, kanban, admin, settings) имеют media queries
- Мобильный `UploadSheet` в [components/mobile/UploadSheet](../../components/mobile/UploadSheet)
- Фиксы: табличный overflow в settings, тулбар переполнение, акцент oak по умолчанию

**Остаётся** (суть Plan 12 допила):
- Внутренние компоненты без media queries: `ChaptersPanel`, `ItemsList`, `RightPanel`, `CommentsPanel`, `RenderPreview`, `UploadRenderModal`, `MyDay`, `MyShots`, `ActivityFeed`, `DeadlineAlert`, `LibraryClient`, UI-примитивы (`Modal`, `DatePicker`, `Segmented`, `Toast`)
- Страницы без media queries: `tasks`, `review`, `settings/page`, auth-экраны
- PWA-манифест, safe-area, viewport meta, touch-gestures
- Тестирование (device matrix, Playwright viewports, визуальная регрессия)
- Мониторинг Core Web Vitals на мобиле

---

## Брейкпоинты

| | Ширина | Атрибут |
|---|---|---|
| Mobile | ≤ 767px | `(max-width: 767px)` |
| Tablet | 768–1023px | `(min-width: 768px) and (max-width: 1023px)` |
| Desktop | ≥ 1024px | по умолчанию |

Источник правды — уже существующие media queries в `*.module.css`. **Новых брейкпоинтов не вводим**, синхронизируемся с текущими.

---

## CRM-роли (end-users)

`ARTIST · LEAD · QA · POST · PM · ADMIN` — см. [lib/roles.ts](../../lib/roles.ts).

Приоритизация мобильных сценариев — в [01-product-manager.md](./01-product-manager.md).

---

## Dev-роли (план по файлам)

| # | Роль | Файл | Scope в Plan 12 |
|---|---|---|---|
| 00 | CTO | [00-cto-strategy.md](./00-cto-strategy.md) | Цели, KPI, риски |
| 01 | Product Manager | [01-product-manager.md](./01-product-manager.md) | User stories, приоритеты по CRM-ролям |
| 02 | Project Manager / Scrum Master | [02-project-manager.md](./02-project-manager.md) | Вехи, зависимости, DoD |
| 03 | Engineering Manager | [03-engineering-manager.md](./03-engineering-manager.md) | Ревью-правила, coding standards |
| 04 | Software / Cloud Architect | [04-software-architect.md](./04-software-architect.md) | Breakpoint tokens, layout-примитивы |
| 05 | Product Designer (UI/UX) | [05-product-designer.md](./05-product-designer.md) | Spacing, touch targets, компонентные спеки |
| 06 | Frontend Developer | [06-frontend-developer.md](./06-frontend-developer.md) | Основной список задач по CSS/React |
| 07 | Full-stack Developer | [07-fullstack-developer.md](./07-fullstack-developer.md) | Стыковка API и мобильных view |
| 08 | Mobile Developer | [08-mobile-developer.md](./08-mobile-developer.md) | PWA, safe-area, жесты, installability |
| 09 | Backend Developer | [09-backend-developer.md](./09-backend-developer.md) | Тонкие payload'ы для мобилы |
| 10 | SRE | [10-sre.md](./10-sre.md) | Core Web Vitals, RUM |
| 11 | DBA | [11-dba.md](./11-dba.md) | (вне scope — заметки на будущее) |
| 12 | QA Automation | [12-qa-automation.md](./12-qa-automation.md) | Playwright viewports, visual regression |
| 13 | Manual QA | [13-manual-qa.md](./13-manual-qa.md) | Device matrix, чеклисты по ролям |
| 14 | DevSecOps | [14-devsecops.md](./14-devsecops.md) | CSP, сессии на мобиле, headers |
| 15 | Data Engineer | [15-data-engineer.md](./15-data-engineer.md) | (вне scope — заметки на будущее) |

---

## Процесс

1. В начале сессии — открываем README, смотрим «Общий статус» ниже
2. Берём файл роли с самым верхним незакрытым пунктом
3. Реализуем → `git commit` → `git push origin main` (см. [feedback_git_commits](../../../memory/feedback_git_commits.md))
4. Ставим `[x]` в файле роли + обновляем «Общий статус» при необходимости

---

## Общий статус

- [ ] **Architect** — брейкпоинты в CSS-переменные (04)
- [ ] **Designer** — ревизия touch-targets и spacing-токенов (05)
- [ ] **Frontend** — адаптация внутренних панелей чеклиста (06)
- [ ] **Frontend** — адаптация модалок и UI-примитивов (06)
- [ ] **Frontend** — адаптация страниц tasks/review/auth (06)
- [ ] **Mobile** — PWA manifest + safe-area + viewport (08)
- [ ] **QA Automation** — Playwright responsive suite (12)
- [ ] **Manual QA** — прохождение device matrix (13)
- [ ] **SRE** — метрики CWV на мобиле (10)
- [ ] **DevSecOps** — проверка CSP/headers на мобиле (14)
