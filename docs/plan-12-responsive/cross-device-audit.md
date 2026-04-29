# Cross-device audit — план полной ревизии адаптива

Рабочий документ-чек-лист. Цель: **на любом viewport от 320px до 1920px ни один элемент не имеет horizontal scroll'а, не обрезан и не оставляет лишних пустых пятен**. Идём по ролям сверху вниз: каждая отвечает за свой слой, задачи привязаны к файлам.

---

## Definition of Done (DoD)

Адаптив считается завершённым, когда:

- [ ] Все ключевые URL проходят `no-horizontal-scroll` Playwright-тест на 320 / 375 / 768 / 1024 / 1440
- [ ] Manual QA прошёл device matrix (iPhone SE 2 → iPhone 15 → Samsung A5x → iPad)
- [ ] Touch-targets ≥ 44×44 px на мобиле везде (audit-тест в Playwright)
- [ ] Нет грид'ов с жёсткими `1fr 1fr` или `repeat(N, 1fr)` без media-query
- [ ] Все таблицы либо card-layout на мобиле (`data-label`), либо горизонтальный scroll-snap (Kanban)
- [ ] Все модалки full-screen на мобиле
- [ ] Все формы стек на мобиле, font-size inputs ≥ 16px
- [ ] Lighthouse Mobile Score ≥ 85 на dashboard / projects / checklist / kanban

---

## Брейкпоинты (фиксированы)

| Уровень | Ширина | Когда применяется |
|---|---|---|
| **xs** | 320–374px | iPhone SE, старые Android. Самый узкий — все элементы должны быть стопкой |
| **sm** | 375–767px | Большинство современных смартфонов. Основной мобильный таргет |
| **md** | 768–1023px | iPad, планшеты. Можно 2 колонки, но не 4+ |
| **lg+** | 1024+px | Десктоп. Полный layout |

В коде используем CSS-литералы:
```css
@media (max-width: 374px)  { /* xs only */ }
@media (max-width: 767px)  { /* xs + sm = mobile */ }
@media (min-width: 768px) and (max-width: 1023px) { /* tablet */ }
```

---

## 00 — CTO

Стратегия и приоритеты.

- [ ] Утвердить, что Kanban на мобиле = **1 колонка с табами/свайпом** (не 4 в скролле)
- [ ] Утвердить минимальный таргет — **iPhone SE 2 (375×667)**, не идём ниже
- [ ] Решить: Lightbox с zoom на мобиле — оставляем pinch-zoom браузера, или встроенный zoom (сейчас встроенный)

---

## 01 — Product Manager

Приоритеты по CRM-ролям. Что важно адаптировать в первую очередь.

| Роль | Сценарий на мобиле | Приоритет |
|---|---|---|
| **ARTIST** | Открыть свой шот → посмотреть чек-лист → отметить пункт → загрузить рендер с камеры | **P0** |
| **LEAD** | Просмотреть kanban команды, перетащить задачу, поставить «Стоп» | **P1** |
| **QA** | Открыть рендер, поставить пины с замечаниями | **P1** |
| **PM** | Дашборд + дедлайны + создать проект | **P2** |
| **POST** | Загрузить версию рендера | **P2** |
| **ADMIN** | Команда (инвайты), смена ролей | **P3** (десктоп-сценарий) |

- [ ] Утвердить эти приоритеты
- [ ] После завершения — собрать обратную связь у одного представителя каждой роли

---

## 02 — Project Manager / Scrum Master

Вехи + DoD на этап.

| Веха | Зависимости | Закрывает |
|---|---|---|
| **A. Settings табы** | — | ProjectsTab, AppearanceTab, TeamTab, SystemTab, ProfileTab |
| **B. Grid-контейнеры** | — | ProjectsGrid, StatsRow, MyDay, MyShots, Library, dashboard widgets |
| **C. Kanban** | A | Mobile-friendly drag, swipe between columns |
| **D. Auth + auth-модалки** | — | Login, Invite, NewProject/Edit/Shot/Upload модалки (уже full-screen) |
| **E. QA + тесты** | A+B+C | Playwright `no-horizontal-scroll` + manual matrix |

