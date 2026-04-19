'use client';

import { useState } from 'react';
import { Icons } from '@/components/icons';
import { Button, Segmented } from '@/components/ui';
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
  currentUserId?: string;
  onStateChange: (itemId: string, state: 'TODO' | 'WIP' | 'DONE' | 'BLOCKED') => void;
}

export default function ItemsList({ chapter, currentUserId, onStateChange }: ItemsListProps) {
  const [filter, setFilter] = useState<Filter>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filteredItems = chapter.items.filter((item) => {
    switch (filter) {
      case 'open': return item.state !== 'DONE';
      case 'mine': return item.ownerId === currentUserId;
      case 'blocked': return item.state === 'BLOCKED';
      default: return true;
    }
  });

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
          <Segmented
            options={FILTER_OPTIONS}
            value={filter}
            onChange={setFilter}
          />
          <Button variant="ghost" size="sm" icon={<Icons.Filter size={13} />}>
            Фильтр
          </Button>
        </div>
      </div>

      {/* Список */}
      <div className={styles.list} role="rowgroup">
        {filteredItems.length === 0 ? (
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

        {/* Добавить пункт */}
        <div
          className={styles.addRow}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') { /* TODO: открыть форму */ } }}
        >
          <Icons.Plus size={14} />
          <span>Новый пункт или вставить{' '}
            <span className={styles.addOak}>шаблон</span>
          </span>
        </div>
      </div>
    </div>
  );
}
