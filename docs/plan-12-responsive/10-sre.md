# 10 — Site Reliability Engineer

## Цель

Убедиться, что Plan 12 не ломает производительность и дать данные для приоритизации.

## Core Web Vitals на мобиле

Target thresholds (Google "good"):
- **LCP** ≤ 2.5s
- **INP** ≤ 200ms
- **CLS** ≤ 0.1

На 4G-эмуляции (Moto G Power класс устройств).

## Задачи

### 1. Включить сбор RUM

- [ ] Установить `web-vitals` (npm package) и отправлять метрики на свою `/api/metrics` точку (если нет — создать минимальную)
- [ ] В `app/layout.tsx` (client boundary) или в отдельном `<Analytics />` — `onCLS/onINP/onLCP/onFCP/onTTFB` и POST в `/api/metrics`
- [ ] Хранить в новой таблице `WebVitalMetric` (user-agent, url, metric, value, timestamp) или слать в существующую Activity-подобную сущность

Минимальная реализация — без нового хранилища, пишем в `console.log` на сервере и смотрим в логах. Достаточно для Plan 12 baseline.

### 2. Lighthouse CI

- [ ] Добавить Lighthouse CI в GitHub Actions (если ещё нет): на PR в `main` прогонять lighthouse на 3 ключевых URL (dashboard, projects, checklist) в mobile emulation
- [ ] Blocking threshold: mobile perf ≥ 80 (жёстко — 85 после стабилизации)

### 3. Baseline до мобильного допила

- [ ] Сделать Lighthouse-прогон на mobile-emulation на `main` **до** начала новых фиксов Plan 12
- [ ] Сохранить числа в этот файл (LCP/INP/CLS/perf) как baseline
- [ ] После завершения Milestone B и D — повторный прогон, сравнить

### 4. Мониторинг 404/500 на мобильных UA

- [ ] Проверить логи: есть ли серверные ошибки, пики на User-Agent мобильных браузеров? Если да — эскалировать Backend 09.

### 5. Bundle size watch

- [ ] Проверить `.next/analyze` (или `@next/bundle-analyzer`) — не раздули ли бандл добавлением манифеста/иконок/новых компонентов
- [ ] Red flag: +100KB gzip к main bundle от Plan 12 работ

## Alerting (для после-Plan-12)

- [ ] Алёрт на регрессию LCP > 3s на p75 mobile
- [ ] Алёрт на SSE reconnect loop (если Full-stack 07 реализовал reconnect, надо убедиться что не циклит)

## Baseline numbers (заполнить после прогона)

| Page | LCP | INP | CLS | Perf |
|---|---|---|---|---|
| /dashboard | _(TBD)_ | _(TBD)_ | _(TBD)_ | _(TBD)_ |
| /projects | _(TBD)_ | _(TBD)_ | _(TBD)_ | _(TBD)_ |
| /projects/[id]/[shot]/checklist | _(TBD)_ | _(TBD)_ | _(TBD)_ | _(TBD)_ |
| /kanban | _(TBD)_ | _(TBD)_ | _(TBD)_ | _(TBD)_ |
