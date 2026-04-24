# Design system

Адаптация handoff-спецификации под текущий реализованный стек OAK·Check.

## Источники

- **Оригинальный handoff:** [../../../design_handoff_oak_check/README.md](../../../design_handoff_oak_check/README.md) — 755 строк, high-fidelity спека со всеми токенами, компонентами и экранами. Лежит как sibling-папка вне `oak-check/`, т.к. это артефакт от дизайнера.
- **Реализация токенов в коде:** [../../app/globals.css](../../app/globals.css) — CSS custom properties.
- **Прототип для референса:** `design_handoff_oak_check/design_src/prototype.html` — запустить в браузере.

## Как читать эту папку

- [tokens.md](./tokens.md) — цвета, отступы, радиусы, шрифты, тени. Что в `:root` и `[data-theme="dark"]`.
- [components.md](./components.md) — компонентные спеки: Button, Check3, Badge, OakRing, Avatar, ProgressBar, Segmented, Input, Card + иконки.
- [screens.md](./screens.md) — композиции экранов: AppShell (Sidebar + TopBar), Dashboard, Checklist (3-колонки), Kanban, Library, Mobile.

## Отступления от оригинала

| Что | В handoff | В реализации | Причина |
|---|---|---|---|
| CSS approach | Tailwind v4 или CSS vars | CSS Modules + CSS vars | Решение команды — меньше зависимостей |
| Accent color default | `blue` (dark) / `blue` (light) | `oak` (всегда) | Продуктовое решение, `oak` стал фирменным |
| Accent variants | blue | oak, blue, amber, green, lime | Расширено (см. [AppearanceTab.tsx](../../app/(app)/settings/tabs/AppearanceTab.tsx)) |
| Стейт-менеджмент | Zustand / Jotai | Zustand (`useThemeStore`) | Выбран |
| Роль «3D Artist» | `'3D Artist'` string | `ARTIST` enum | Нормализовано в Prisma enum Role |

## Брендинг

- **Название:** OAK·Check (middle-dot между словами — фирменная деталь)
- **Логотип:** дубовый лист (Oak, viewBox 0 0 32 32, стилизованный)
- **Метафора:** OakRing — концентрические кольца как срез дуба, отражают годичные круги (прогресс через накопление)

## Dark / Light

Базовая тема — **светлая**. Переключение через `[data-theme="dark"]` на `<html>` (делает `useThemeStore.applyToDOM()`).

## Акцентный цвет

- Дефолт: `oak` (`--accent: #8C5E1E` light, `#C89B54` dark) — применяется через `:root` без атрибута
- Альтернативы: `blue`, `amber`, `green`, `lime` — через `data-accent="<name>"` на `<html>`
- См. правила переключения в [app/globals.css:77-84](../../app/globals.css)

## Адаптив

- Mobile ≤ 767px
- Tablet 768–1023px
- Desktop ≥ 1024px
- Mobile-специфика компонентов — см. активный план [../plan-12-responsive/](../plan-12-responsive/)
