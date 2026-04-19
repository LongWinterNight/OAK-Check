'use client';

import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
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
import styles from './KanbanBoard.module.css';

type ShotStatus = 'TODO' | 'WIP' | 'REVIEW' | 'DONE';

interface KanbanShot {
  id: string;
  title: string;
  project: string;
  stage: string;
  due: string;
  assignee: string;
  progress?: number;
  status: ShotStatus;
}

const COLUMNS: { id: ShotStatus; label: string; kind: 'neutral' | 'info' | 'wip' | 'done' }[] = [
  { id: 'TODO', label: 'Бэклог', kind: 'neutral' },
  { id: 'WIP', label: 'В работе', kind: 'info' },
  { id: 'REVIEW', label: 'На ревью', kind: 'wip' },
  { id: 'DONE', label: 'Сдано', kind: 'done' },
];

const INITIAL_SHOTS: KanbanShot[] = [
  { id: 'k1', title: 'Shot 07 · Master Bedroom', project: 'Skolkovo One', due: '24 апр', assignee: 'Артём К.', stage: 'Моделирование', status: 'TODO' },
  { id: 'k2', title: 'Shot 02 · Facade Evening', project: 'Kosmo', due: '28 апр', assignee: 'Миша П.', stage: 'Сцена', status: 'TODO' },
  { id: 'k3', title: 'Shot 04 · Lobby', project: 'Skolkovo One', due: '24 апр', assignee: 'Артём К.', stage: 'QC', progress: 78, status: 'WIP' },
  { id: 'k4', title: 'Shot 11 · Kitchen', project: 'Beregovoy 2', due: '2 мая', assignee: 'Артём К.', stage: 'Материалы', progress: 42, status: 'WIP' },
  { id: 'k5', title: 'Shot 01 · Hero Exterior', project: 'Skolkovo One', due: '22 апр', assignee: 'Миша П.', stage: 'QC', progress: 95, status: 'REVIEW' },
  { id: 'k6', title: 'Shot 03 · Living Room', project: 'Primavera', due: '12 апр', assignee: 'Артём К.', stage: 'Сдан', progress: 100, status: 'DONE' },
  { id: 'k7', title: 'Shot 05 · Bathroom', project: 'Primavera', due: '12 апр', assignee: 'Миша П.', stage: 'Сдан', progress: 100, status: 'DONE' },
];

function KanbanCard({ shot, isDragging }: { shot: KanbanShot; isDragging?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: shot.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={[styles.card, isDragging ? styles.dragging : ''].join(' ')}
    >
      <div className={styles.project}>{shot.project}</div>
      <div className={styles.shotTitle}>{shot.title}</div>
      {shot.progress !== undefined && shot.progress > 0 && (
        <ProgressBar value={shot.progress} height={4} />
      )}
      <div className={styles.cardFooter}>
        <div className={styles.cardMeta}>
          <Badge size="sm" kind="neutral">{shot.stage}</Badge>
          <span className={styles.date}>{shot.due}</span>
        </div>
        <Avatar name={shot.assignee} size={22} />
      </div>
    </div>
  );
}

export default function KanbanBoard() {
  const [shots, setShots] = useState<KanbanShot[]>(INITIAL_SHOTS);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragStart = (e: DragStartEvent) => {
    setActiveId(e.active.id as string);
  };

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    // Если дроп в колонку (не карточку)
    const targetColumn = COLUMNS.find((c) => c.id === over.id);
    if (targetColumn) {
      setShots((prev) =>
        prev.map((s) => s.id === active.id ? { ...s, status: targetColumn.id } : s)
      );

      // Синхронизируем с API
      fetch(`/api/shots/${active.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: targetColumn.id }),
      }).catch(console.error);
    }
  };

  const activeShot = shots.find((s) => s.id === activeId);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className={styles.board}>
        {COLUMNS.map((col) => {
          const colShots = shots.filter((s) => s.status === col.id);
          return (
            <div key={col.id} className={styles.column} id={col.id}>
              <div className={styles.columnHeader}>
                <div className={styles.columnTitle}>
                  <Badge kind={col.kind} size="sm" dot>{col.label}</Badge>
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--fg-subtle)' }}>
                    {colShots.length}
                  </span>
                </div>
                <Button variant="ghost" size="sm" icon={<Icons.Plus size={13} />} aria-label="Добавить шот" />
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
            <div className={styles.project}>{activeShot.project}</div>
            <div className={styles.shotTitle}>{activeShot.title}</div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
