'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Icons } from '@/components/icons';
import { Avatar } from '@/components/ui';
import styles from './ActivityFeedInfinite.module.css';

type ActivityType =
  | 'ITEM_STATE_CHANGED'
  | 'ITEM_CREATED'
  | 'COMMENT_ADDED'
  | 'VERSION_UPLOADED'
  | 'SHOT_STATUS_CHANGED'
  | 'MEMBER_ADDED';

interface ActivityEntry {
  id: string;
  type: ActivityType;
  message: string;
  createdAt: string;
  user: { id: string; name: string; avatarUrl?: string | null } | null;
  shot: { id: string; code: string; title: string } | null;
}

const TYPE_ICON: Record<ActivityType, React.ReactNode> = {
  ITEM_STATE_CHANGED: <Icons.Check size={13} />,
  ITEM_CREATED: <Icons.Plus size={13} />,
  COMMENT_ADDED: <Icons.MessageSquare size={13} />,
  VERSION_UPLOADED: <Icons.Upload size={13} />,
  SHOT_STATUS_CHANGED: <Icons.ChevR size={13} />,
  MEMBER_ADDED: <Icons.Users size={13} />,
};

const TYPE_FILTERS: { value: ActivityType | ''; label: string }[] = [
  { value: '', label: 'Все' },
  { value: 'ITEM_STATE_CHANGED', label: 'Чеклист' },
  { value: 'SHOT_STATUS_CHANGED', label: 'Статус шота' },
  { value: 'COMMENT_ADDED', label: 'Комментарии' },
  { value: 'VERSION_UPLOADED', label: 'Рендеры' },
  { value: 'MEMBER_ADDED', label: 'Команда' },
];

function ActivityRow({ entry }: { entry: ActivityEntry }) {
  const date = new Date(entry.createdAt);
  const timeStr = date.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' });
  const dateStr = date.toLocaleDateString('ru', { day: 'numeric', month: 'short' });

  return (
    <div className={styles.row}>
      <div className={styles.icon}>{TYPE_ICON[entry.type] ?? <Icons.Bell size={13} />}</div>
      <div className={styles.body}>
        <div className={styles.message}>
          {entry.user && (
            <span className={styles.userName}>
              <Avatar name={entry.user.name} size={18} />
              {entry.user.name}
            </span>
          )}
          <span>{entry.message}</span>
          {entry.shot && (
            <span className={styles.shotRef}>{entry.shot.code}</span>
          )}
        </div>
        <div className={styles.time}>{dateStr}, {timeStr}</div>
      </div>
    </div>
  );
}

function groupByDate(entries: ActivityEntry[]): { date: string; items: ActivityEntry[] }[] {
  const groups: Map<string, ActivityEntry[]> = new Map();
  for (const entry of entries) {
    const key = new Date(entry.createdAt).toLocaleDateString('ru', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(entry);
  }
  return Array.from(groups.entries()).map(([date, items]) => ({ date, items }));
}

export function ActivityFeedInfinite() {
  const [entries, setEntries] = useState<ActivityEntry[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState<ActivityType | ''>('');
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadPage = useCallback(async (p: number, type: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: '20' });
      if (type) params.set('type', type);
      const res = await fetch(`/api/activity?${params}`);
      const json = await res.json();
      setEntries((prev) => (p === 1 ? json.data : [...prev, ...json.data]));
      setHasMore(json.hasMore);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setEntries([]);
    setPage(1);
    setHasMore(true);
    loadPage(1, typeFilter);
  }, [typeFilter, loadPage]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          setPage((p) => {
            const next = p + 1;
            loadPage(next, typeFilter);
            return next;
          });
        }
      },
      { rootMargin: '80px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, loadPage, typeFilter]);

  const groups = groupByDate(entries);

  return (
    <div>
      <div className={styles.toolbar}>
        {TYPE_FILTERS.map((f) => (
          <button
            key={f.value}
            className={[styles.filterBtn, typeFilter === f.value ? styles.filterActive : ''].join(' ')}
            onClick={() => setTypeFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {!loading && entries.length === 0 ? (
        <div className={styles.empty}>
          <Icons.Oak size={32} color="var(--fg-subtle)" />
          <span>Нет активности</span>
        </div>
      ) : (
        <div className={styles.feed}>
          {groups.map((group) => (
            <div key={group.date} className={styles.group}>
              <div className={styles.groupDate}>{group.date}</div>
              <div className={styles.groupItems}>
                {group.items.map((entry) => (
                  <ActivityRow key={entry.id} entry={entry} />
                ))}
              </div>
            </div>
          ))}

          {loading && (
            <div className={styles.loader}>
              <span className={styles.spin} />
            </div>
          )}

          <div ref={sentinelRef} style={{ height: 1 }} />
        </div>
      )}
    </div>
  );
}
