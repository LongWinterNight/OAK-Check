# 04 — Software / Cloud Architect

## Архитектурные решения

### 1. Breakpoints как CSS-переменные

**Проблема:** брейкпоинты `767px` и `1023px` дублируются в ~20 `*.module.css` файлах. Если завтра продуктовое решение подвинуть планку — правим в двадцати местах.

**Решение:** ввести **custom media** через PostCSS или зафиксировать через JS-const для консистентности. Минимально — переменная-документация в [globals.css](../../app/globals.css):

```css
:root {
  /* Breakpoint reference — менять здесь, media queries обновлять вручную */
  --bp-mobile-max: 767px;
  --bp-tablet-min: 768px;
  --bp-tablet-max: 1023px;
  --bp-desktop-min: 1024px;
}
```

CSS custom properties не работают в media queries напрямую — но переменные служат единым источником правды в комментарии, а плагин `postcss-custom-media` (если поставим) превращает их в реальные `@custom-media`.

### 2. Layout-примитивы

Добавить в [components/ui](../../components/ui) или `components/layout/primitives`:

- **`Stack`** — вертикальный flex с gap через `var(--spacing-*)`, опция `responsive={{ mobile: 2, desktop: 4 }}`
- **`Cluster`** — горизонтальный flex с wrap (для toolbars)
- **`Grid`** — `repeat(auto-fit, minmax(X, 1fr))` без media queries

Это уменьшит количество inline-styles и ad-hoc CSS в страницах. Но — **не рефакторим существующее** превентивно, вводим примитивы и используем только в новом/переделываемом коде.

### 3. Viewport units на iOS Safari

Проблема `100vh` ≠ visible height. Правило: **везде использовать `dvh` и `svh` вместо `vh`** для full-screen модалок, sheet-панелей, лайтбокса.

- `100dvh` — dynamic viewport (меняется с показом URL-бара) — для основного layout
- `100svh` — static small (минимальная высота) — для гарантированно-помещающихся элементов

### 4. Safe-area insets

Для PWA на iPhone с вырезом — `env(safe-area-inset-*)`. Правило:
- `BottomNav` — `padding-bottom: max(var(--spacing-3), env(safe-area-inset-bottom))`
- Full-screen модалки — учитывать `inset-top` и `inset-bottom`
- Viewport meta — `viewport-fit=cover` (см. 08)

### 5. Touch-first hover states

Правило: hover-эффекты оборачиваем в `@media (hover: hover)`, чтобы на мобиле hover не «залипал» после тапа:

```css
.button { color: var(--fg); }
@media (hover: hover) {
  .button:hover { color: var(--accent); }
}
```

## Задачи архитектора

- [x] Ввести breakpoint-референсы в [globals.css](../../app/globals.css) (комментарий + `:root` переменные `--bp-*` + расширенный комментарий с правилами)
- [x] Задокументировать правило `dvh/svh` в [AGENTS.md](../../AGENTS.md) (блок «Архитектурные CSS-правила») и [coding-standards.md](../ai-rules/coding-standards.md)
- [x] Задокументировать правило `@media (hover: hover)` в [AGENTS.md](../../AGENTS.md) и [coding-standards.md](../ai-rules/coding-standards.md)
- [ ] (позже, если всплывёт боль от inline-styles) создать `Stack`/`Cluster` примитивы

## Вне scope, но на заметку

- `container queries` — заманчиво, но требуют рефакторинга всего и мы не готовы. Может быть Plan 14.
- CSS `:has()` для родительских состояний — поддержка достаточная, можно точечно, но не как архитектурное правило.
