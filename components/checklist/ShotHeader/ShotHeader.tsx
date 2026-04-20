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
  latestVersion?: string;
  canChangeStatus?: boolean;
  canAssign?: boolean;
  assignee?: User | null;
  users?: Pick<User, 'id' | 'name'>[];
  onUploadRender?: () => void;
  onSendReview?: () => void;
  onAssign?: (assigneeId: string | null) => void;
}

export default function ShotHeader({
  shot,
  progress,
  latestVersion = 'v012',
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

  const initials = (name: string) =>
    name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className={styles.header}>
      {/* Превью шота */}
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
          <span className={styles.infoItem}>
            <Icons.Cube size={13} />
            {shot.software}
          </span>
          <span className={styles.infoItem}>
            <Icons.Image size={13} />
            {shot.resolution}
          </span>
          {shot.dueDate && (
            <span className={styles.infoItem}>
              <Icons.Calendar size={13} />
              {new Date(shot.dueDate).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' })}
            </span>
          )}
        </div>
      </div>

      {/* Исполнитель */}
      <div className={styles.assigneeBlock} ref={dropdownRef}>
        <span className={styles.assigneeLabel}>Исполнитель</span>
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
            <Icons.ChevD size={12} />
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

      {/* Прогресс + кнопки */}
      <div className={styles.right}>
        <div className={styles.progressBlock}>
          <OakRing value={progress} size={64} stroke={4} segments={4} />
          <span className={styles.progressLabel}>прогресс</span>
        </div>
        <div className={styles.actions}>
          <Button
            variant="secondary"
            size="sm"
            icon={<Icons.Upload size={14} />}
            onClick={onUploadRender}
          >
            Загрузить рендер
          </Button>
          {canChangeStatus && (
            <Button
              variant={shot.status === 'DONE' ? 'secondary' : 'primary'}
              size="sm"
              icon={<Icons.Eye size={14} />}
              onClick={onSendReview}
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
