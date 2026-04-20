'use client';

import { useState, useRef, useEffect } from 'react';
import { Icons } from '@/components/icons';
import { Button, OakRing } from '@/components/ui';
import { toast } from '@/components/ui/Toast/toastStore';
import type { ChapterWithItems } from '@/types';
import styles from './ChaptersPanel.module.css';

interface ChaptersPanelProps {
  chapters: ChapterWithItems[];
  activeId: string;
  shotId: string;
  onSelect: (id: string) => void;
  onChapterCreated?: (chapter: ChapterWithItems) => void;
  canManage?: boolean;
}

export default function ChaptersPanel({
  chapters, activeId, shotId, onSelect, onChapterCreated, canManage = false,
}: ChaptersPanelProps) {
  const [addingChapter, setAddingChapter] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [saving, setSaving] = useState(false);
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); handleCreate(); }
    if (e.key === 'Escape') { setAddingChapter(false); setNewTitle(''); }
  };

  return (
    <aside className={styles.panel}>
      <div className={styles.header}>Этапы</div>

      <div className={styles.list} role="tablist" aria-label="Этапы чек-листа">
        {chapters.map((chapter, i) => {
          const isActive = chapter.id === activeId;
          const total = chapter.items.length;
          return (
            <div
              key={chapter.id}
              role="tab"
              aria-selected={isActive}
              className={[styles.item, isActive ? styles.active : ''].join(' ')}
              onClick={() => onSelect(chapter.id)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(chapter.id); } }}
              tabIndex={0}
              title={`${i + 1}. ${chapter.title}`}
            >
              <OakRing value={chapter.progress} size={32} stroke={2.5} segments={2} />
              <div className={styles.info}>
                <div className={styles.title}>{chapter.title}</div>
                <div className={styles.subtitle}>
                  {chapter.doneCount}/{total}
                  {chapter.blockedCount > 0 && (
                    <span className={styles.blocked}> · {chapter.blockedCount} блок.</span>
                  )}
                </div>
              </div>
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
              onKeyDown={handleKeyDown}
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
  );
}
