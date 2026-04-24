# 06 — Frontend Developer

Главный исполнительский файл. Задачи сгруппированы по приоритету (P0 блокирует mobile-ready). Каждый пункт = 1 коммит.

## P0 — ARTIST flow на мобиле

### Чеклист (центральный экран)

- [ ] [components/checklist/ChaptersPanel/ChaptersPanel.module.css](../../components/checklist/ChaptersPanel/ChaptersPanel.module.css) — media queries, на мобиле `display: none` по умолчанию (показываем через drill-down state)
- [ ] [components/checklist/ItemsList/ItemsList.module.css](../../components/checklist/ItemsList/ItemsList.module.css) — на мобиле full-width, padding 12px
- [ ] [components/checklist/ItemsList/ChecklistRow.module.css](../../components/checklist/ItemsList/ChecklistRow.module.css) — увеличить touch-area чекбокса, inline-редактирование с комфортной клавиатурой
- [ ] [components/checklist/RightPanel/RightPanel.module.css](../../components/checklist/RightPanel/RightPanel.module.css) — на мобиле `display: none` в drill-down-state «пункты»
- [ ] [app/(app)/projects/[projectId]/[shotId]/checklist/ChecklistClient.tsx](../../app/(app)/projects/[projectId]/[shotId]/checklist/ChecklistClient.tsx) — state `mobileView: 'chapters' | 'items' | 'panel'`, хлебные крошки для навигации (см. спеку в 05)

### Комментарии и рендер

- [ ] [components/checklist/RightPanel/CommentsPanel.module.css](../../components/checklist/RightPanel/CommentsPanel.module.css) — input sticky bottom с safe-area, scroll-to-bottom при фокусе
- [ ] [components/checklist/RightPanel/RenderPreview.module.css](../../components/checklist/RightPanel/RenderPreview.module.css) — fit контейнера, контролы на мобиле крупнее

### Upload

- [ ] [components/checklist/UploadRenderModal/UploadRenderModal.module.css](../../components/checklist/UploadRenderModal/UploadRenderModal.module.css) — full-screen на мобиле
- [ ] [components/mobile/UploadSheet/UploadSheet.module.css](../../components/mobile/UploadSheet/UploadSheet.module.css) — проверить что корректно работает с safe-area-bottom

## P1 — LEAD/QA/PM tablet flow

### Kanban touch

- [ ] [components/kanban/KanbanBoard.module.css](../../components/kanban/KanbanBoard.module.css) — horizontal scroll-snap между колонками на мобиле
- [ ] [components/kanban/KanbanBoard](../../components/kanban/) — проверить, что DnD-библиотека (HTML5 DnD / dnd-kit) работает на touch. Если нет — переключить на `PointerSensor` от dnd-kit.

### Review

- [ ] [app/(app)/review/page.module.css](../../app/(app)/review/page.module.css) — media queries, карточки в 1 колонку на мобиле

### Dashboard внутренности

- [ ] [components/dashboard/MyDay.module.css](../../components/dashboard/MyDay.module.css)
- [ ] [components/dashboard/MyShots.module.css](../../components/dashboard/MyShots.module.css)
- [ ] [components/dashboard/ActivityFeed.module.css](../../components/dashboard/ActivityFeed.module.css)
- [ ] [components/dashboard/DeadlineAlert.module.css](../../components/dashboard/DeadlineAlert.module.css)

### Projects inner

- [ ] Проверить [app/(app)/projects/[projectId]/page.module.css](../../app/(app)/projects/[projectId]/page.module.css) — уже есть media queries, нужна ревизия
- [ ] [components/projects/NewProjectModal.module.css](../../components/projects/NewProjectModal.module.css) — full-screen на мобиле

### Library

- [ ] [components/library/LibraryClient.module.css](../../components/library/LibraryClient.module.css)
- [ ] [components/library/TemplateCard.module.css](../../components/library/TemplateCard.module.css)
- [ ] [components/library/NewTemplateModal.module.css](../../components/library/NewTemplateModal.module.css) — full-screen на мобиле
- [ ] [components/library/ApplyTemplateModal.module.css](../../components/library/ApplyTemplateModal.module.css) — full-screen на мобиле

## P2 — Остальные экраны и примитивы

### Pages без media queries

- [ ] [app/(app)/tasks/page.module.css](../../app/(app)/tasks/page.module.css)
- [ ] [app/(app)/settings/page.module.css](../../app/(app)/settings/page.module.css)
- [ ] [app/(app)/settings/SettingsClient.module.css](../../app/(app)/settings/SettingsClient.module.css)
- [ ] [app/(auth)/layout.module.css](../../app/(auth)/layout.module.css)
- [ ] [components/auth/LoginForm.module.css](../../components/auth/LoginForm.module.css)

### UI primitives

- [ ] [components/ui/Modal/Modal.module.css](../../components/ui/Modal/Modal.module.css) — prop `fullScreenOnMobile` или глобальное правило через breakpoint
- [ ] [components/ui/Modal/ConfirmDialog.module.css](../../components/ui/Modal/ConfirmDialog.module.css) — bottom sheet на мобиле
- [ ] [components/ui/DatePicker/DatePicker.module.css](../../components/ui/DatePicker/DatePicker.module.css) — full-width popover снизу
- [ ] [components/ui/Toast/Toast.module.css](../../components/ui/Toast/Toast.module.css) — top-center на мобиле (не перекрывает bottom-nav)
- [ ] [components/ui/Segmented/Segmented.module.css](../../components/ui/Segmented/Segmented.module.css) — tab ≥ 44px высоты
- [ ] [components/ui/Input/Input.module.css](../../components/ui/Input/Input.module.css) — `font-size: 16px` на мобиле (избегаем iOS zoom at focus)

### Activity

- [ ] [components/activity/ActivityFeedInfinite.module.css](../../components/activity/ActivityFeedInfinite.module.css)

## P3 — Polish

- [ ] `@media (hover: hover)` обёртки на hover-правилах по кодовой базе (см. 04)
- [ ] Замена `100vh` → `100dvh` во всех full-screen layouts (см. 04)
- [ ] Поиск остаточных horizontal scrolls через Playwright (см. 12)

## Рабочий поток

1. Берём верхнюю `[ ]` задачу с P0/P1/P2 (в порядке приоритета)
2. В DevTools переключаем на 360/768/1024
3. Фиксим CSS/React
4. Коммит + push
5. Отмечаем `[x]`
