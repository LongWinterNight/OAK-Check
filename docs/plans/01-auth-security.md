# Plan 01 — Auth & Security

**Статус:** ✅ Закрыт

## Scope
Безопасность аутентификации: brute-force защита, изоляция dev-аккаунта, безопасные токены инвайтов, audit log, типизация session.

## Подзадачи

### 1.1 Brute-force protection ✅
- **Где:** [auth.ts](../../auth.ts), [app/api/users/me/route.ts](../../app/api/users/me/route.ts)
- **Что:** 5 неудачных попыток → блокировка на 15 минут через `lockedUntil`, счётчик `loginAttempts`. Dev-user не затрагивается.
- **UI:** сообщение "Аккаунт заблокирован до HH:MM" если `lockedUntil` в будущем.

### 1.2 Убрать хардкод dev-аккаунта ✅
- **Где:** [auth.ts](../../auth.ts), `.env.local`, [.env.example](../../.env.example)
- **Что:** credentials вынесены в `DEV_USER_LOGIN/PASSWORD/NAME` env-переменные. Guard на `NODE_ENV === 'production'` блокирует dev-user в prod.

### 1.3 Rotation инвайт-токенов ✅
- **Где:** [app/api/invitations/route.ts](../../app/api/invitations/route.ts)
- **Что:** токены генерируются через `crypto.randomBytes(32).toString('hex')`, а не cuid default.

### 1.4 Audit log для admin-действий ✅
- **Где:** [prisma/schema.prisma](../../prisma/schema.prisma), `/api/users/[id]`, `/api/invitations`
- **Что:** добавлены `ActivityType`: `USER_ROLE_CHANGED`, `USER_DELETED`, `INVITE_CREATED`, `INVITE_REVOKED`. Логируются при admin-действиях.

### 1.5 Типизация session.user ✅
- **Где:** [types/next-auth.d.ts](../../types/next-auth.d.ts)
- **Что:** декларация `Session.user` с `id: string; role: Role`. Все касты `as { role?: string }` удалены из API-роутов и страниц.

## Итого

Закрыто 22.04.2026. Все 5 подзадач реализованы в порядке: 1.2 → 1.1 → 1.3 → 1.5 → 1.4.
