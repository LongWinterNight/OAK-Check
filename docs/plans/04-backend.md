# Plan 04 — Core Backend

**Статус:** ✅ Закрыт.

## Scope
Activity logging, смена статуса шота, формы добавления пунктов/этапов, kanban drag, assign, смена пароля.

## Подзадачи

### 4.1 Activity logging — lib/activity.ts ✅
- **Где:** [lib/activity.ts](../../lib/activity.ts)
- `logActivity({ userId, type, message, shotId? })` с try/catch (логирование не падает main-operation)
- Подключено в мутации: item state change, new item, new comment, version upload, shot status change, role change, user deletion.

### 4.2 Смена статуса шота через ShotHeader ✅
- **Backend:** `PATCH /api/shots/[id]/status` (requireRole LEAD/QA/PM/ADMIN) + logActivity + SSE broadcast
- **Frontend:** в [ShotHeader](../../components/checklist/ShotHeader/ShotHeader.module.css) кнопка «На ревью» с spinner и динамическим лейблом (WIP→REVIEW→...)

### 4.3 Форма добавления пункта чеклиста ✅
- **Где:** [components/checklist/ItemsList/ItemsList.module.css](../../components/checklist/ItemsList/ItemsList.module.css)
- Inline форма: input[title] + select[ownerId] + OK/Cancel. Enter = submit, Esc = cancel.

### 4.4 Форма добавления этапа (Chapter) ✅
- **Где:** [components/checklist/ChaptersPanel/ChaptersPanel.module.css](../../components/checklist/ChaptersPanel/ChaptersPanel.module.css)
- Dropdown: «Новый этап» (inline input → POST /api/chapters) ИЛИ «Шаблон» (выбор из /api/templates → POST /api/shots/[id]/checklist с templateId).

### 4.5 KanbanBoard drag & drop ✅
- **Где:** [components/kanban/KanbanBoard.module.css](../../components/kanban/KanbanBoard.module.css)
- `fetch PATCH /api/shots/[id]/status` при DragEnd с optimistic update и rollback при ошибке.

### 4.6 Assign исполнителя на шот ✅
- Dropdown с аватарами в ShotHeader, `PATCH /api/shots/[id]/assign { assigneeId }`, гейт `can.assign` (LEAD/ADMIN).

### 4.7 Смена пароля в ProfileTab ✅
- Секция «Сменить пароль»: currentPassword/newPassword/confirm. `PATCH /api/users/me` (встроено в единый PATCH).
- Dev-user получает 403.

## Итого
Закрыто. Все формы и мутации работают с activity logging и SSE broadcast.
