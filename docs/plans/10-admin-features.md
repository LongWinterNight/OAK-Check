# Plan 10 — Admin & System Features

**Статус:** ✅ Закрыт.

## Scope
Загрузка аватара, реальный статус хранилища, CSV-экспорт, дашборд-виджеты, уведомления о дедлайнах, история входов, расширенная аналитика ADMIN.

## Роли
```
Загрузить аватар:          сам пользователь
Статистика системы:        ADMIN
Экспорт данных:            PM, ADMIN
История активности:        все (своя) / ADMIN (все)
```

## Подзадачи

### 10.1 Загрузка аватара ✅
- **Где:** [app/(app)/settings/tabs/ProfileTab.tsx](../../app/(app)/settings/tabs/ProfileTab.tsx)
- Overlay-кнопка камеры на аватаре → POST /api/upload → PATCH /api/users/me { avatarUrl }. Ограничения: jpeg/png/webp, max 2MB.
- Реальное фото отображается везде где есть аватар (Sidebar, Comments, TeamTab).

### 10.2 Реальный статус хранилища ✅
- **Где:** [app/(app)/settings/tabs/SystemTab.tsx](../../app/(app)/settings/tabs/SystemTab.tsx)
- Текст изменён на `Google Drive · D:\AI\Oak3CRM\uploads`.
- Реальный размер: `prisma.renderVersion.aggregate({ _sum: { fileSize } })` → «Использовано: X ГБ».

### 10.3 Экспорт данных проекта (CSV) ✅
- **API:** `app/api/projects/[id]/export/route.ts` — GET `?format=csv`, requireRole(['PM', 'ADMIN']).
- CSV колонки: Код, Название, Статус, Исполнитель, Прогресс, Дедлайн.
- **UI:** кнопка «Экспорт CSV» в ProjectDetailClient (только PM/ADMIN).

### 10.4 Dashboard — MyDay улучшен ✅
- **Где:** [components/dashboard/MyDay.module.css](../../components/dashboard/MyDay.module.css)
- Фильтр «Сегодня / На неделе / Все», название проекта и шота в каждой строке, кнопка «Перейти к шоту», empty state.

### 10.5 Dashboard — виджет «Мои шоты» ✅
- **Где:** [components/dashboard/MyShots.module.css](../../components/dashboard/MyShots.module.css)
- Для ARTIST/QA: шоты где `assigneeId = currentUser.id`. Колонки: Шот, Проект, Статус, Прогресс, Дедлайн.

### 10.6 Уведомления о дедлайнах ✅
- **Где:** [components/dashboard/DeadlineAlert.module.css](../../components/dashboard/DeadlineAlert.module.css)
- Виджет: шоты с `dueDate <= now + 2d AND status != DONE`. Показывается если есть хотя бы один — видно PM/LEAD/ADMIN.

### 10.7 История входов в ProfileTab ✅
- Секция «Безопасность»: «Последний вход: DD MMM YYYY, HH:MM» (из `User.lastLoginAt`).

### 10.8 AdminPage — больше аналитики ✅
- **Где:** [app/(app)/admin/page.module.css](../../app/(app)/admin/page.module.css)
- График активности за 7 дней, топ активных пользователей, список BLOCKED шотов, кнопка «Экспорт всей базы».

## Итого
Закрыто. ADMIN и PM получили инструменты мониторинга и экспорта.
