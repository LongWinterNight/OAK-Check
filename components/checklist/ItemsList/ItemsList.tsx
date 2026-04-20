'use client';

import { useState, useRef, useEffect } from 'react';
import { Icons } from '@/components/icons';
import { Button, Segmented } from '@/components/ui';
import { toast } from '@/components/ui/Toast/toastStore';
import type { ChapterWithItems, CheckItem } from '@/types';
import ChecklistRow from './ChecklistRow';
import styles from './ItemsList.module.css';

type Filter = 'all' | 'open' | 'mine' | 'blocked';

const FILTER_OPTIONS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'Все' },
  { value: 'open', label: 'Открытые' },
  { value: 'mine', label: 'Мои' },
  { value: 'blocked', label: 'Блокеры' },
];

interface ItemsListProps {
  chapter: ChapterWithItems;
  shotId: string;
  currentUserId?: string;
  onStateChange: (itemId: string, state: 'TODO' | 'WIP' | 'DONE' | 'BLOCKED') => void;
  onItemCreated?: (item: CheckItem) => void;
  canManage?: boolean;
}

export default function ItemsList({
  chapter, shotId, currentUserId, onStateChange, onItemCreated, canManage = false,
}: ItemsListProps) {
  const [filter, setFilter] = useState<Filter>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addingItem, setAddingItem] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (addingItem) inputRef.current?.focus();
  }, [addingItem]);

  const filteredItems = chapter.items.filter((item) => {
    switch (filter) {
      case 'open': return item.state !== 'DONE';
      case 'mine': return item.ownerId === currentUserId;
      case 'blocked': return item.state === 'BLOCKED';
      default: return true;
    }
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
      // stay open for quick multi-add
      inputRef.current?.focus();
    } catch {
      toast.error('Ошибка сети');
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); handleAddItem(); }
    if (e.key === 'Escape') { setAddingItem(false); setNewTitle(''); }
  };

  return (
    <div className={styles.panel}>
      {/* Тулбар */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarTop}>
          <div>
            <div className={styles.chapterTitle}>{chapter.title}</div>
            <div className={styles.chapterDesc}>{chapter.items.length} пунктов</div>
          </div>
        </div>
        <div className={styles.toolbarBottom}>
          <Segmented options={FILTER_OPTIONS} value={filter} onChange={setFilter} />
          <Button variant="ghost" size="sm" icon={<Icons.Filter size={13} />}>
            Фильтр
          </Button>
        </div>
      </div>

      {/* Список */}
      <div className={styles.list} role="rowgroup">
        {filteredItems.length === 0 && !addingItem ? (
          <div className={styles.empty}>
            <Icons.Oak size={40} color="var(--fg-subtle)" />
            <div className={styles.emptyTitle}>Нет пунктов</div>
            <div className={styles.emptyDesc}>
              {filter === 'all'
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
              onStateChange={onStateChange}
              onClick={() => setSelectedId(selectedId === item.id ? null : item.id)}
            />
          ))
        )}

        {/* Inline форма добавления */}
        {canManage && addingItem && (
          <div className={styles.addForm}>
            <Icons.Plus size={14} style={{ flexShrink: 0, color: 'var(--fg-subtle)' }} />
            <input
              ref={inputRef}
              className={styles.addInput}
              placeholder="Название пункта… Enter — сохранить, Esc — отмена"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={handleKeyDown}
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
