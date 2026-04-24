# 07 — Full-stack Developer

Стыковка фронта и API там, где адаптив требует изменения данных/роутов.

## Scope для Plan 12

В основном адаптив — фронтовая работа. Full-stack подключается в точках:

### 1. Drill-down routing на чеклисте (мобильный)

Сейчас `ChecklistClient` держит состояние на клиенте. При drill-down (главы → пункты → панель) хочется:

- Чтобы `back-кнопка` браузера работала
- Чтобы можно было поделиться ссылкой с уровня «глава X, пункт Y»

**Решение:** query params `?view=items&chapterId=...&itemId=...` + `useSearchParams` в Next.js. Без изменения API.

- [ ] Реализовать URL-state для mobile drill-down в [ChecklistClient.tsx](../../app/(app)/projects/[projectId]/[shotId]/checklist/ChecklistClient.tsx)
- [ ] Перехват системного `back` (на мобиле свайп-бек) → уровень вверх в drill-down, если не верхний

### 2. Thin payloads для мобилы

Если обнаружится, что mobile LCP страдает из-за жирных JSON — добавить query-параметр `?slim=1` на тяжёлых эндпоинтах. **Не делаем превентивно** — только если SRE (10) зафиксировал реальную проблему.

### 3. Upload с мобилы

`UploadSheet` уже работает. Стык:
- Убедиться, что camera/gallery picker (`<input accept="image/*" capture>`) работает через существующий API
- На мобильных сетях upload может падать — проверить retry-логику (если её нет — отдельный пункт в Backend 09)

- [ ] Проверить `capture="environment"` на iOS/Android для прямой съёмки в UploadSheet
- [ ] Убедиться что прогресс upload отображается (критично на медленных сетях)

### 4. SSE на мобиле

Mobile browsers агрессивно убивают SSE-коннект в background. Варианты:
- При `visibilitychange: visible` — форсированный reconnect SSE
- При backgrounded — держим через Service Worker (не делаем в Plan 12)

- [ ] В хуке SSE-подписки добавить reconnect on `visibilitychange` → `visible`

### 5. Viewport-зависимый рендер на сервере

Next.js SSR не знает ширину экрана. Значит **не делаем рендер-ветвления по ширине** в Server Components. Если нужно — клиентский компонент с CSS-based адаптивом. Это уже правило от EM (03), здесь просто напоминание при code review.

## Задачи

- [ ] URL-state для mobile drill-down чеклиста (см. выше)
- [ ] SSE reconnect on visibility change
- [ ] Проверить upload с камеры на iOS/Android (manual через Manual QA 13, фикс если сломано)
- [ ] (условно) thin payload-флаг, если SRE (10) найдёт горячую точку