DoD на каждую веху: пройдено визуально на 320 / 375 / 768, нет horizontal scroll, touch-targets OK.

- [x] Веха A — Settings табы (ProjectsTab `7ecf41f`, AppearanceTab `7ecf41f`, TeamTab/SystemTab/ProfileTab уже OK)
- [x] Веха B — Grid-контейнеры (`6ce7504`)
- [x] Веха C — Kanban scroll-snap (`52f2d59` Plan 12.2) + checklistLink hover-fix (`6ce7504`). Свайп-табы статусов — отложено как P2.
- [x] Веха D — Auth + модалки (Modal full-screen на мобиле, LoginForm safe-area)
- [x] Веха E — **Playwright responsive suite** работает (`pnpm test:e2e`):
  - 4 viewport projects (mobile-xs 320, mobile iPhone 13, tablet iPad, desktop 1440)
  - `no-horizontal-scroll.spec.ts` — 9 URL × 4 viewport, **все проходят**
  - `touch-targets.spec.ts` — мобильные viewport'ы, выявлены и частично починены нарушения (TopBar avatar, Button-sm, ProjectsGrid filter, Library catBtn — все увеличены до 44 на мобиле). Остаются точечные иконки-кнопки 24-26px на /library/projects — пометить data-touch-ok после ручной проверки или расширить hit-area.
  - `smoke.spec.ts` — все ключевые URL без console errors

---

## 03 — Engineering Manager

Стандарты для всего этого аудита (дополнение к [coding-standards.md](../ai-rules/coding-standards.md)).

**Запрещено в новом коде:**
- Жёсткие `grid-template-columns: 1fr 1fr` или `repeat(N, 1fr)` — только `repeat(auto-fit, minmax(min(N, 100%), 1fr))`
- `width: 320px` (или другие фиксированные пиксели) на контейнерах — только `max-width` + `width: 100%`
- `overflow-x: scroll` без подтверждения дизайнером — на мобиле должен быть `wrap`
- `100vh` — только `100dvh`/`100svh`
- `:hover` без `@media (hover: hover)` обёртки

**Обязательно:**
- Любая таблица из `<table>` с TS — атрибуты `data-label="..."` на каждой `<td>` для card-layout
- Любая модалка через `<Modal>` — уже full-screen на мобиле, не делаем свои оверлеи
- Каждая ревизия проверяется в DevTools на 320 / 375 / 768 / 1440

---

## 04 — Software / Cloud Architect

Архитектурные приёмы (закрепляем в `globals.css` и доках).

- [x] Breakpoint-токены `--bp-*` в [globals.css](../../app/globals.css)
- [x] Правила `dvh/svh`, `hover: hover`, safe-area задокументированы
- [x] Универсальный класс `.responsiveGrid` в [globals.css](../../app/globals.css) с переопределяемым `--col-min`
- [x] Helper-класс `.responsiveCluster` (wrap-группа) и `.responsiveStack` (стек на мобиле) в `globals.css`
- [ ] (опционально) React-примитивы Stack/Cluster/Grid — пока только CSS-классы на новом коде

---

## 05 — Product Designer

UX-ревизия по компонентам с конкретикой.

### Settings табы

- [x] **AppearanceTab** — radius/theme buttons → graceful grid
- [x] **ProjectsTab** — `data-label` на td, filterRow wrap
- [ ] **TeamTab** — проверить что email длинные (`@gmail.com`) не ломают карточку на 320
- [ ] **SystemTab** — путь `D:\AI\Oak3CRM\uploads` уже brake-word, проверить на 320
- [ ] **ProfileTab** — на мобиле заметить, что input + кнопка «Сохранить» сейчас рядом → стек
- [ ] **TasksTab/Notifications** (если будут) — заранее заложить card-layout

