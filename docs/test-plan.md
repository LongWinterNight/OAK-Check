# Test plan — стратегия тестирования OAK·Check

Цель — предотвратить регрессии в трёх ключевых слоях:
1. **Бизнес-правила** (RBAC, валидация, прогресс) — самые ценные тесты, без UI
2. **API-контракты** — статусы, форматы, права, race conditions
3. **Пользовательские флоу** — ARTIST/LEAD/QA сценарии в реальном браузере

Не покрываем (осознанно):
- Стиль и пиксельный layout — для этого Playwright visual regression в Plan 12
- Внешние сервисы (Resend email, Google Drive sync) — мокаем
- Стороннее (Prisma engine, NextAuth core) — доверяем библиотекам

---

## Уровни тестирования

| Уровень | Инструмент | Где живёт | Сколько ожидается |
|---|---|---|---|
| **Unit** | vitest | `__tests__/**/*.test.ts` | ~150 тестов, < 5 секунд |
| **Component** | vitest + @testing-library/react | `__tests__/components/**` | ~30 тестов |
| **API integration** | vitest + supertest-like | `__tests__/api/**` | ~40 тестов |
| **E2E** | playwright | `e2e/**/*.spec.ts` | ~25 сценариев (`514c025` базовая часть) |

---

## Приоритеты (порядок реализации)

### P0 — Бизнес-логика и RBAC ✅ ЗАКРЫТ

Критично — ошибка здесь = поломанные права или неверный прогресс.

- [x] **`lib/utils.ts`** — 16 тестов (computeProgress, computeChapterStats, cn, formatFileSize, truncate, dbStateToCheck3/check3ToDbState)
- [x] **`lib/roles.ts`** — **81 тест**: матрица 12 операций × 6 ролей + 9 структурных проверок. RBAC-спецификация формализована и защищена от регрессий
- [x] **`lib/zod-schemas.ts`** — 49 тестов: все Create/Update Project/Shot/Item/Comment/Render/Invitation/Chapter/Status/Assign/UserRole/Me схемы. Refinement pinX+pinY вместе, BLOCKED не для шотов, dueDate не требует ISO
- [x] **`lib/api-error.ts`** — 15 тестов: 10 кодов → правильные HTTP-статусы, JSON shape, Content-Type
- [x] **`lib/format.ts`** — 8 тестов: байты/КБ/МБ/ГБ/ТБ + null/0/edge cases
- [x] **`lib/uid.ts`** — 5 тестов: уникальность, fallback без crypto.randomUUID

**Итого P0: 174 теста, ~700мс runtime.**

### P1 — Инфраструктурные библиотеки (~0.5 дня)

Поведенческие модули — нужны mocks или fake timers.

- [x] **`lib/rate-limit.ts`** — 7 тестов (fake timers, окно/сброс/изоляция/реальный 20/час)
- [x] **`lib/sse/emitter.ts`** — 4 теста (фильтрация projectId, unsubscribe, dead-controller cleanup)
- [x] **`lib/activity.ts`** — 4 теста (правильные поля, не падает на ошибке Prisma)
- [x] **`lib/auth-guard.ts`** — 11 тестов (requireAuth/requireRole/requireSelfOrAdmin × все ветки)
- [ ] **`lib/storage.ts`** — `getStorageStatus` отложено (низкий риск регрессии)

**Итого P1: 26 тестов. Общий счёт: 200 тестов, ~840мс.**

### P2 — UI-компоненты с логикой ◐ Закрыто 3 из 7

Тесты с `@testing-library/react`, environment `jsdom`. Setup в
`__tests__/setup.ts` подключает `@testing-library/jest-dom/vitest`.
Per-файл маркер: `// @vitest-environment jsdom`.

- [x] **`components/ui/Check3`** — 10 тестов: aria-checked соответствие state, клик циклит todo→wip→done→todo, Enter/Space, disabled, кастомный size
- [x] **`components/ui/Button`** — 10 тестов: variants/sizes (smoke), loading-spinner, disabled, icon/iconRight, fullWidth, type pass-through
- [x] **`components/ui/Avatar`** — 12 тестов: initials, заглавные, src priority, online dot, стабильный hash имени → цвет, src=null fallback
- [x] **`components/ui/Badge`** — 10 тестов: 7 kinds × class match, 2 sizes, dot on/off, icon prop, className пропускается
- [x] **`components/ui/OakRing`** — 11 тестов: aria-label, округление текста, dashoffset = circumference при 0/0 при 100, цвет --done/--accent, clamp, segments → правильное число circle, custom size
- [x] **`components/ui/ProgressBar`** — 7 тестов: aria role + valuenow, width fill, clamp <0 и >100, custom height/color, value=0
- [ ] **`components/ui/DatePicker`** — отложен (использует portal → нужна более сложная настройка)

**Итого P2: 63 теста (UI). Общий счёт: 263 теста, 3.57 сек.**

### P3 — Сложные компоненты с side-effects (~1 день)

- [ ] **`components/checklist/ItemsList/ChecklistRow`** — 3-state клик, double-click → edit, кнопки visibility по `canManage`, flag-форма требует причину
- [ ] **`components/checklist/RightPanel/CommentsPanel`** — submit → onSubmit, reply form появляется, edit → onEdit, double-submit заблокирован 600мс
- [ ] **`components/projects/CoverPicker`** — выбор градиента, drag image, размер validation
- [ ] **`components/kanban/KanbanBoard`** — drag → status change callback (с моком dnd-kit)
- [ ] **`components/checklist/RightPanel/RenderPreview`** — pin click → onPinSet, version switch
- [ ] **`components/checklist/RightPanel/LightboxView`** — wheel zoom math, scale clamp, reset

