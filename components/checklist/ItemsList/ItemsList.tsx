'use client';

import { useState, useRef, useEffect } from 'react';
import { Icons } from '@/components/icons';
import { Button, Segmented } from '@/components/ui';
import { toast } from '@/components/ui/Toast/toastStore';
import type { ChapterWithItems, CheckItem, User } from '@/types';
import ChecklistRow from './ChecklistRow';
import styles from './ItemsList.module.css';

type Filter = 'all' | 'open' | 'mine' | 'blocked';

const FILTER_OPTIONS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'Все' },
  { value: 'open', label: 'Открытые' },
  { value: 'mine', label: 'Мои' },
  { value: 'blocked', label: 'На стопе' },
];

interface ItemsListProps {
  chapter: ChapterWithItems;
  shotId: string;
  currentUserId?: string;
  users?: Pick<User, 'id' | 'name'>[];
  onStateChange: (itemId: string, state: 'TODO' | 'WIP' | 'DONE' | 'BLOCKED') => void;
  onItemCreated?: (item: CheckItem) => void;
  onItemDeleted?: (itemId: string, chapterId: string) => void;
  onItemRenamed?: (itemId: string, title: string) => void;
  onNoteChanged?: (itemId: string, note: string | null) => void;
  onItemAssigned?: (itemId: string, ownerId: string | null, user: Pick<User, 'id' | 'name'> | null) => void;
  onItemFlagged?: (itemId: string, blocked: boolean, note: string | null) => void;
  canManage?: boolean;
  className?: string;
}

