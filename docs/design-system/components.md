# Components

Спецификации реализованных UI-примитивов. Источник кода — [components/ui/](../../components/ui/). Исходные спеки — [../../../design_handoff_oak_check/README.md](../../../design_handoff_oak_check/README.md).

## Button

Файл: [components/ui/Button/](../../components/ui/Button/)

```
Варианты: primary | secondary | ghost | danger | outline
Размеры:  sm (h:28, px:10, fs:12.5)
          md (h:34, px:14, fs:13)
          lg (h:40, px:18, fs:14)
```

| Variant | bg | fg | border |
|---|---|---|---|
| primary | `var(--accent)` | `#0B0A08` (dark) / `#fff` (light) | — |
| secondary | `var(--surface-2)` | `var(--fg)` | `1px solid var(--border)` |
| ghost | transparent | — | transparent, hover: brightness(1.3) |
| danger | `var(--blocked)` | `#fff` | — |
| outline | transparent | `var(--fg)` | `1px solid var(--border-strong)` |

- border-radius: `var(--radius)`
- font: Inter Tight 500, letter-spacing: -0.1px
- transitions: `filter 0.12s, background 0.12s`

## Check3 (3-state checkbox)

Файл: [components/ui/Check3/](../../components/ui/Check3/)

Ключевой фирменный контрол. Цикл: `todo → wip → done → todo`.

```
todo:  border 1.5px var(--border-strong), bg transparent
wip:   border 1.5px var(--wip),           bg rgba(wip, 0.12)
done:  border 1.5px var(--done),          bg var(--done), white ✓ SVG
```

- Размер: 16px default (настраиваемый — на мобиле 18px для тача)
- border-radius: `calc(var(--radius) / 2)`
- transition: `all 0.15s`
- Хит-area на мобиле через `::before` — минимум 44×44

## Badge

Файл: [components/ui/Badge/](../../components/ui/Badge/)

```
Варианты: neutral | done | wip | blocked | info | accent | oak
Размеры:  sm (h:18, px:6, fs:11)
          md (h:22, px:8, fs:11.5)

Структура: [dot? ] [icon? ] label
Dot: круг 6×6 цвета fg того же варианта
```

Цвета вариантов:
| Variant | fg | bg | border |
|---|---|---|---|
| done | `#7BC47F` | `#7BC47F18` | `#7BC47F35` |
| wip | `#E8B04B` | `#E8B04B18` | `#E8B04B35` |
| blocked | `#E26B5A` | `#E26B5A18` | `#E26B5A35` |
| info | `#7CB8FF` | `#7CB8FF18` | `#7CB8FF35` |
| oak | `#C89B54` | `#C89B5418` | `#C89B5435` |

- border-radius: `calc(var(--radius) * 0.75)`
- font: Inter Tight 500, letter-spacing: 0.1px, white-space: nowrap

## OakRing (progress ring)

Файл: [components/ui/OakRing/](../../components/ui/OakRing/)

Фирменный SVG-элемент — концентрические кольца как срез дуба. Используется как индикатор прогресса глав/шотов.

Структура SVG:
```
1. Декоративные внутренние кольца (segments штук):
   <circle r={r_inner_i} stroke="var(--border)" stroke-width="1" fill="none" />

2. Track ring:
   <circle r={r} stroke="var(--surface-3)" stroke-width={stroke} fill="none" />

3. Progress arc:
   <circle r={r}
     stroke={value === 100 ? var(--done) : var(--accent)}
     stroke-width={stroke}
     stroke-dasharray={2πr}
     stroke-dashoffset={2πr * (1 - value/100)}
     stroke-linecap="round"
     transform="rotate(-90 cx cy)"
   />
   /* transition: stroke-dashoffset 0.5s cubic-bezier(.2,.8,.2,1) */

4. Центральный текст (Math.round(value))
```

Параметры: `size` (default 44), `stroke` (default 3), `segments` (default 3), `value` (0–100).

## Avatar / AvatarStack

Файл: [components/ui/Avatar/](../../components/ui/Avatar/)

