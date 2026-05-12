'use client';

import { useState, useRef, useEffect } from 'react';
import { Icons } from '@/components/icons';
import { Badge, Button, OakRing } from '@/components/ui';
import type { Shot, User } from '@/types';
import { shotStatusBadgeKind, shotStatusLabel } from '@/lib/utils';
import styles from './ShotHeader.module.css';

interface ShotHeaderProps {
  shot: Shot;
  progress: number;
  itemsDone?: number;
  itemsTotal?: number;
  latestVersion?: string;
  canChangeStatus?: boolean;
  canAssign?: boolean;
  assignee?: User | null;
  users?: Pick<User, 'id' | 'name'>[];
  onUploadRender?: () => void;
  onSendReview?: () => void;
  onAssign?: (assigneeId: string | null) => void;
}

const initials = (name: string) =>
  name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

export default function ShotHeader({
  shot,
  progress,
  itemsDone = 0,
  itemsTotal = 0,
  latestVersion = '—',
  canChangeStatus = false,
  canAssign = false,
  assignee,
  users = [],
  onUploadRender,
  onSendReview,
  onAssign,
}: ShotHeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [dropdownOpen]);

  const handleSelect = (id: string | null) => {
    setDropdownOpen(false);
    onAssign?.(id);
  };

  const dueLabel = shot.dueDate
    ? new Date(shot.dueDate).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' })
    : null;

  return (
    <div className={styles.header}>
      {/* Превью шота — большой квадрат с версией */}
      <div className={styles.thumb}>
        <div
          className={styles.thumbPlaceholder}
          style={{ background: 'linear-gradient(135deg, #3a5a7a, #1a2a3a)' }}
        />
        <span className={styles.versionBadge}>{latestVersion} · IPR</span>
      </div>

      {/* Метаданные */}
      <div className={styles.meta}>
        <div className={styles.codeRow}>
          <span className={styles.code}>{shot.code}</span>
          <Badge kind={shotStatusBadgeKind(shot.status)} size="sm" dot>
            {shotStatusLabel(shot.status)}
          </Badge>
        </div>
        <h1 className={styles.title}>{shot.title}</h1>
        <div className={styles.infoRow}>
          {dueLabel && (
            <span className={styles.infoItem}>
              <Icons.Calendar size={13} />
              {dueLabel}
            </span>
          )}
          <span className={styles.infoItem}>
            <Icons.Cube size={13} />
            {shot.software}
          </span>
          <span className={styles.infoItem}>
            <Icons.Image size={13} />
            {shot.resolution}
          </span>

          {/* Исполнитель — инлайн с иконкой/именем */}
          <div className={styles.assigneeBlock} ref={dropdownRef}>
            {canAssign ? (
              <button
                className={styles.assigneeBtn}
                onClick={() => setDropdownOpen((v) => !v)}
                title="Назначить исполнителя"
              >
                {assignee ? (
                  <>
                    <span className={styles.avatar}>{initials(assignee.name)}</span>
                    <span className={styles.assigneeName}>{assignee.name}</span>
                  </>
                ) : (
                  <>
                    <span className={`${styles.avatar} ${styles.avatarEmpty}`}>—</span>
                    <span className={styles.assigneeMuted}>Не назначен</span>
                  </>
                )}
                <Icons.ChevD size={11} />
              </button>
            ) : (
              <div className={styles.assigneeStatic}>
                {assignee ? (
                  <>
                    <span className={styles.avatar}>{initials(assignee.name)}</span>
                    <span className={styles.assigneeName}>{assignee.name}</span>
                  </>
                ) : (
                  <span className={styles.assigneeMuted}>Не назначен</span>
                )}
              </div>
            )}

            {dropdownOpen && (
              <div className={styles.dropdown}>
                <button className={styles.dropdownItem} onClick={() => handleSelect(null)}>
                  <span className={`${styles.avatar} ${styles.avatarEmpty}`}>—</span>
                  Снять назначение
                </button>
                {users.map((u) => (
                  <button
                    key={u.id}
                    className={`${styles.dropdownItem} ${shot.assigneeId === u.id ? styles.dropdownItemActive : ''}`}
                    onClick={() => handleSelect(u.id)}
                  >
                    <span className={styles.avatar}>{initials(u.name)}</span>
                    {u.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Правая часть — большой OakRing + кнопки */}
      <div className={styles.right}>
        <div className={styles.progressBlock}>
          <OakRing value={progress} size={88} stroke={5} segments={4} />
          <div className={styles.progressLabels}>
            <span className={styles.progressTitle}>Готовность</span>
            {itemsTotal > 0 && (
              <span className={styles.progressCount}>
                {itemsDone} из {itemsTotal} пунктов
              </span>
            )}
          </div>
        </div>
        <div className={styles.actions}>
          <Button
            variant="secondary"
            size="sm"
            icon={<Icons.Upload size={14} />}
            onClick={onUploadRender}
            fullWidth
          >
            Загрузить рендер
          </Button>
          {canChangeStatus && (
            <Button
              variant={shot.status === 'DONE' ? 'secondary' : 'primary'}
              size="sm"
              icon={<Icons.Eye size={14} />}
              onClick={onSendReview}
              fullWidth
            >
              {shot.status === 'TODO' && 'В работу'}
              {shot.status === 'WIP' && 'На ревью'}
              {shot.status === 'REVIEW' && 'Принять'}
              {shot.status === 'DONE' && 'Вернуть'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
