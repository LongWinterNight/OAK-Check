'use client';

import { useRef, useState } from 'react';
import { Icons } from '@/components/icons';
import { Check3, Avatar, Badge } from '@/components/ui';
import type { ItemState as Check3State } from '@/components/ui/Check3/Check3';
import type { CheckItem, User } from '@/types';
import { dbStateToCheck3, check3ToDbState } from '@/lib/utils';
import styles from './ChecklistRow.module.css';

interface ChecklistRowProps {
  item: CheckItem;
  owner?: User | null;
  selected?: boolean;
  canManage?: boolean;
  users?: Pick<User, 'id' | 'name'>[];
  onStateChange: (itemId: string, state: 'TODO' | 'WIP' | 'DONE' | 'BLOCKED') => void;
  onDelete?: (itemId: string) => void;
  onRename?: (itemId: string, title: string) => void;
  onNoteChange?: (itemId: string, note: string | null) => void;
  onAssign?: (itemId: string, ownerId: string | null) => void;
  onFlag?: (itemId: string, blocked: boolean, reason?: string) => void;
  onClick?: () => void;
}

export default function ChecklistRow({
  item, owner, selected, canManage, users = [],
  onStateChange, onDelete, onRename, onNoteChange, onAssign, onFlag, onClick,
}: ChecklistRowProps) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(item.title);
  const [editingNote, setEditingNote] = useState(false);
  const [noteDraft, setNoteDraft] = useState(item.note ?? '');
  const [flaggingReason, setFlaggingReason] = useState<string | null>(null); // null = форма закрыта; string = открыта с черновиком
  const [showAssign, setShowAssign] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const noteInputRef = useRef<HTMLTextAreaElement>(null);
  const flagInputRef = useRef<HTMLTextAreaElement>(null);

  const check3State = dbStateToCheck3(item.state);
  const isBlocked = item.state === 'BLOCKED';
  const isDone = item.state === 'DONE';

  const handleChange = (next: Check3State) => {
    // Снимаем стоп если был, и переключаем по обычному циклу
    onStateChange(item.id, check3ToDbState(next));
  };

  const commitTitle = () => {
    const trimmed = titleDraft.trim();
    if (trimmed && trimmed !== item.title) {
      onRename?.(item.id, trimmed);
    } else {
      setTitleDraft(item.title);
    }
    setEditingTitle(false);
  };

  const commitNote = () => {
    const val = noteDraft.trim() || null;
    onNoteChange?.(item.id, val);
    setEditingNote(false);
  };

  const startFlagging = () => {
    if (isBlocked) {
      // Снять стоп
      onFlag?.(item.id, false);
      return;
    }
    // Поставить на стоп — если есть причина в note, сразу применяем
    if (item.note && item.note.trim()) {
      onFlag?.(item.id, true);
      return;
    }
    // Иначе открываем форму причины
    setFlaggingReason('');
    requestAnimationFrame(() => flagInputRef.current?.focus());
  };

  const commitFlag = () => {
    const reason = (flaggingReason ?? '').trim();
    if (!reason) {
      setFlaggingReason(null);
      return;
    }
    onFlag?.(item.id, true, reason);
    setFlaggingReason(null);
  };

  return (
    <div
      className={[styles.row, selected ? styles.selected : '', isBlocked ? styles.rowBlocked : ''].join(' ')}
      onClick={!editingTitle && !editingNote && flaggingReason === null ? onClick : undefined}
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' && !editingTitle && !editingNote && flaggingReason === null) onClick?.(); }}
      role="row"
      aria-selected={selected}
    >
      {/* 3-state checkbox */}
      <Check3 state={check3State} onChange={handleChange} size={16} disabled={isBlocked} />

      {/* Content */}
      <div className={styles.content}>
        {editingTitle ? (
          <input
            ref={titleInputRef}
            className={styles.titleInput}
            value={titleDraft}
            autoFocus
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); commitTitle(); }
              if (e.key === 'Escape') { setTitleDraft(item.title); setEditingTitle(false); }
            }}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <div
            className={[styles.title, isDone ? styles.titleDone : ''].join(' ')}
            onDoubleClick={canManage ? (e) => { e.stopPropagation(); setEditingTitle(true); } : undefined}
          >
            {item.title}
          </div>
        )}

        {editingNote ? (
          <textarea
            ref={noteInputRef}
            className={styles.noteInput}
            value={noteDraft}
            autoFocus
            rows={2}
            placeholder="Добавьте заметку…"
            onChange={(e) => setNoteDraft(e.target.value)}
            onBlur={commitNote}
            onKeyDown={(e) => {
              if (e.key === 'Escape') { setNoteDraft(item.note ?? ''); setEditingNote(false); }
              if (e.key === 'Enter' && e.ctrlKey) { e.preventDefault(); commitNote(); }
            }}
            onClick={(e) => e.stopPropagation()}
          />
        ) : item.note ? (
          <div
            className={[styles.note, isBlocked ? styles.noteBlocked : ''].join(' ')}
            onDoubleClick={(e) => { e.stopPropagation(); setNoteDraft(item.note ?? ''); setEditingNote(true); }}
          >
            <Icons.Msg size={11} />
            {item.note}
          </div>
        ) : null}

        {/* Inline-форма причины стопа */}
        {flaggingReason !== null && (
          <textarea
            ref={flagInputRef}
            className={styles.flagInput}
            value={flaggingReason}
            rows={2}
            placeholder="Что мешает? Например: жду референс, не работает плагин…"
            onChange={(e) => setFlaggingReason(e.target.value)}
            onBlur={() => { if (!flaggingReason?.trim()) setFlaggingReason(null); }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') { setFlaggingReason(null); }
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commitFlag(); }
            }}
            onClick={(e) => e.stopPropagation()}
          />
        )}
      </div>

      {/* Right side */}
      <div className={styles.right} onClick={(e) => e.stopPropagation()}>
        {isBlocked && <Badge kind="blocked" size="sm">Стоп</Badge>}

        {/* Assign dropdown */}
        {canManage && (
          <div style={{ position: 'relative' }}>
            {owner ? (
              <button
                className={styles.actionBtn}
                title="Назначен: изменить"
                onClick={() => setShowAssign((v) => !v)}
              >
                <Avatar name={owner.name} src={owner.avatarUrl} size={22} />
              </button>
            ) : (
              <button
                className={[styles.actionBtn, styles.assignBtn].join(' ')}
                title="Назначить исполнителя"
                onClick={() => setShowAssign((v) => !v)}
              >
                <Icons.User size={12} />
              </button>
            )}
            {showAssign && (
              <div className={styles.dropdown}>
                <button
                  className={styles.dropItem}
                  onClick={() => { onAssign?.(item.id, null); setShowAssign(false); }}
                >
                  — Не назначен
                </button>
                {users.map((u) => (
                  <button
                    key={u.id}
                    className={[styles.dropItem, item.ownerId === u.id ? styles.dropActive : ''].join(' ')}
                    onClick={() => { onAssign?.(item.id, u.id); setShowAssign(false); }}
                  >
                    {u.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {!canManage && owner && <Avatar name={owner.name} src={owner.avatarUrl} size={22} />}

        {/* Note toggle */}
        {canManage && !item.note && !editingNote && (
          <button
            className={styles.actionBtn}
            title="Добавить заметку"
            onClick={() => { setNoteDraft(''); setEditingNote(true); }}
          >
            <Icons.Msg size={13} />
          </button>
        )}

        {/* Stop flag — все авторизованные могут поставить, причина обязательна */}
        {onFlag && (
          <button
            className={[styles.actionBtn, styles.flagBtn, isBlocked ? styles.flagBtnActive : ''].join(' ')}
            title={isBlocked ? 'Снять стоп' : 'Поставить на стоп (нужна причина)'}
            onClick={startFlagging}
          >
            <Icons.Flag size={13} />
          </button>
        )}

        {/* Delete */}
        {canManage && (
          confirmDelete ? (
            <div className={styles.confirmRow}>
              <span className={styles.confirmText}>Удалить?</span>
              <button className={styles.confirmYes} onClick={() => onDelete?.(item.id)}>Да</button>
              <button className={styles.confirmNo} onClick={() => setConfirmDelete(false)}>Нет</button>
            </div>
          ) : (
            <button
              className={[styles.actionBtn, styles.deleteBtn].join(' ')}
              title="Удалить пункт"
              onClick={() => setConfirmDelete(true)}
            >
              <Icons.Trash size={13} />
            </button>
          )
        )}
      </div>
    </div>
  );
}
