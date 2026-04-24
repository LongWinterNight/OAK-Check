# Plan 08 — Checklist UX

**Статус:** ✅ Закрыт.

## Scope
UX-улучшения главного экрана: удаление и inline-редактирование пунктов/этапов, назначение исполнителя на пункт, заметки, поиск, перетаскивание.

## Роли
```
Смотреть чеклист:          все
Менять статус пункта:      все
Создавать/удалять пункты:  LEAD, ADMIN
Создавать/удалять этапы:   LEAD, ADMIN
Назначать исполнителя:     LEAD, ADMIN
```

## Подзадачи

### 8.1 Удаление пункта ✅
- **Где:** [components/checklist/ItemsList/ChecklistRow.module.css](../../components/checklist/ItemsList/ChecklistRow.module.css)
- Иконка Trash на hover (скрыта `opacity: 0` → `1`), inline-подтверждение, DELETE /api/shots/[id]/checklist/[itemId].

### 8.2 Inline редактирование названия пункта ✅
- Двойной клик → input → Enter/blur = PATCH, Esc = cancel. Только `canManage`.

### 8.3 Удаление этапа ✅
- **Где:** [components/checklist/ChaptersPanel/](../../components/checklist/ChaptersPanel/)
- Trash на hover → ConfirmDialog («все пункты будут удалены») → DELETE /api/chapters/[id] + переключение на первую оставшуюся главу.

### 8.4 Inline редактирование этапа ✅
- Двойной клик → input → PATCH /api/chapters/[id] { title }.

### 8.5 Назначение исполнителя на пункт ✅
- Кнопка `Icons.User` на hover → dropdown с аватарами → PATCH /api/shots/[id]/checklist/[itemId] { ownerId }.

### 8.6 Заметка к пункту ✅
- Клик на `Icons.Msg` → inline textarea → PATCH с `{ note }`. Доступно всем (ARTIST помечает блокеры).

### 8.7 Фильтр и поиск по пунктам ✅
- Search input + статусные таблетки (Все / TODO / WIP / DONE / BLOCKED). Фильтрация на клиенте.

### 8.8 Drag-and-drop переупорядочивания ✅
- `@dnd-kit` уже установлен. Drag handle слева (только `canManage`) → PATCH `{ order }` с optimistic update.

## Итого
Закрыто. Чеклист стал полноценным управляемым инструментом.
