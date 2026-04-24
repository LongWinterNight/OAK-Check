# 09 — Backend Developer

## Scope в Plan 12

Адаптив UI почти не касается бэкенда. Backend подключается только если фронт обнаружит точечные проблемы.

## Потенциальные задачи (активируются по факту)

### 1. Retry-механика для upload (активируется, если Full-stack 07 обнаружит падения)

Мобильные сети (3G/4G, нестабильный wifi) роняют загрузку. Варианты:
- Tus.io (resumable uploads) — большая работа, **отложить до Plan 13**
- Chunked upload с retry-per-chunk — средняя работа
- Простой retry-on-fail (3 попытки, exp backoff) — минимум

Решение: **минимум**, пока QA не докажет необходимость большего.

- [ ] (условно) Добавить retry(3) с exp backoff на клиенте в [UploadSheet](../../components/mobile/UploadSheet/) — формально frontend, backend пересматривает contract на идемпотентность upload-эндпоинта

### 2. Thin payloads (активируется, если SRE 10 найдёт жирный JSON на мобиле)

Правило: не добавляем превентивно. Если нашли — обсуждаем формат флага (`?slim=1` / отдельный эндпоинт / GraphQL-field-selection).

### 3. Session refresh на мобиле

Mobile browsers чаще теряют сессию (переход в background, очистка cookies на iOS через 7 дней ITP). Проверить:
- [ ] JWT refresh работает прозрачно после пробуждения вкладки на мобиле (не редиректит на login без причины)
- [ ] Invalidate session при смене роли/удалении юзера доходит до мобильного клиента через SSE (если не доходит — обсудить с Full-stack 07)

### 4. Endpoint-аудит на мобильный трафик (опционально)

- [ ] Просмотреть логи: есть ли эндпоинты с аномально большими response на мобильных User-Agents? Если да — в thin payload.

## Граница ответственности

| Что | Кто |
|---|---|
| URL-state drill-down на чеклисте | Full-stack 07 (нет изменений API) |
| Upload retry-логика client-side | Frontend 06 + Full-stack 07 |
| Upload chunked | Backend 09 (если откроем отдельный план) |
| SSE reconnect on visibility | Full-stack 07 |
| SSE cleanup на сервере | Уже сделано в Plan 11 |

## Явно вне scope

- Chunked/tus uploads
- GraphQL
- Мобильный BFF (backend-for-frontend)

Эти темы — **не Plan 12**, открывать отдельно при обосновании.
