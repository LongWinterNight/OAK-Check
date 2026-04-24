# Plan 02 — Database

**Статус:** ◐ Закрыт кроме soft-delete (осознанно отложено).

## Scope
Индексы производительности, soft-delete, audit trail (createdBy/updatedBy), Invitation FK, очистка истёкших инвайтов.

## Подзадачи

### 2.1 Индексы производительности ✅
- **Миграция:** `20260420155745`
- Добавлены `@@index` на Shot (projectId, assigneeId, status, [projectId, status]), CheckItem (shotId, chapterId, ownerId, [shotId, state]), Activity (userId, shotId, createdAt, type), Comment (shotId, userId, parentId), Invitation (email, createdBy, expiresAt), RenderVersion (shotId, createdAt).

### 2.2 Soft-delete для Projects и Shots ⏳
- **Статус:** отложено (требует больших изменений во всех API).
- Будущее: `deletedAt DateTime?` + `@@index([deletedAt])` + фильтры во всех запросах + архив-эндпоинт.

### 2.3 Audit trail — createdBy/updatedBy ✅
- **Миграция:** `20260420201613` (nullable FK + `onDelete: SetNull`, индексы)
- `Project.createdBy/updatedBy`, `Shot.createdBy/updatedBy` как связи на User.

### 2.4 Invitation.createdBy как FK ✅
- **Миграция:** `20260420161738`
- `Invitation.createdBy` → `User` с `onDelete: SetNull`. В GET `/api/invitations` `include creator` для UI «кто пригласил».

### 2.5 Очистка истёкших инвайтов ✅
- В GET `/api/invitations` перед возвратом: `deleteMany({ where: { expiresAt: { lt: new Date() }, usedAt: null } })`.

## Итого

Закрыто 20.04.2026. 4 из 5 подзадач. Soft-delete — отложено до появления реальной потребности (пока удаления редкие и аудитируются через Activity).
