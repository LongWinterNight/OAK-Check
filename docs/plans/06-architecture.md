# Plan 06 — Software Architecture

**Статус:** ◐ Частично. Типизация, ENV-валидация, error boundaries, zod, logger — закрыты. Service layer и тесты — отложены.

## Scope
Типизация session, service layer, ENV валидация, тесты, error boundaries, централизация zod-схем, logging.

## Подзадачи

### 6.1 Типизация session.user ✅
- **Где:** [types/next-auth.d.ts](../../types/next-auth.d.ts)
- Модуль-аугментация `next-auth` расширяет `Session.user` на `{ id, role: Role }`. Все касты `as { role?: string }` удалены из API и страниц.

### 6.2 Service layer ⏳
- **Цель:** вынести Prisma-вызовы из страниц в `lib/services/{project,shot,user,checklist,activity}Service.ts`.
- **Отложено:** требует завершения 6.1 и 2.2 (soft-delete). Большой рефакторинг, делается когда появится вторая точка потребления (например GraphQL).

### 6.3 ENV валидация ✅
- **Где:** [lib/env.ts](../../lib/env.ts)
- Zod-схема на `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `RESEND_API_KEY`, `DEV_USER_*`, `NODE_ENV`.
- В production при ошибке валидации — `process.exit(1)`.

### 6.4 Тесты ⏳
- Vitest установлен но тесты не написаны.
- **План когда возьмёмся:** unit на `lib/roles.ts can.*`, `lib/utils.ts computeProgress`, `lib/auth-guard.ts` с mock сессии. Integration на invite flow.

### 6.5 Error boundaries и loading states ✅
- **Где:** [app/(app)/error.tsx](../../app/(app)/error.tsx), `loading.tsx` на уровнях `(app)/`, `dashboard/`, `library/`, `projects/`, `activity/`
- Friendly-сообщение вместо белого экрана, кнопка retry.

### 6.6 Централизация zod-схем ✅
- **Где:** [lib/zod-schemas.ts](../../lib/zod-schemas.ts)
- `RegisterSchema`, `CreateInvitationSchema`, `CreateChapterSchema`, `ShotStatusSchema`, `AssignShotSchema`, `UpdateUserRoleSchema`, `UpdateMeSchema`.

### 6.7 Logger ✅
- **Где:** [lib/logger.ts](../../lib/logger.ts)
- `logger.error/warn/info(ctx, ...)` — унифицированный префикс. Вместо разрозненных `console.error('[route]', e)`.

## Итого
Закрыто всё кроме service layer и тестов. Оба — про долгосрочную зрелость, сейчас не блокируют фичи.