### Listing экраны

- [ ] **ProjectsGrid** — карточки `min(280px, 100%)`. На xs (320) — 1 колонка
- [ ] **MyShots** на dashboard — card-layout на мобиле или таблица с `data-label`
- [ ] **MyDay** — пункты-карточки (уже есть, проверить отступы)
- [ ] **Library** — карточки шаблонов 1 колонка на мобиле, 2 на md, 3 на lg
- [ ] **Activity feed** — уже стек, проверить avatar + spacing

### Главные экраны

- [ ] **Kanban** — на мобиле 1 колонка + табы/свайп между статусами. Сейчас drag через PointerSensor работает, но 4 узких колонки нечитаемы
- [ ] **Checklist** drill-down — уже работает, ревизия отступов
- [ ] **Render lightbox** — top toolbar (Пин / зум / закрыть) на узком должен быть компактнее или wrap

### Формы

- [ ] **NewProjectModal**, **EditProjectModal**, **NewShotModal**, **UploadRenderModal** — все через `<Modal>` → full-screen на мобиле (готово). Проверить footer-кнопки.
- [ ] **LoginForm** + **InviteForm** — мобильные тач-таргеты, font-size 16
- [ ] **InlineForm в CommentsPanel** — sticky bottom (готово)

### Утвердить **состояние «xs»** для каждого экрана

- [ ] Сделать скриншоты в DevTools 320×568 для всех ключевых URL — найти все «утечки» layout

---

## 06 — Frontend Developer

Главный исполнительский список. Каждый пункт = 1 коммит.

### P0 — критичные (видимые баги)
- [x] ProjectsTab `data-label` + filterRow wrap (`7ecf41f`)
- [x] AppearanceTab graceful grid (`7ecf41f`)
- [x] **ProjectsGrid карточки** — `minmax(min(280, 100%), 1fr)`
- [x] **StatsRow** на dashboard — `minmax(min(140, 100%), 1fr)` auto-fit
- [x] **MyShots** — на мобиле скрыт progress-bar, остаётся pct + due
- [x] **Library cards** — `minmax(min(280, 100%), 1fr)`
- [x] **Admin grid** — `minmax(min(220, 100%), 1fr)`
- [x] **Kanban checklistLink** — на тач-экранах opacity 1 (раньше hover-only)

### P1 — системные
- [ ] **KanbanBoard** — 1 колонка + табы статусов на мобиле
- [ ] **MyShots** — таблица или карточки на dashboard
- [ ] **DeadlineAlert** — стопка, не строка
- [ ] **ProjectDetailClient таблица** — уже есть card-layout, проверить
- [ ] **ReviewClient** — карточки (уже сделано в плане 12.1)

### P2 — полировка
- [ ] **Tooltips** — на мобиле клик-показ вместо hover
- [ ] **Toast** — top-center на мобиле, не перекрывает BottomNav
- [ ] **DatePicker** — full-width popover снизу на мобиле (уже работает через portal)
- [ ] Всеобщий пасс по `:hover` → обёртка `@media (hover: hover)` где не сделано

---

## 07 — Full-stack Developer

Стыковка фронт + API. На мобиле нет специфичных API-задач, только проверить:

- [ ] URL-state для drill-down checklist (`?view=items&chapterId=...`) — для browser back-кнопки
- [ ] SSE reconnect on `visibilitychange: visible` — для мобильных вкладок в фоне

---

## 08 — Mobile Developer

PWA + iOS-специфика.

- [ ] **`public/manifest.webmanifest`** — name, icons, theme_color, display: standalone
- [ ] **Иконки** 192/512 + maskable + apple-touch-icon 180
- [ ] **viewport meta** в `app/layout.tsx`: `viewport-fit=cover`, `maximumScale: 5`
- [ ] **iOS standalone** — `apple-mobile-web-app-capable=yes`, status bar style
- [ ] Все модалки/sheets — `padding-bottom: max(N, env(safe-area-inset-bottom))`
- [ ] Landscape-проверка (`max-height: 500px` media query если ломается)
- [ ] Тач-кнопки — `touch-action: manipulation` (убрать 300ms delay) — глобально через base CSS

