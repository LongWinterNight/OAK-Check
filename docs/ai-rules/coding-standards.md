# Coding standards

Стандарты, собранные из нескольких планов (в частности Plan 06 архитектура, Plan 12 EM-правила).

## CSS

### Источники правды
- Цвета, отступы, радиусы, шрифты — CSS custom properties в [app/globals.css](../../app/globals.css)
- Никогда не хардкодить: `padding: 8px` → `padding: var(--spacing-3)`; `color: #8C5E1E` → `color: var(--accent)` / `var(--oak)`

### Брейкпоинты (фиксированы, не вводить новых)
```css
@media (max-width: 767px) { /* mobile */ }
@media (min-width: 768px) and (max-width: 1023px) { /* tablet */ }
/* desktop — по умолчанию */
```

Источник правды для значений — переменные `--bp-mobile-max`, `--bp-tablet-min`, `--bp-tablet-max`, `--bp-desktop-min` в [app/globals.css](../../app/globals.css) (CSS custom properties не работают внутри `@media` напрямую — литералы дублируются в модулях вручную, при изменении нужно обновить и переменные, и `@media` правила).

### Media queries
- Desktop-first: базовые правила → media queries overrides в конце файла модуля
- Никаких `useWindowSize` / JS-рендеринга по ширине — только CSS. Исключение: заведомо разные компоненты (`BottomNav` vs `Sidebar`), рендерим оба, прячем через `display: none`.

### Viewport units
- Для full-screen layout / модалок — `100dvh` или `100svh`, не `100vh`
- `100dvh` — динамический viewport (учитывает URL-бар на iOS)
- `100svh` — минимальный гарантированный

### Hover states
- Оборачивать в `@media (hover: hover)` чтобы hover не залипал на мобиле после тапа:
  ```css
  .button { color: var(--fg); }
  @media (hover: hover) {
    .button:hover { color: var(--accent); }
  }
  ```

### Safe-area
- `BottomNav` — `padding-bottom: max(var(--spacing-3), env(safe-area-inset-bottom))`
- Full-screen модалки — учитывать `env(safe-area-inset-top)` и `env(safe-area-inset-bottom)`

### `!important`
- **Запрещено** без комментария-причины. Обычно причина — override сторонней библиотеки:
  ```css
  /* override third-party calendar internal focus ring */
  .cell:focus { outline: none !important; }
  ```

### Touch targets
- Интерактивные элементы на мобиле — минимум **44×44 px** (WCAG 2.5.5)
- Для мелких элементов расширять hit area через `::before` с отрицательными отступами

## React

### Компоненты

- Server Components по умолчанию. `'use client'` только когда реально нужен browser API или state.
- Client-only файлы: компоненты с Zustand-хуками, формы с `useState`, анимации с `useEffect`.

### Props
- Typed props. Интерфейсы рядом с компонентом или в `types/`.
- Для колбэков префикс `on*`: `onSubmit`, `onDelete`.

### touch-action
- На всех кликабельных элементах — `touch-action: manipulation` (убирает 300ms delay)

### Keys
- В списках — стабильный id, не индекс массива

### Формы
- Inputs на мобиле — `font-size: 16px` минимум (иначе iOS зумит при фокусе)
- Ввод пароля — `autocomplete="current-password"` / `"new-password"`

## API routes

- Ошибки — через [lib/api-error.ts](../../lib/api-error.ts), `apiError('CODE')`. Не писать `NextResponse.json({ error: 'текст' }, { status: N })`.
- Успех: `GET list` → `{ data, total, page, limit, hasMore }`; `POST` → созданный объект, status 201; `PATCH` → обновлённый объект; `DELETE` → `null`, status 204.
- После мутаций — `logActivity(...)` из [lib/activity.ts](../../lib/activity.ts).
- Валидация входных данных — zod-схемы из [lib/zod-schemas.ts](../../lib/zod-schemas.ts).
- RBAC через `requireAuth()` / `requireRole([...])` из [lib/auth-guard.ts](../../lib/auth-guard.ts). Не хардкодить ролевые массивы — использовать `can.*` из [lib/roles.ts](../../lib/roles.ts).

## Импорты

- Абсолютные через `@/` alias (уже настроен в [tsconfig.json](../../tsconfig.json))
- Не импортировать Prisma напрямую в Server Components страниц если можно через сервис (пока сервисный слой не обязателен — в процессе миграции, см. [../plans/06-architecture.md](../plans/06-architecture.md))

## Ревью-чеклист (перед merge / commit)

- [ ] Изменения проверены в DevTools на 360 / 768 / 1024 / 1440
- [ ] Нет horizontal scroll
- [ ] Touch-targets ≥ 44×44 на мобиле
- [ ] Focus-ring виден и на мобиле (не перекрывается клавиатурой)
- [ ] Нет новых `!important` без комментария-причины
- [ ] Нет `useWindowSize`/аналогов JS-рендеринга по ширине
- [ ] Нет хардкода цветов/отступов мимо CSS-переменных
- [ ] API-роут использует `apiError`, `logActivity`, zod-валидацию, `can.*`
- [ ] Нет регрессий десктопа

## См. также

- [../plan-12-responsive/03-engineering-manager.md](../plan-12-responsive/03-engineering-manager.md) — расширенные правила для Plan 12
- [../plan-12-responsive/04-software-architect.md](../plan-12-responsive/04-software-architect.md) — архитектурные решения (dvh, hover, safe-area)
