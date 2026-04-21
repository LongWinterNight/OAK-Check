'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Icons } from '@/components/icons';
import { Badge, Button, Avatar, ProgressBar } from '@/components/ui';
import { toast } from '@/components/ui/Toast/toastStore';
import styles from './KanbanBoard.module.css';

type ShotStatus = 'TODO' | 'WIP' | 'REVIEW' | 'DONE';

export interface KanbanShot {
  id: string;
  code: string;
  title: string;
  projectId: string;
  projectTitle: string;
  ownerName: string | null;
  dueDate: string | null;
  progress: number;
  status: ShotStatus;
}

const COLUMNS: { id: ShotStatus; label: string; kind: 'neutral' | 'info' | 'wip' | 'done' }[] = [
  { id: 'TODO', label: 'Бэклог', kind: 'neutral' },
  { id: 'WIP', label: 'В работе', kind: 'info' },
  { id: 'REVIEW', label: 'На ревью', kind: 'wip' },
  { id: 'DONE', label: 'Сдано', kind: 'done' },
];

function KanbanCard({ shot, isDragging }: { shot: KanbanShot; isDragging?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: shot.id });

  const due = shot.dueDate
    ? new Date(shot.dueDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
    : null;

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      className={[styles.card, isDragging ? styles.dragging : ''].join(' ')}
    >
      <div className={styles.project}>{shot.projectTitle}</div>
      <div className={styles.shotTitle}>{shot.title}</div>
      {shot.progress > 0 && <ProgressBar value={shot.progress} height={4} />}
      <div className={styles.cardFooter}>
        <div className={styles.cardMeta}>
          <Badge size="sm" kind="neutral">{shot.code}</Badge>
          {due && <span className={styles.date}>{due}</span>}
        </div>
        <div className={styles.cardActions}>
          {shot.ownerName && <Avatar name={shot.ownerName} size={22} />}
          <Link
            href={`/projects/${shot.projectId}/${shot.id}/checklist`}
            className={styles.checklistLink}
            onClick={(e) => e.stopPropagation()}
            title="Открыть чек-лист"
          >
            <Icons.List size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function KanbanBoard({ initialShots }: { initialShots: KanbanShot[] }) {
  const [shots, setShots] = useState<KanbanShot[]>(initialShots);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [projectFilter, setProjectFilter] = useState<string>('');

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const projects = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of initialShots) map.set(s.projectId, s.projectTitle);
    return Array.from(map.entries()).map(([id, title]) => ({ id, title }));
  }, [initialShots]);

  const visibleShots = projectFilter
    ? shots.filter((s) => s.projectId === projectFilter)
    : shots;

  const handleDragStart = (e: DragStartEvent) => setActiveId(e.active.id as string);

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    setActiveId(null);
    if (!over || active.id === over.id) return;

    const targetColumn = COLUMNS.find((c) => c.id === over.id);
    if (!targetColumn) return;

    const prevShots = shots;
    setShots((prev) => prev.map((s) => s.id === active.id ? { ...s, status: targetColumn.id } : s));

    fetch(`/api/shots/${active.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: targetColumn.id }),
    }).then((res) => {
      if (!res.ok) throw new Error();
    }).catch(() => {
      toast.error('Не удалось обновить статус');
      setShots(prevShots);
    });
  };

  const activeShot = shots.find((s) => s.id === activeId);

  return (
    <div>
      {projects.length > 1 && (
        <div className={styles.filters}>
          <button
            className={[styles.filterBtn, !projectFilter ? styles.filterActive : ''].join(' ')}
            onClick={() => setProjectFilter('')}
          >
            Все проекты
          </button>
          {projects.map((p) => (
            <button
              key={p.id}
              className={[styles.filterBtn, projectFilter === p.id ? styles.filterActive : ''].join(' ')}
              onClick={() => setProjectFilter(p.id)}
            >
              {p.title}
            </button>
          ))}
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className={styles.board}>
          {COLUMNS.map((col) => {
            const colShots = visibleShots.filter((s) => s.status === col.id);
            return (
              <div key={col.id} className={styles.column} id={col.id}>
                <div className={styles.columnHeader}>
                  <div className={styles.columnTitle}>
                    <Badge kind={col.kind} size="sm" dot>{col.label}</Badge>
                    <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--fg-subtle)' }}>
                      {colShots.length}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" icon={<Icons.Plus size={13} />} aria-label="Добавить" />
                </div>

                <div className={styles.columnCards}>
                  <SortableContext items={colShots.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                    {colShots.map((shot) => (
                      <KanbanCard key={shot.id} shot={shot} isDragging={shot.id === activeId} />
                    ))}
                  </SortableContext>
                  {colShots.length === 0 && (
                    <div className={[styles.card, styles.drop].join(' ')} style={{ minHeight: 60 }} />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <DragOverlay>
          {activeShot && (
            <div className={[styles.card, styles.dragging].join(' ')}>
              <div className={styles.project}>{activeShot.projectTitle}</div>
              <div className={styles.shotTitle}>{activeShot.title}</div>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