```
Avatar:
  - div круглый
  - bg: из палитры 7 цветов (хеш от charCode имени)
  - инициалы: 2 буквы, fontSize: size * 0.42, fontWeight 600
  - boxShadow: 0 0 0 1.5px var(--surface) (для stacking)
  - размеры частые: 22 (в строках), 26 (в комментариях), 32 (в ShotHeader)

AvatarStack:
  - negative margin -size*0.3 для перекрытия
  - "+N" кружок если больше max
```

## ProgressBar

Файл: [components/ui/ProgressBar/](../../components/ui/ProgressBar/)

```
height: 6px (настраиваемый, в карточках шотов — 4px)
track: var(--surface-3), border-radius: 999px
fill: var(--accent) (или custom color через prop)
transition: width 0.4s cubic-bezier(.2,.8,.2,1)
```

## Segmented

Файл: [components/ui/Segmented/](../../components/ui/Segmented/)

```
Wrapper:
  display: flex
  padding: 2px
  bg: var(--surface-2)
  border-radius: var(--radius)
  border: 1px solid var(--border)

Активная кнопка:
  bg: var(--surface-3)
  border: 1px solid var(--border)
  color: var(--fg)

Неактивная:
  bg: transparent
  color: var(--fg-muted)

Высота: 26px (mobile: 44+ через padding)
padding: 0 10px
```

## Input

Файл: [components/ui/Input/](../../components/ui/Input/)

```
height: sm=28 | md=34 | lg=40
padding: 0 10px, gap 8px для иконки слева
bg: var(--surface)
border: 1px solid var(--border)
font: Inter Tight 13px, color: var(--fg)

focus:
  border-color: var(--accent)
  box-shadow: 0 0 0 3px rgba(accent, 0.14)

placeholder: var(--fg-muted)
transition: border-color 0.12s, box-shadow 0.12s
```

**Mobile spec:** `font-size: 16px` минимум (иначе iOS зумит при фокусе) — см. [../ai-rules/coding-standards.md](../ai-rules/coding-standards.md).

## Card

Файл: [components/ui/Card/](../../components/ui/Card/)

```
bg: var(--surface)
border: 1px solid var(--border)
border-radius: calc(var(--radius) * 1.25)
padding: 16px
hoverable: border-color → var(--border-strong) при hover
```

## DatePicker

Файл: [components/ui/DatePicker/](../../components/ui/DatePicker/)

Кастомный, рендерится через портал поверх модалей (фикс в коммите `1584b33`). В дизайн-системе своего стиля, синхронизированного с общими токенами.

## Modal / ConfirmDialog

Файл: [components/ui/Modal/](../../components/ui/Modal/)

- **Desktop:** центрированное окно с backdrop, max-width ~400-600px
- **Mobile (план):** full-screen для сложных форм, bottom-sheet для ConfirmDialog — см. [../plan-12-responsive/05-product-designer.md](../plan-12-responsive/05-product-designer.md)

## Toast

Файл: [components/ui/Toast/](../../components/ui/Toast/)

- **Desktop:** правый нижний угол
- **Mobile (план):** top-center чтобы не перекрывало BottomNav

## Skeleton

Файл: [components/ui/Skeleton/](../../components/ui/Skeleton/)

Shimmer-плейсхолдеры, используются для loading-состояний.

## Иконки

Файл: [components/icons/](../../components/icons/) (или `components/ui/icons`)

```
viewBox: 0 0 20 20
stroke: currentColor
stroke-width: 1.6
stroke-linecap: round
stroke-linejoin: round
fill: none
```

Набор из `design_handoff_oak_check/design_src/icons.jsx`:
```
Check, Plus, Minus, X, ChevR, ChevD, ChevL, Search, Filter, Bell, User,
Folder, List, Grid, Kanban, Calendar, Image, Paper, Upload, Link, Msg,
Eye, Play, Pause, Dot, More, Moon, Sun, Settings, Sparkle, Camera, Cube,
Layers, Flag, Bolt, Clock, Trash
```

Фирменные:
- **Oak** (дубовый лист) — `viewBox="0 0 32 32"`
- **Acorn** (жёлудь) — `viewBox="0 0 24 24"`

## Mobile-специфичные

### UploadSheet

Файл: [components/mobile/UploadSheet/](../../components/mobile/UploadSheet/)

Bottom-sheet для быстрой загрузки рендера с камеры/галереи. Появляется при тапе на central pill в BottomNav.
