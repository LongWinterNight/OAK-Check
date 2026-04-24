# Design tokens

Источник правды — [app/globals.css](../../app/globals.css). Этот файл — читабельный индекс + контекст.

## Цвета (light, default `:root`)

### Поверхности
| Токен | Hex | Использование |
|---|---|---|
| `--bg` | `#F7F4EE` | Корневой фон |
| `--surface` | `#FFFFFF` | Карточки, сайдбар, топбар |
| `--surface-2` | `#F2EEE5` | Hover строк, input bg |
| `--surface-3` | `#ECE6D9` | Активный nav item, segmented |
| `--border` | `#E2DCD0` | Дивайдеры, рамки |
| `--border-strong` | `#C9C1B1` | Рамки при hover |

### Текст
| Токен | Hex | Использование |
|---|---|---|
| `--fg` | `#1A1813` | Основной текст |
| `--fg-muted` | `#6A6558` | Вторичный текст, иконки |
| `--fg-subtle` | `#8F897B` | Моно-метки, хлебные крошки |

### Семантические
| Токен | Hex | Смысл |
|---|---|---|
| `--done` | `#3F8C4A` | Готово, 100% прогресс |
| `--wip` | `#B87A14` | В работе, ревью |
| `--blocked` | `#B8402D` | Блокер, ошибка |
| `--info` | `#2563B0` | Информация |

### Бренд
| Токен | Hex | Использование |
|---|---|---|
| `--accent` | `#8C5E1E` | Primary кнопки, focus, активный nav. **Совпадает с `--oak` по умолчанию.** |
| `--oak` | `#8C5E1E` | Логотип, брендинг, section accents |
| `--oak-deep` | `#4A3616` | Углубление бренда (hover/active oak) |

## Цвета (dark, `[data-theme="dark"]`)

| Токен | Hex |
|---|---|
| `--bg` | `#0E0D0B` |
| `--surface` | `#16140F` |
| `--surface-2` | `#1C1914` |
| `--surface-3` | `#24201A` |
| `--border` | `#2A2620` |
| `--border-strong` | `#3B3529` |
| `--fg` | `#F2EFE7` |
| `--fg-muted` | `#A39E90` |
| `--fg-subtle` | `#6B6659` |
| `--done` | `#7BC47F` |
| `--wip` | `#E8B04B` |
| `--blocked` | `#E26B5A` |
| `--info` | `#7CB8FF` |
| `--accent` | `#C89B54` |
| `--oak` | `#C89B54` |
| `--oak-deep` | `#7A5A2E` |

## Акцентные варианты

Переключение через `[data-accent="<name>"]` на `<html>` (см. `useThemeStore.applyToDOM`).

| `data-accent` | Light `--accent` | Dark `--accent` |
|---|---|---|
| (none / oak) | `#8C5E1E` | `#C89B54` |
| `blue` | `#1E6FE0` | `#58A6FF` |
| `amber` | `#B87A14` | `#E8B04B` |
| `green` | `#3F8C4A` | `#7BC47F` |
| `lime` | `#6A8A0D` | `#C6E84B` |

## Отступы

| Токен | px |
|---|---|
| `--spacing-1` | 2 |
| `--spacing-2` | 4 |
| `--spacing-3` | 8 |
| `--spacing-4` | 14 |
| `--spacing-5` | 20 |
| `--spacing-6` | 28 |

## Скругления

| Токен | px | Использование |
|---|---|---|
| `--radius` | 8 (default, меняется через `useThemeStore.setRadius`) | Карточки, кнопки, большинство |
| `--radius-sm` | 6 | Бейджи, мелкие элементы |
| `--radius-lg` | 12 | Крупные карточки |
| `--radius-xl` | 16 | Модалки, hero-секции |

Пользователь может поменять `--radius` через [AppearanceTab.tsx](../../app/(app)/settings/tabs/AppearanceTab.tsx): 0 / 4 / 8 / 12.

## Типографика

```
--font-ui:   'Inter Tight', ui-sans-serif, system-ui, sans-serif
--font-mono: 'JetBrains Mono', ui-monospace, 'SF Mono', monospace
```

Подключены через Google Fonts: `@import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap')` в [globals.css:1](../../app/globals.css).

| Роль | Шрифт | Размер | Вес | Letter-spacing |
|---|---|---|---|---|
| Display | Inter Tight | 36 | 600 | -0.8px |
| H1 | Inter Tight | 24 | 600 | -0.4px |
| H2 | Inter Tight | 18 | 600 | -0.2px |
| Body | Inter Tight | 13 | 400 | 0 |
| Label mono | JetBrains Mono | 11 | 400 | 0.3px |

Line-height body = 1.55 (задано на `body`).

## Тени

| Токен (light) | Значение |
|---|---|
| `--shadow-sm` | `0 1px 2px rgba(0, 0, 0, 0.08)` |
| `--shadow-md` | `0 4px 12px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)` |
| `--shadow-lg` | `0 12px 32px rgba(0, 0, 0, 0.14), 0 2px 6px rgba(0, 0, 0, 0.08)` |
| `--shadow-focus` | `0 0 0 3px rgba(140, 94, 30, 0.25)` |

В dark — более плотные (см. globals.css:70-73).

## Скроллбар

Кастомный, задан глобально в [globals.css:87-99](../../app/globals.css):
- Ширина: 10px
- Thumb: `var(--border)`, radius 999px
- Hover: `var(--border-strong)`
- Track: transparent

## Анимации

| Где | Transition |
|---|---|
| Hover строки | `background 0.12s` |
| Кнопки | `filter 0.12s, background 0.12s` |
| Check3 | `all 0.15s` |
| ProgressBar | `width 0.4s cubic-bezier(.2,.8,.2,1)` |
| OakRing arc | `stroke-dashoffset 0.5s cubic-bezier(.2,.8,.2,1)` |
| Focus ring | `box-shadow 0.12s` |

## Brand gradients

Проекты имеют `coverGradient` — css linear-gradient, default `linear-gradient(135deg, #3a5a7a, #1a2a3a)` (см. [prisma/schema.prisma](../../prisma/schema.prisma) model Project).
