# Plans — история и активный план

Индекс всех планов разработки OAK·Check. Планы 01–11 закрыты (реализованы), 12 — активный.

## Статус

| # | Название | Статус | Файл |
|---|---|---|---|
| 01 | Auth & Security | ✅ Закрыт | [01-auth-security.md](./01-auth-security.md) |
| 02 | Database | ✅ Закрыт (кроме soft-delete) | [02-database.md](./02-database.md) |
| 03 | API Design | ✅ Закрыт | [03-api-design.md](./03-api-design.md) |
| 04 | Core Backend | ✅ Закрыт | [04-backend.md](./04-backend.md) |
| 05 | Integration & Webhooks | ◐ Частично (webhook отложен) | [05-integration.md](./05-integration.md) |
| 06 | Software Architecture | ◐ Частично (service layer, тесты отложены) | [06-architecture.md](./06-architecture.md) |
| 07 | Critical Fixes | ✅ Закрыт | [07-critical-fixes.md](./07-critical-fixes.md) |
| 08 | Checklist UX | ✅ Закрыт | [08-checklist-ux.md](./08-checklist-ux.md) |
| 09 | Media & Comments | ✅ Закрыт | [09-media-comments.md](./09-media-comments.md) |
| 10 | Admin & System Features | ✅ Закрыт | [10-admin-features.md](./10-admin-features.md) |
| 11 | Performance & Scalability | ✅ Закрыт (22.04.2026) | [11-performance.md](./11-performance.md) |
| 12 | Responsive (mobile/tablet) | 🔄 **Активный** | [../plan-12-responsive/](../plan-12-responsive/) |

## Легенда

- ✅ Закрыт — все критичные подзадачи реализованы
- ◐ Частично — основное сделано, часть отложена осознанно
- 🔄 Активный — в работе
- ⏳ Отложено — не начато, в бэклоге

## Как читать план

Каждый файл содержит:
- **Scope** — что покрывает план
- **Подзадачи со статусом** — чек-лист `[x]/[ ]` с файлами и описанием
- **Порядок выполнения** — если есть зависимости
- **Ссылки на код** — где были изменения

## Исторические источники

Эти мирроры сделаны из личной AI-памяти пользователя (`C:\Users\safan\.claude\projects\d--AI-Oak3CRM\memory\plan_*.md`). В репо они попадают как артефакт для коллабораторов. Оригиналы в memory остаются как point-in-time наблюдения для AI-ассистента.

## Правила для новых планов

1. Создавать файл `docs/plans/NN-slug.md` или папку `docs/plan-NN-slug/` (для крупных, как plan-12)
2. Добавлять в таблицу выше с актуальным статусом
3. После завершения — помечать ✅, кратко дописывать «Итого» снизу в файле
4. Большие пересекающиеся изменения системы — отдельный план

## Связь с dev-ролями

План 12 впервые введён с разбивкой по 16 dev-ролям — эта схема может применяться для следующих крупных планов. См. [../plan-12-responsive/README.md](../plan-12-responsive/README.md).
