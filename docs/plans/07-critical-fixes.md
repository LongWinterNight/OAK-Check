# Plan 07 — Critical Fixes

**Статус:** ✅ Закрыт.

## Scope
Срочные баги: неверные роли в DELETE-роутах, отсутствие UI удаления шота, нерабочие заглушки в SystemTab, аватар без загрузки.

## Роли (справка)
```
ARTIST  — просмотр, пункты, загрузка рендеров, комментарии
QA      — ARTIST + статус шота, пины
LEAD    — QA + управление чеклистом, assign, удаление шотов
POST    — рендеры, статусы, комментарии
PM      — проекты, статистика
ADMIN   — всё
```

## Подзадачи

### 7.1 Неверные роли в DELETE API ✅
- **7.1.1** `DELETE /api/projects/[id]` — было `['ADMIN']`, стало `['PM', 'ADMIN']` (соответствует `can.deleteProject`).
- **7.1.2** `DELETE /api/shots/[id]` — было `['ADMIN']`, стало `['LEAD', 'PM', 'ADMIN']` (соответствует `can.deleteShot`).

### 7.2 Удаление шота — UI-кнопка ✅
- **Где:** [components/projects/](../../components/projects/) (в ProjectDetailClient)
- Иконка trash на hover в карточке шота → ConfirmDialog → DELETE → убрать из state + toast.

### 7.3 SystemTab — clearCache реальный ✅
- **Где:** [app/api/admin/revalidate/route.ts](../../app/api/admin/revalidate/route.ts) + [app/(app)/settings/tabs/SystemTab.tsx](../../app/(app)/settings/tabs/SystemTab.tsx)
- POST /api/admin/revalidate → `revalidatePath('/', 'layout')` → toast.success/error.

### 7.4 SystemTab — статус хранилища ✅
- Обновлён статичный текст с `/public/uploads` на `Google Drive · D:\AI\Oak3CRM\uploads` (актуально для текущего self-hosted сценария).
- Реальный размер через `renderVersion.aggregate({ _sum: { fileSize } })` — см. Plan 10.2.

### 7.5 ProfileTab — аватар с загрузкой ✅
- **Где:** [app/(app)/settings/tabs/ProfileTab.tsx](../../app/(app)/settings/tabs/ProfileTab.tsx)
- `<input type="file">` поверх аватара, POST /api/upload → PATCH /api/users/me { avatarUrl }. См. Plan 10.1 для деталей.

## Итого
Закрыто. Самый быстрый и нужный блок, делался в первую очередь после Plan 01–06.
