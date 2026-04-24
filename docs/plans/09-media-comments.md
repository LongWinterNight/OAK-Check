# Plan 09 — Media & Comments

**Статус:** ✅ Закрыт.

## Scope
Пины на рендере (создание), удаление комментариев и версий, лайтбокс, вставка ссылок, счётчики.

## Роли
```
Просматривать рендеры:       все
Загружать рендеры:           все
Удалять версии:              LEAD, ADMIN
Оставлять комментарии:       все
Удалять свой комментарий:    автор
Удалять чужой комментарий:   ADMIN
Создавать пины:              QA, LEAD, POST, PM, ADMIN
```

## Подзадачи

### 9.1 Создание пинов на рендере ✅
- **Где:** [components/checklist/RightPanel/RenderPreview.module.css](../../components/checklist/RightPanel/RenderPreview.module.css)
- Клик на рендер → % координаты (x, y) относительно image rect → фокус в composer с pending-пином → отправка комментария включает `pinX`, `pinY`.
- Курсор crosshair при hover, пульсация временного пина до отправки.

### 9.2 Удаление комментария ✅
- **API:** `app/api/shots/[id]/comments/[commentId]/route.ts` — DELETE (только автор или ADMIN), 204.
- **UI:** [CommentsPanel](../../components/checklist/RightPanel/CommentsPanel.module.css) — Trash на hover.

### 9.3 Удаление версии рендера ✅
- **API:** `app/api/shots/[id]/versions/[versionId]/route.ts` — DELETE (LEAD, ADMIN). Удаляет файл с диска + запись в БД.
- **UI:** `✕` рядом с pill-кнопкой версии → ConfirmDialog.

### 9.4 Лайтбокс ✅
- Компонент ImageLightbox (portal в document.body). Клик на рендер → полноэкранный просмотр. Esc/✕ закрыть, ← → между версиями. Пины масштабируются пропорционально.

### 9.5 Кнопки в comment composer ◐
- **A (сделано):** убраны нерабочие кнопки прикрепления изображения.
- **B (сделано):** вставка ссылки через popover с input URL.

### 9.6 Счётчики ✅
- «Комментарии (N)» в заголовке CommentsPanel.
- Badge с числом пинов на превью рендера.

## Итого
Закрыто. Медиа-флоу стал рабочим для QA/LEAD ревью.
