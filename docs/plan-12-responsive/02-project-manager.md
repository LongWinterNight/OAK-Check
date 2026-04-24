# 02 — Project Manager / Scrum Master

## Вехи Plan 12 допила

### Milestone A — Foundation (архитектура + дизайн-ревизия)
- **Владельцы:** Architect (04), Designer (05)
- **Выход:** breakpoint-токены в CSS, ревизованный spacing-набор, спецификация touch-targets
- **Длительность:** 1 итерация

### Milestone B — Frontend core (ARTIST flow)
- **Владельцы:** Frontend (06), Mobile (08)
- **Зависит от:** A
- **Выход:** чеклист + комментарии + рендер + upload полностью работают с мобилы
- **Длительность:** 2–3 итерации

### Milestone C — Frontend tablet (LEAD/QA/PM)
- **Владельцы:** Frontend (06)
- **Зависит от:** A
- **Выход:** kanban-touch, review, dashboard-widgets, projects-inner, NewProjectModal
- **Длительность:** 2 итерации

### Milestone D — PWA & mobile polish
- **Владельцы:** Mobile (08), DevSecOps (14)
- **Зависит от:** B
- **Выход:** manifest, safe-area, viewport meta, installable, CSP headers
- **Длительность:** 1 итерация

### Milestone E — QA & Monitoring
- **Владельцы:** QA Automation (12), Manual QA (13), SRE (10)
- **Зависит от:** B, C, D
- **Выход:** Playwright responsive suite зелёный, пройдена device matrix, CWV метрики заведены
- **Длительность:** 1–2 итерации

## Граф зависимостей

```
A (foundation)
  ├─→ B (ARTIST mobile) ──┐
  │                        ├─→ E (QA + monitoring)
  └─→ C (LEAD/QA tablet) ──┤
                           │
D (PWA) ───────────────────┘
```

## Definition of Done (на задачу)

- [ ] Код покрывает 3 брейкпоинта, проверено в DevTools
- [ ] Никакого горизонтального скролла на 360/768/1024
- [ ] Все интерактивные элементы ≥ 44×44 px на мобиле
- [ ] Нет регрессий десктопа (визуальная проверка + существующие тесты)
- [ ] Коммит + push в `main` (см. feedback memory)
- [ ] Отметка `[x]` в файле соответствующей роли

## Definition of Done (на milestone)

- [ ] Все задачи milestone закрыты
- [ ] Manual QA прошёл device matrix для затронутых экранов
- [ ] Обновлён «Общий статус» в [README](./README.md)

## Задачи Scrum Master

- [ ] Вести «Общий статус» в README актуальным
- [ ] Следить за зависимостями — не пускать B/C без закрытого A
- [ ] Эскалировать блокеры: если Frontend упирается в отсутствующий дизайн-токен — возвращать в Milestone A
