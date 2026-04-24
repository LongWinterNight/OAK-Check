# Screens

Композиции экранов и layout-спеки. Код — под [app/(app)/](../../app/(app)/).

## AppShell

Файл: [app/(app)/layout.tsx](../../app/(app)/layout.tsx) + [Sidebar](../../components/layout/Sidebar/) + [TopBar](../../components/layout/TopBar/) + [BottomNav](../../components/layout/BottomNav/).

### Desktop (≥ 1024px)

```
┌──────────────────────────────────────────────┐
│ Sidebar (236px fixed) │ Main content (flex:1) │
│                       │ ┌──────────────────┐  │
│  Logo + OAK·Check     │ │ TopBar (54px)    │  │
│  Project switcher     │ │ breadcrumbs      │  │
│  Navigation items     │ │ search + actions │  │
│  User row (bottom)    │ └──────────────────┘  │
│                       │ <view content>        │
└──────────────────────────────────────────────┘
```

**Sidebar (236px):**
- `background: var(--surface)`, `border-right: 1px solid var(--border)`
- Logo блок: 58px высота, border-bottom, иконка Oak 30×30 + текст `OAK·Check` (Inter Tight 600 13.5px)
- Project switcher: кнопка с цветным 22×22 превью проекта, chevron-down, `background: var(--surface-2)`
- Nav item: 34px высоты, padding `0 10px`, `border-radius: 8px`. Active: `background: var(--surface-3)`, `border: 1px solid var(--border)`. Иконка 16px + label + optional badge
- User row внизу: avatar 26px + имя + status dot (зелёная `var(--done)` если online)

**TopBar (54px):**
- `background: var(--surface)`, `border-bottom: 1px solid var(--border)`
- Breadcrumbs: Inter Tight 13px, разделитель `ChevronRight` 12px
- Search input: 320px ширина, icon left, height 28px
- Actions: bell (ghost) + «Новый шот» (secondary sm)

### Tablet (768–1023px)

Sidebar сжимается в icon-only режим или скрывается с toggle-кнопкой (зависит от экрана). TopBar остаётся.

### Mobile (≤ 767px)

- **Sidebar → скрыт**, заменяется на [BottomNav](../../components/layout/BottomNav/)
- TopBar компактный, только логотип + avatar
- **BottomNav:** 5 пунктов (Дашборд / Задачи / Upload-pill / Ревью / Профиль). Центральная pill-кнопка акцентного цвета запускает [UploadSheet](../../components/mobile/UploadSheet/)

## Dashboard

Файл: [app/(app)/dashboard/page.tsx](../../app/(app)/dashboard/page.tsx)

Padding: 28px desktop, 16px tablet, 12px mobile.

```
┌─────────────────────────────────────────────┐
│ Stats row — 4 карточки (grid repeat(4,1fr)) │
├─────────────────────────────────────────────┤
│ Projects table (основное)                   │
├─────────────────────────────────────────────┤
│ My Day | Activity (grid 2 cols)             │
└─────────────────────────────────────────────┘
```

- **StatsRow** ([components/dashboard/StatsRow](../../components/dashboard/StatsRow.module.css)): каждая карточка — label mono 10.5px uppercase + value display 30px 600 + note 11.5px muted
- **ProjectsTable**: карточка без padding, строки проектов — thumbnail 44×44 (gradient) + название + прогресс-бар + badge + дата. Hover: `var(--surface-2)`
- **MyDay** ([components/dashboard/MyDay](../../components/dashboard/MyDay.module.css)): список задач на сегодня — Check3 + title + время mono справа
- **Activity**: grid 2 cols, строки — avatar + текст + время
- **DeadlineAlert** (PM/LEAD/ADMIN): виджет с приближающимися дедлайнами (Plan 10.6)
- **MyShots** (ARTIST/QA): шоты назначенные на пользователя (Plan 10.5)

Mobile/tablet — виджеты в 1 колонку, StatsRow 2×2.

## Checklist view ⭐ (главный экран)

Файл: [app/(app)/projects/[projectId]/[shotId]/checklist/](../../app/(app)/projects/[projectId]/[shotId]/checklist/)

Компоненты: [ShotHeader](../../components/checklist/ShotHeader/), [ChaptersPanel](../../components/checklist/ChaptersPanel/), [ItemsList](../../components/checklist/ItemsList/), [RightPanel/RenderPreview](../../components/checklist/RightPanel/RenderPreview.module.css), [RightPanel/CommentsPanel](../../components/checklist/RightPanel/CommentsPanel.module.css).

### Desktop layout (3 колонки после ShotHeader)

```
┌─────────────────────────────────────────────────────────────────┐
│ Shot Header (~120px)                                            │
│ thumbnail 96×64 | метаданные | OakRing 64 + кнопки              │
├──────────────────┬──────────────────────────┬───────────────────┤
│ Chapters (260px) │ Items list (flex:1)      │ RightPanel 340px  │
│ OakRing 32 per   │ Segmented filter         │ RenderPreview     │
│ chapter          │ rows с Check3            │ CommentsPanel     │
│                  │ (3-state)                │                   │
└──────────────────┴──────────────────────────┴───────────────────┘
```

