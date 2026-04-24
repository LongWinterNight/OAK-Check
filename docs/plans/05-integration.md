# Plan 05 — Integration & Webhooks

**Статус:** ◐ Частично. Pusher удалён, SSE reconnect сделан. Uploadthing/webhook/email-расширение — отложено.

## Scope
SSE масштабируемость, удалить неиспользуемый Pusher, uploadthing vs local storage, render-complete webhook, расширение email-шаблонов.

## Подзадачи

### 5.1 SSE — масштабирование ⏳
- **Где:** [lib/sse/emitter.ts](../../lib/sse/emitter.ts), `app/api/sse/[projectId]/route.ts`
- Текущая реализация хранит подписчиков в памяти процесса (`Map<string, Set<Controller>>`). Работает на 1 инстансе.
- **Отложено:** переход на Redis pub/sub нужен только при горизонтальном масштабировании (2+ инстанса).

### 5.2 Удалить неиспользуемый Pusher ✅
- `npm remove pusher pusher-js` — сэкономило ~300KB bundle клиента.

### 5.3 File Storage — uploadthing vs local ⚠️ выбрано **local**
- Установлен `uploadthing@7.7.4` и `@uploadthing/react`, но используется кастомный `/api/upload` в `public/uploads/`.
- **Решение:** оставить local — self-hosted на Windows-сервере. При переходе на Vercel/cloud — мигрировать на Uploadthing (core.ts + UploadThingButton).
- **Note:** `public/uploads/` не персистентен на Vercel. Учитывать при смене деплоя.

### 5.4 Webhook render-complete ⏳
- Отложено. Создание `app/api/webhooks/render-complete/route.ts` с `X-Webhook-Secret` — когда появится интеграция с рендер-фермой.

### 5.5 SSE reconnect на клиенте ✅
- **Где:** `hooks/useSSE.ts`
- Exponential backoff: 1s → 2s → 4s → max 30s. Reset на `onopen`.

### 5.6 Расширение email-шаблонов ⏳
- Сейчас только invite. Отложены: review-request email при переводе шота в REVIEW, password-reset.

## Итого
Закрыты критические (Pusher, SSE reconnect). Upload/SSE Redis/webhook ждут deployment-решений.