### P4 — Store и хуки (~0.3 дня)

- [ ] **`store/useThemeStore`** — `toggle` инвертирует, `setAccent` пишет в DOM `data-accent`, `setRadius` пишет CSS-переменную
- [ ] **`hooks/useSSE`** — устанавливает EventSource с правильным URL, reconnect with backoff, cleanup на unmount

### P5 — API integration (~1.5 дня)

Самый сложный уровень — нужна тестовая БД (тестовая schema или Prisma-mock).

- [ ] **POST `/api/projects`** — создаёт с правильным владельцем, отклоняет ARTIST, dueDate конвертируется
- [ ] **PATCH `/api/projects/[id]`** — PM/ADMIN OK, LEAD получает 403, валидация
- [ ] **POST `/api/shots/[id]/comments`** — обычный коммент, пин (только разрешённые роли), reply, validation
- [ ] **PATCH `/api/shots/[id]/comments/[commentId]`** — автор может, чужой 403, ADMIN не может править чужой
- [ ] **DELETE `/api/shots/[id]/comments/[commentId]`** — автор + ADMIN могут, idempotent (P2025 → 204)
- [ ] **PATCH `/api/shots/[id]/checklist/[itemId]`** — state/note все могут, title/ownerId только LEAD/ADMIN, BLOCKED требует note
- [ ] **POST `/api/auth/register`** — invite-токен валиден, single-use, expires
- [ ] **GET `/api/users`** — пагинация, search
- [ ] **DELETE `/api/users/[id]`** — самоудаление 403, очистка зависимостей
- [ ] **POST/DELETE `/api/invitations`** — только ADMIN, audit log

---

## Setup-нюансы

### vitest config

`vitest.config.ts` уже есть. Нужно дополнить:
- Для UI-тестов — `environment: 'jsdom'` (можно через `// @vitest-environment jsdom` в начале файла)
- `setupFiles` — `__tests__/setup.ts` с `@testing-library/jest-dom/vitest`

### Mocking Prisma в API/library тестах

Два подхода:
1. **Реальная тестовая БД** (postgres):
   - Отдельная `oak_check_test` БД
   - `vitest globalSetup` поднимает миграции, чистит после каждого теста
   - Плюсы: проверяет реальные FK/constraints
   - Минусы: медленно, требует postgresql на CI

2. **Mock через vi.mock('@/lib/prisma')**:
   - Быстрые unit-тесты
   - Минусы: не ловит SQL-баги
   
**Рекомендация:** P0/P1/P2/P3 — без БД (mocks), P5 — с реальной тестовой БД. Это hybrid-стратегия — быстрые тесты для логики, медленные для контрактов.

### Покрытие (coverage)

Подключить `@vitest/coverage-v8`:
- **Цель:** ≥ 80% по `lib/**`, ≥ 60% по `components/**`
- Запуск: `pnpm test --coverage`
- В CI — fail если падает ниже порога

---

## Структура каталогов тестов

```
oak-check/
├── __tests__/
│   ├── setup.ts                  ← @testing-library/jest-dom setup
│   ├── lib/
│   │   ├── utils.test.ts         ← (есть)
│   │   ├── roles.test.ts         ← P0
│   │   ├── zod-schemas.test.ts   ← P0
│   │   ├── api-error.test.ts     ← P0
│   │   ├── format.test.ts        ← P0
│   │   ├── uid.test.ts           ← P0
│   │   ├── rate-limit.test.ts    ← P1
│   │   ├── sse-emitter.test.ts   ← P1
│   │   ├── activity.test.ts      ← P1
│   │   ├── auth-guard.test.ts    ← P1
│   │   └── storage.test.ts       ← P1
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Check3.test.tsx
│   │   │   ├── Button.test.tsx
│   │   │   ├── Badge.test.tsx
│   │   │   └── ...
│   │   ├── checklist/
│   │   │   ├── ChecklistRow.test.tsx
│   │   │   └── CommentsPanel.test.tsx
│   │   └── projects/
│   │       └── CoverPicker.test.tsx
│   ├── store/
│   │   └── useThemeStore.test.ts
│   ├── hooks/
│   │   └── useSSE.test.ts
│   └── api/                      ← P5
│       ├── projects.test.ts
│       ├── shots.test.ts
│       └── ...
└── e2e/                          ← (есть, отдельно)
```

---

## Workflow

1. Открыть этот файл — посмотреть верхний `[ ]` блок по приоритету
2. Создать соответствующий тестовый файл
3. `pnpm test [имя-файла]` локально
4. Фикс багов которые найдут тесты — отдельным коммитом «fix: ...»
5. Когда блок проходит — отметить `[x]` и закоммитить
6. Push в `main`

После закрытия P0 + P1 — есть надёжная защита бизнес-логики.
P2-P3 — защита UI от регрессий.
P5 — защита API-контрактов.

---

## Что НЕ покрываем тестами

- **Видеовоспроизведение** в lightbox — нужен реальный браузер
- **Drag-and-drop с координатами** — это E2E (Playwright)
- **Real-time синхронизация SSE** между клиентами — это E2E
- **Performance** (Web Vitals, bundle size) — это Lighthouse CI
- **Прямые SQL запросы** (если будут) — только через ручной explain