**ShotHeader:**
- Thumbnail 96×64 с border-radius 8, overlay gradient, mono версия
- Метаданные: `iconize + text` строки (Inter Tight 12 `var(--fg-muted)`)
- OakRing size 64
- Кнопки: «Загрузить рендер» (secondary sm) + «На ревью» (primary sm)

**Chapters panel (260px):**
- Border-right, overflow-auto
- Глава: OakRing 32 слева + title 12.5px 500 + subtitle mono 10.5px
- Active: `background: var(--surface-3)`, `border: 1px solid var(--border)`
- Footer: ghost button «Этап или шаблон»

**Items list (flex 1):**
- `background: var(--bg)` (темнее панелей)
- Toolbar: название главы + desc mono + Segmented (Все/Открытые/Мои/Блокеры) + Filter ghost
- Row: padding 12px 14px, border-radius 8
  - Check3 16px
  - title 13px (done → line-through + `var(--fg-muted)`)
  - optional note mono 11 с иконкой
  - optional refs: мини-тумбы 34×22
  - right: badge статуса + avatar 22

**RightPanel — RenderPreview:**
- Image 16:10, border-radius 8
- Comment pins: абсолютные белые кружки с номером, border 2 `var(--accent)`, boxShadow
- Версии: pill-кнопки mono, активная с `var(--accent)` bg
- Watermark mono 9.5px

**RightPanel — CommentsPanel:**
- Scroll-area, комментарий: avatar 26 + имя 12 + время mono + optional pin badge
- Reply: marginLeft 24
- Composer: `var(--surface-2)`, avatar + input + image/link + Send

### Tablet (768–1023)

- Chapters можно сворачивать в узкий rail (иконки-only)
- RightPanel либо остаётся (если умещается), либо переключается с ItemsList через табы

### Mobile (план по [../plan-12-responsive/05-product-designer.md](../plan-12-responsive/05-product-designer.md))

Drill-down паттерн (рекомендовано) — глава → пункты → панель через хлебные крошки. URL state `?view=items&chapterId=...`.

## Kanban

Файл: [app/(app)/kanban/](../../app/(app)/kanban/), [components/kanban/KanbanBoard](../../components/kanban/KanbanBoard.module.css).

**Desktop:** 4 колонки flex:
- **Бэклог** (neutral) / **В работе** (info) / **На ревью** (wip) / **Сдано** (done)
- Каждая колонка: Card, badge-заголовок с dot + count + Plus ghost
- Карточка шота: `var(--surface-2)`, border, border-radius 8, padding 12
  - project label mono + title + optional ProgressBar h:4 + badge + date + avatar

**Mobile (план):** horizontal scroll-snap между колонками, 1 колонка на экран. Touch DnD через `@dnd-kit` PointerSensor.

## Library

Файл: [app/(app)/library/](../../app/(app)/library/), [components/library/](../../components/library/).

Grid `repeat(3, 1fr)` (desktop) / 2 (tablet) / 1 (mobile).

Карточка шаблона: icon Oak (38×38, `var(--oak)` tint bg) + title 14px 600 + count + теги-бейджи.

## Activity

Файл: [app/(app)/activity/](../../app/(app)/activity/).

Бесконечная лента ([ActivityFeedInfinite](../../components/activity/ActivityFeedInfinite.module.css)) — строки с avatar + типом события + цитируемым текстом + время mono.

## Projects

Файл: [app/(app)/projects/](../../app/(app)/projects/), [ProjectsGrid](../../components/projects/ProjectsGrid.module.css).

Grid карточек проектов: cover (gradient или image) + название + статус + progress + due date + avatar stack участников.

## Review

Файл: [app/(app)/review/](../../app/(app)/review/).

Очередь шотов со статусом `REVIEW` — карточки, drill-down в checklist/comments.

## Settings

Файл: [app/(app)/settings/](../../app/(app)/settings/).

Табы: Profile, Team, Appearance, System, Notifications. Каждая — `tab.module.css` общий стиль секций.

## Admin

Файл: [app/(app)/admin/](../../app/(app)/admin/).

ADMIN-only. Статистика, список юзеров, storage, CSV-экспорт (Plan 10.8).

## Auth

Файлы: [app/(auth)/login/](../../app/(auth)/login/), [app/(auth)/invite/[token]/](../../app/(auth)/invite/[token]/).

Отдельный layout без Sidebar. Центрированная форма на `var(--bg)`.

## Модель данных (shortcut)

```
Project → Shot → Chapter → CheckItem
                ↓          ↓
                Comment (с pinX/pinY)
                RenderVersion
```

Полная спека моделей — [prisma/schema.prisma](../../prisma/schema.prisma). Взаимосвязи и computed fields — в исходном handoff [README.md](../../../design_handoff_oak_check/README.md).
