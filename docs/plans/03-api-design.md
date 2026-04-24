# Plan 03 — API Design

**Статус:** ✅ Закрыт (версионирование — осознанно отложено).

## Scope
Унификация ошибок, пагинация, недостающие эндпоинты (status, assign, chapters, password, admin-stats), consistent response shape.

## Подзадачи

### 3.1 Унификация ошибок ✅
- **Где:** [lib/api-error.ts](../../lib/api-error.ts)
- **Коды:** `UNAUTHORIZED | FORBIDDEN | NOT_FOUND | VALIDATION_ERROR | CONFLICT | GONE | SERVER_ERROR | LOCKED | RATE_LIMIT | UNPROCESSABLE`
- Все API используют `apiError('CODE', detail?)` вместо inline `NextResponse.json({ error: '...' })`.

### 3.2 Пагинация ✅
- **Формат ответа:** `{ data, total, page, limit, hasMore }`
- Реализовано для `/api/projects`, `/api/users`, `/api/activity`
- Клиенты ProjectsGrid и TeamTab обновлены.

### 3.3 Недостающие эндпоинты

| Эндпоинт | Роли | Статус |
|---|---|---|
| `PATCH /api/shots/[id]/status` | LEAD, QA, PM, ADMIN | ✅ |
| `PATCH /api/shots/[id]/assign` | LEAD, ADMIN | ✅ |
| `POST /api/chapters`, `DELETE /api/chapters/[id]` | LEAD, ADMIN | ✅ |
| `POST /api/shots/[id]/checklist` (одиночный item) | LEAD, ADMIN | ✅ |
| `PATCH /api/users/me` (включая смену пароля) | requireAuth | ✅ |
| `GET /api/admin/stats` | ADMIN | ✅ |

### 3.4 Версионирование API ⏳
Отложено. `/api/v1/...` будет введено через `rewrites` в next.config.ts когда появится breaking-изменение.

### 3.5 Consistent response shape ✅
- GET list → `{ data, total, page, limit, hasMore }`
- GET single → объект напрямую
- POST → созданный объект, status 201
- PATCH → обновлённый объект
- DELETE → `null`, status 204

## Итого
Закрыто. Унификация рефакторингом в конце, чтобы не проходить дважды.
