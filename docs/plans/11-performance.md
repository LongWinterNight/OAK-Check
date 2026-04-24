# Plan 11 — Performance & Scalability

**Статус:** ✅ Закрыт 22.04.2026. Критичные части — N+1 и SSE-утечки — могли сломать прод при 40+ пользователях.

## Scope
N+1 queries, пагинация тяжёлых списков, rate limiting, SSE cleanup, лимит версий, хардкоды.

## Подзадачи

### 11.1 N+1 в shots API ✅
- **Где:** [app/api/projects/[id]/shots/route.ts](../../app/api/projects/[id]/shots/route.ts)
- Убран `Promise.all` с N отдельными запросами за owner/items, заменён на `include: { owner, items }` в одном запросе.

### 11.2 Пагинация комментариев ✅
- **Где:** [app/api/shots/[id]/comments/route.ts](../../app/api/shots/[id]/comments/route.ts)
- Добавлен `take: 200`.

### 11.3 Rate limiting ✅
- **Где:** [lib/rate-limit.ts](../../lib/rate-limit.ts)
- In-memory `Map`, автоочистка каждые 5 минут.
- Применён: POST /comments (60/мин на юзера), POST /versions (20/час на юзера).
- При превышении: HTTP 429 с понятным сообщением.

### 11.4 SSE cleanup ✅
- **Где:** [lib/sse/emitter.ts](../../lib/sse/emitter.ts), `app/api/sse/[projectId]/route.ts`
- setInterval 60с — пинг всех подписчиков, удаление мёртвых.
- Рефакторинг route: cleanup() функция, AbortSignal handler, max timeout 10 минут, корректный `cancel()` handler ReadableStream.

### 11.5 Upload rate limit по роли ⏳
- **Отложено.** Дневной лимит загрузок через БД — реализовать при появлении реального abuse.

### 11.6 ShotHeader hardcoded version ✅
- **Где:** [components/checklist/ShotHeader/ShotHeader.module.css](../../components/checklist/ShotHeader/ShotHeader.module.css)
- Дефолт изменён с `'v012'` на `'—'`.

### 11.7 Session invalidation on password change ⏳
- **Отложено.** Инвалидация всех активных сессий при смене пароля — реализовать вместе с refresh-token rotation.

### 11.8 Лимит версий рендера ✅
- **Где:** [app/api/shots/[id]/versions/route.ts](../../app/api/shots/[id]/versions/route.ts)
- Добавлен `take: 50`.

## Итого
Закрыто 6 из 8. Отложенные (11.5, 11.7) — не критичные, ждут реального сценария. Перед новыми сложными endpoints — проверять `include` и rate-limit.
