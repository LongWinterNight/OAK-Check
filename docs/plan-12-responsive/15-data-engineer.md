# 15 — Data Engineer

## Scope в Plan 12

**Прямых задач по адаптиву UI нет.** Data Engineer включается, только когда появится ETL или аналитика поверх мобильного использования.

## Триггеры вовлечения

### 1. Mobile usage analytics

Если Product Manager (01) потребует понять «какой процент ARTIST-flow реально идёт с мобилы» — понадобится:
- Сбор событий типа `screen_view`, `action_click` с `device_type` (mobile/tablet/desktop на основе viewport)
- Хранилище: отдельная таблица или внешний продукт (PostHog, Plausible, собственное)
- Дашборд с ретеншеном по device

**Не делаем в Plan 12.** Сначала — закрываем функциональный адаптив. Аналитика — решение Product+CTO после.

### 2. Web Vitals в долгосрочное хранилище

SRE (10) сейчас пишет метрики в логи. Если решим агрегировать:
- ETL в `WebVitalMetric` → дневные агрегаты в `WebVitalDaily` (p50/p75/p95 по url × device)
- Дашборд перфоманса (Grafana/Metabase/own)

**Не делаем в Plan 12.**

### 3. Existing ActivityLog enrichment

В `ActivityLog` уже есть записи о действиях юзеров. При желании — обогащать их `user_agent` и `viewport_class` (mobile/tablet/desktop) для последующих анализов.

- [ ] (опционально, если PM 01 попросит) добавить поле `viewport_class` к новым ActivityLog записям — это 1 миграция + 1 строка на write-call

## Заметки на будущее (Plan 13+)

- Если откроем офлайн-режим → sync-events от клиентов, конфликт-лог, отдельная очередь
- Если включим push-уведомления → аналитика доставки/открытий

## Задачи

Нет активных задач. Файл — placeholder.
