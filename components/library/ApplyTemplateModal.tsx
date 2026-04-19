'use client';

import { useState, useEffect, useRef } from 'react';
import { Icons } from '@/components/icons';
import { Button, Badge } from '@/components/ui';
import styles from './ApplyTemplateModal.module.css';

interface TemplateItem {
  id: string;
  title: string;
  order: number;
}

interface Template {
  id: string;
  name: string;
  category: string;
  items: TemplateItem[];
}

interface Shot {
  id: string;
  code: string;
  title: string;
}

interface ApplyTemplateModalProps {
  template: Template;
  shots: Shot[];
  onClose: () => void;
  onApplied?: () => void;
}

export function ApplyTemplateModal({ template, shots, onClose, onApplied }: ApplyTemplateModalProps) {
  const [selectedShotId, setSelectedShotId] = useState<string>('');
  const [chapterName, setChapterName] = useState(template.name);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const handleApply = async () => {
    if (!selectedShotId) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/shots/${selectedShotId}/checklist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: template.id,
          chapterName: chapterName.trim() || template.name,
        }),
      });

      if (!res.ok) throw new Error('Ошибка при применении шаблона');

      onApplied?.();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка сервера');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} ref={overlayRef} onClick={handleOverlayClick}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label="Применить шаблон">
        <div className={styles.header}>
          <div>
            <div className={styles.title}>Применить шаблон</div>
            <div className={styles.subtitle}>{template.name}</div>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Закрыть">
            <Icons.X size={16} />
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.field}>
            <label className={styles.label}>Шот</label>
            <select
              className={styles.select}
              value={selectedShotId}
              onChange={(e) => setSelectedShotId(e.target.value)}
            >
              <option value="">— выберите шот —</option>
              {shots.map((shot) => (
                <option key={shot.id} value={shot.id}>
                  {shot.code} · {shot.title}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Название главы</label>
            <input
              className={styles.input}
              value={chapterName}
              onChange={(e) => setChapterName(e.target.value)}
              placeholder={template.name}
            />
          </div>

          <div className={styles.preview}>
            <div className={styles.previewLabel}>
              <Badge kind="neutral" size="sm">{template.category}</Badge>
              <span>{template.items.length} пунктов</span>
            </div>
            <div className={styles.previewItems}>
              {template.items.map((item) => (
                <div key={item.id} className={styles.previewItem}>
                  <span className={styles.previewDot} />
                  {item.title}
                </div>
              ))}
            </div>
          </div>

          {error && <div className={styles.error}>{error}</div>}
        </div>

        <div className={styles.footer}>
          <Button variant="ghost" size="md" onClick={onClose}>Отмена</Button>
          <Button
            variant="primary"
            size="md"
            disabled={!selectedShotId}
            loading={loading}
            onClick={handleApply}
          >
            Применить к шоту
          </Button>
        </div>
      </div>
    </div>
  );
}
