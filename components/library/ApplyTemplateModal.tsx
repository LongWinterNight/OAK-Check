'use client';

import { useState } from 'react';
import { Badge, Button, Modal } from '@/components/ui';
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
  const [selectedShotId, setSelectedShotId] = useState('');
  const [chapterName, setChapterName] = useState(template.name);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const footer = (
    <>
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
    </>
  );

  return (
    <Modal
      title="Применить шаблон"
      subtitle={template.name}
      onClose={onClose}
      footer={footer}
      size="md"
    >
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
    </Modal>
  );
}