---

## 09 — Backend Developer

Активных задач нет. Триггер: если SRE найдёт slow JSON на мобильных сценариях → thin payloads.

---

## 10 — SRE

Метрики для отслеживания регрессии.

- [ ] Lighthouse CI на 3 URL × 4 viewport в GitHub Actions (PR-blocker если perf < 80)
- [ ] Web Vitals (LCP / INP / CLS) — отправка в логи (минимум) или Web Vitals API endpoint
- [ ] Baseline-замер ДО завершения адаптива на каждом viewport, ПОСЛЕ — сравнение

---

## 11 — DBA

Активных задач нет.

---

## 12 — QA Automation

Регрессионные тесты — самое важное чтобы адаптив не уплывал назад.

- [ ] `playwright.config.ts` — 4 viewport projects (mobile-xs 320, mobile 390, tablet 810, desktop 1440)
- [ ] **`e2e/responsive/no-horizontal-scroll.spec.ts`** — для каждого URL × viewport проверить `scrollWidth <= clientWidth`
- [ ] **`e2e/responsive/touch-targets.spec.ts`** — для всех `<button>`/`<a>` на mobile-viewport проверить `getBoundingClientRect >= 44x44`
- [ ] **`e2e/responsive/visual.spec.ts`** — `toHaveScreenshot` snapshots для ключевых экранов × viewport, baseline в репо
- [ ] CI integration — fail-on-regression

---

## 13 — Manual QA

После завершения автоматики — пройти руками.

Device matrix:

| Устройство | Viewport | Приоритет |
|---|---|---|
| iPhone SE 2 | 375×667 | P0 |
| iPhone 13/14/15 | 390×844 | P0 |
| Samsung A5x | ~412×915 | P0 |
| iPad | 810×1080 | P1 |

Для каждого устройства — пройти полный сценарий ARTIST + LEAD + QA. Чек-лист в [13-manual-qa.md](./13-manual-qa.md).

- [ ] Доступ к устройствам / BrowserStack
- [ ] Пройти ARTIST flow на iPhone SE
- [ ] Пройти LEAD flow на iPad
- [ ] Скриншоты дефектов в этот файл

---

## 14 — DevSecOps

После добавления PWA-манифеста (роль 08) — обновить CSP:
- [ ] `manifest-src 'self'` в Content-Security-Policy
- [ ] `img-src` покрывает `/icons/*`
- [ ] HSTS на prod

---

## 15 — Data Engineer

Активных задач нет.

---

## Прогресс-трекер (краткий)

```
[A] Settings табы:        [▓▓▓░░░] 50% (ProjectsTab, AppearanceTab — есть; ProfileTab, MyShots ещё)
[B] Grid-контейнеры:      [▓░░░░░] 16% (часть в плане 12, нужен пасс по auto-fit min)
[C] Kanban mobile:        [░░░░░░] 0%
[D] Auth + модалки:       [▓▓▓▓▓░] 90% (Modal full-screen + LoginForm готовы)
[E] QA + тесты:           [░░░░░░] 0%
```

---

## Как пользоваться этим планом

1. Открыть свой раздел роли (06 если разработчик, 12 если QA)
2. Брать верхнюю незакрытую `[ ]` задачу
3. Делать → коммит на русском → отметить `[x]` в этом файле
4. Push в `origin/main`

Связанные документы:
- [04-software-architect.md](./04-software-architect.md) — архитектурные правила
- [05-product-designer.md](./05-product-designer.md) — UX спецификации
- [06-frontend-developer.md](./06-frontend-developer.md) — основной список задач
- [12-qa-automation.md](./12-qa-automation.md) — Playwright тесты
- [13-manual-qa.md](./13-manual-qa.md) — device matrix
