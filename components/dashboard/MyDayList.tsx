'use client';

import { useState } from 'react';
import Link from 'next/link';
import Check3, { type ItemState } from '@/components/ui/Check3/Check3';
import styles from './MyDay.module.css';

export interface MyDayItem {
  id: string;
  title: string;
  state: ItemState | 'blocked';
  shotId: string;
  shotCode: string;
  projectTitle: string;
  projectId: string;
}

interface MyDayListProps {
  items: MyDayItem[];
}

export function MyDayList({ items }: MyDayListProps) {
  const [states, setStates] = useState<Record<string, ItemState | 'blocked'>>(
    Object.fromEntries(items.map((i) => [i.id, i.state]))
  );

  const openCount = items.filter((i) => states[i.id] !== 'done').length;

  const toggle = async (item: MyDayItem, next: ItemState) => {
    setStates((prev) => ({ ...prev, [item.id]: next }));
    const stateMap: Record<string, string> = { todo: 'TODO', wip: 'WIP', done: 'DONE', blocked: 'BLOCKED' };
    try {
      await fetch(`/api/shots/${item.shotId}/checklist/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: stateMap[next] }),
      });
    } catch {
      setStates((prev) => ({ ...prev, [item.id]: item.state }));
    }
  };

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        Нет активных задач — отличный день!
      </div>
    );
  }

  return (
    <>
      <div className={styles.header}>
        <span className={styles.title}>Мой день</span>
        <span className={styles.count}>{openCount} задач</span>
      </div>
      <div className={styles.list}>
        {items.map((item) => (
          <div key={item.id} className={styles.item}>
            <Check3
              state={states[item.id] === 'blocked' ? 'todo' : states[item.id] as ItemState}
              onChange={(next) => toggle(item, next)}
              size={16}
            />
            <div className={styles.info}>
              <Link
                href={`/projects/${item.projectId}/${item.shotId}/checklist`}
                className={[styles.taskTitle, states[item.id] === 'done' ? styles.done : ''].join(' ')}
              >
                {item.title}
              </Link>
              <div className={styles.project}>{item.projectTitle} · {item.shotCode}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
