'use client';

import { Icons } from '@/components/icons';
import { Button, OakRing } from '@/components/ui';
import type { ChapterWithItems } from '@/types';
import styles from './ChaptersPanel.module.css';

interface ChaptersPanelProps {
  chapters: ChapterWithItems[];
  activeId: string;
  onSelect: (id: string) => void;
}

export default function ChaptersPanel({ chapters, activeId, onSelect }: ChaptersPanelProps) {
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
      </div>

      <div className={styles.footer}>
        <Button
          variant="ghost"
          size="sm"
          fullWidth
          icon={<Icons.Plus size={14} />}
        >
          Этап или шаблон
        </Button>
      </div>
    </aside>
  );
}