export default function ItemsList({
  chapter, shotId, currentUserId, users = [], onStateChange,
  onItemCreated, onItemDeleted, onItemRenamed, onNoteChanged, onItemAssigned, onItemFlagged,
  canManage = false, className,
}: ItemsListProps) {
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addingItem, setAddingItem] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (addingItem) inputRef.current?.focus();
  }, [addingItem]);

  // Keyboard shortcut: '/' to focus search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && e.target === document.body) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const filteredItems = chapter.items.filter((item) => {
    const matchesFilter = (() => {
      switch (filter) {
        case 'open': return item.state !== 'DONE';
        case 'mine': return item.ownerId === currentUserId;
        case 'blocked': return item.state === 'BLOCKED';
        default: return true;
      }
    })();
    const matchesSearch = !search || item.title.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleAddItem = async () => {
    const title = newTitle.trim();
    if (!title) { setAddingItem(false); return; }
    setSaving(true);
    try {
      const res = await fetch(`/api/shots/${shotId}/checklist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapterId: chapter.id, title }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        toast.error(d.error ?? 'Не удалось добавить пункт');
        return;
      }
      const item = await res.json();
      onItemCreated?.(item);
      setNewTitle('');
      inputRef.current?.focus();
    } catch {
      toast.error('Ошибка сети');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    try {
      const res = await fetch(`/api/shots/${shotId}/checklist/${itemId}`, { method: 'DELETE' });
      if (res.ok) {
        onItemDeleted?.(itemId, chapter.id);
      } else {
        toast.error('Не удалось удалить пункт');
      }
    } catch {
      toast.error('Ошибка сети');
    }
  };

  const handleRename = async (itemId: string, title: string) => {
    try {
      const res = await fetch(`/api/shots/${shotId}/checklist/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      if (res.ok) {
        onItemRenamed?.(itemId, title);
      } else {
        toast.error('Не удалось переименовать пункт');
      }
    } catch {
      toast.error('Ошибка сети');
    }
  };

  const handleNoteChange = async (itemId: string, note: string | null) => {
    try {
      const res = await fetch(`/api/shots/${shotId}/checklist/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note }),
      });
      if (res.ok) {
        onNoteChanged?.(itemId, note);
      } else {
        toast.error('Не удалось сохранить заметку');
      }
    } catch {
      toast.error('Ошибка сети');
    }
  };

  const handleFlag = async (itemId: string, blocked: boolean, reason?: string) => {
    // Поставить на стоп → state=BLOCKED + note (причина обязательна на сервере)
    // Снять стоп → state=TODO (note сохраняется как есть)
    const body: Record<string, unknown> = blocked
      ? { state: 'BLOCKED', ...(reason ? { note: reason } : {}) }
      : { state: 'TODO' };
    try {
      const res = await fetch(`/api/shots/${shotId}/checklist/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const updated = await res.json();
        onItemFlagged?.(itemId, blocked, updated.note ?? null);
      } else {
        const d = await res.json().catch(() => ({}));
        toast.error(d.message ?? d.error ?? 'Не удалось изменить статус');
      }
    } catch {
      toast.error('Ошибка сети');
    }
  };

  const handleAssign = async (itemId: string, ownerId: string | null) => {
    try {
      const res = await fetch(`/api/shots/${shotId}/checklist/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownerId }),
      });
      if (res.ok) {
        const user = ownerId ? (users.find(u => u.id === ownerId) ?? null) : null;
        onItemAssigned?.(itemId, ownerId, user);
      } else {
        toast.error('Не удалось назначить исполнителя');
      }
    } catch {
      toast.error('Ошибка сети');
    }
  };

  return (
    <div className={[styles.panel, className ?? ''].join(' ')}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarTop}>
          <div>
            <div className={styles.chapterTitle}>{chapter.title}</div>
            <div className={styles.chapterDesc}>{chapter.items.length} пунктов</div>
          </div>
        </div>
        <div className={styles.toolbarBottom}>
          <Segmented options={FILTER_OPTIONS} value={filter} onChange={setFilter} />
          <div className={styles.searchWrap}>
            <Icons.Search size={13} style={{ color: 'var(--fg-subtle)', flexShrink: 0 }} />
            <input
              ref={searchRef}
              className={styles.searchInput}
              placeholder="Поиск… (/)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Escape') { setSearch(''); searchRef.current?.blur(); } }}
            />
            {search && (
              <button className={styles.searchClear} onClick={() => setSearch('')} title="Очистить">
                <Icons.X size={11} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* List */}
      <div className={styles.list} role="rowgroup">
        {filteredItems.length === 0 && !addingItem ? (
          <div className={styles.empty}>
            <Icons.Oak size={40} color="var(--fg-subtle)" />
            <div className={styles.emptyTitle}>Нет пунктов</div>
            <div className={styles.emptyDesc}>
              {search
                ? `По запросу «${search}» ничего не найдено.`
                : filter === 'all'
                  ? 'Добавьте пункт или примените шаблон.'
                  : 'Нет пунктов по выбранному фильтру.'}
            </div>
          </div>
        ) : (
          filteredItems.map((item) => (
            <ChecklistRow
              key={item.id}
              item={item}
              owner={item.owner}
              selected={selectedId === item.id}
              canManage={canManage}
              users={users}
              onStateChange={onStateChange}
              onDelete={handleDelete}
              onRename={handleRename}
              onNoteChange={handleNoteChange}
              onAssign={handleAssign}
              onFlag={handleFlag}
              onClick={() => setSelectedId(selectedId === item.id ? null : item.id)}
            />
          ))
        )}

        {/* Inline add form */}
        {canManage && addingItem && (
          <div className={styles.addForm}>
            <Icons.Plus size={14} style={{ flexShrink: 0, color: 'var(--fg-subtle)' }} />
            <input
              ref={inputRef}
              className={styles.addInput}
              placeholder="Название пункта… Enter — сохранить, Esc — отмена"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); handleAddItem(); }
                if (e.key === 'Escape') { setAddingItem(false); setNewTitle(''); }
              }}
              onBlur={() => { if (!newTitle.trim()) setAddingItem(false); }}
              disabled={saving}
            />
            {saving && <span style={{ fontSize: 11, color: 'var(--fg-subtle)' }}>…</span>}
          </div>
        )}

        {canManage && !addingItem && (
          <div
            className={styles.addRow}
            role="button"
            tabIndex={0}
            onClick={() => setAddingItem(true)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setAddingItem(true); }}
          >
            <Icons.Plus size={14} />
            <span>Новый пункт или вставить{' '}
              <span className={styles.addOak}>шаблон</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
