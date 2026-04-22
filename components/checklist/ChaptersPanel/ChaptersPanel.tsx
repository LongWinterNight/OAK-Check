'use client';

import { useState, useRef, useEffect } from 'react';
import { Icons } from '@/components/icons';
import { Button, ConfirmDialog, OakRing } from '@/components/ui';
import { toast } from '@/components/ui/Toast/toastStore';
import type { ChapterWithItems } from '@/types';
import styles from './ChaptersPanel.module.css';

interface ChaptersPanelProps {
  chapters: ChapterWithItems[];
  activeId: string;
  shotId: string;
  onSelect: (id: string) => void;
  onChapterCreated?: (chapter: ChapterWithItems) => void;
  onChapterDeleted?: (id: string) => void;
  onChapterRenamed?: (id: string, title: string) => void;
  canManage?: boolean;
  className?: string;
}

export default function ChaptersPanel({
  chapters, activeId, shotId, onSelect,
  onChapterCreated, onChapterDeleted, onChapterRenamed, canManage = false,
  className,
}: ChaptersPanelProps) {
  const [addingChapter, setAddingChapter] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ChapterWithItems | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (addingChapter) inputRef.current?.focus();
  }, [addingChapter]);

  const handleCreate = async () => {
    const title = newTitle.trim();
    if (!title) { setAddingChapter(false); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/chapters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shotId, title }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        toast.error(d.error ?? 'Не удалось создать этап');
        return;
      }
      const chapter = await res.json();
      onChapterCreated?.({ ...chapter, items: [], progress: 0, doneCount: 0, blockedCount: 0 });
      onSelect(chapter.id);
      setNewTitle('');
      setAddingChapter(false);
    } catch {
      toast.error('Ошибка сети');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/chapters/${deleteTarget.id}`, { method: 'DELETE' });
      if (!res.ok) { toast.error('Не удалось удалить этап'); return; }
      onChapterDeleted?.(deleteTarget.id);
      toast.success(`Этап «${deleteTarget.title}» удалён`);
    } catch {
      toast.error('Ошибка сети');
    } finally {
      setDeleteTarget(null);
    }
  };

  const commitRename = async (id: string) => {
    const title = editDraft.trim();
    const chapter = chapters.find(c => c.id === id);
    if (!title || title === chapter?.title) { setEditingId(null); return; }
    try {
      const res = await fetch(`/api/chapters/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      if (res.ok) {
        onChapterRenamed?.(id, title);
      } else {
        toast.error('Не удалось переименовать этап');
      }
    } catch {
      toast.error('Ошибка сети');
    } finally {
      setEditingId(null);
    }
  };

  return (
    <>
      <aside className={[styles.panel, className ?? ''].join(' ')}>
        <div className={styles.header}>Этапы</div>

        <div className={styles.list} role="tablist" aria-label="Этапы чек-листа">
          {chapters.map((chapter, i) => {
            const isActive = chapter.id === activeId;
            const total = chapter.items.length;
            const isEditing = editingId === chapter.id;
            return (
              <div
                key={chapter.id}
                role="tab"
                aria-selected={isActive}
                className={[styles.item, isActive ? styles.active : ''].join(' ')}
                onClick={() => !isEditing && onSelect(chapter.id)}
                onKeyDown={(e) => {
                  if (!isEditing && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    onSelect(chapter.id);
                  }
                }}
                tabIndex={0}
                title={`${i + 1}. ${chapter.title}`}
              >
                <OakRing value={chapter.progress} size={32} stroke={2.5} segments={2} />
                <div className={styles.info}>
                  {isEditing ? (
                    <input
                      className={styles.renameInput}
                      autoFocus
                      value={editDraft}
                      onChange={(e) => setEditDraft(e.target.value)}
                      onBlur={() => commitRename(chapter.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') { e.preventDefault(); commitRename(chapter.id); }
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <div
                      className={styles.title}
                      onDoubleClick={canManage ? (e) => {
                        e.stopPropagation();
                        setEditDraft(chapter.title);
                        setEditingId(chapter.id);
                      } : undefined}
                    >
                      {chapter.title}
                    </div>
                  )}
                  <div className={styles.subtitle}>
                    {chapter.doneCount}/{total}
                    {chapter.blockedCount > 0 && (
                      <span className={styles.blocked}> · {chapter.blockedCount} блок.</span>
                    )}
                  </div>
                </div>
                {canManage && !isEditing && (
                  <button
                    className={styles.deleteBtn}
                    title="Удалить этап"
                    onClick={(e) => { e.stopPropagation(); setDeleteTarget(chapter); }}
                  >
                    <Icons.Trash size={12} />
                  </button>
                )}
              </div>
            );
          })}

          {canManage && addingChapter && (
            <div className={styles.addForm}>
              <input
                ref={inputRef}
                className={styles.addInput}
                placeholder="Название этапа…"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); handleCreate(); }
                  if (e.key === 'Escape') { setAddingChapter(false); setNewTitle(''); }
                }}
                onBlur={() => { if (!newTitle.trim()) setAddingChapter(false); }}
                disabled={saving}
              />
            </div>
          )}
        </div>

        {canManage && !addingChapter && (
          <div className={styles.footer}>
            <Button
              variant="ghost"
              size="sm"
              fullWidth
              icon={<Icons.Plus size={14} />}
              onClick={() => setAddingChapter(true)}
            >
              Новый этап
            </Button>
          </div>
        )}
      </aside>

      {deleteTarget && (
        <ConfirmDialog
          title="Удалить этап?"
          message={`Этап «${deleteTarget.title}» и все его пункты (${deleteTarget.items.length}) будут удалены безвозвратно.`}
          confirmLabel="Удалить"
          danger
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
    </>
  );
}
