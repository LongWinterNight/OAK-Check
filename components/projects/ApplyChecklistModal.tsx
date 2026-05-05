'use client';

import { useState, useEffect } from 'react';
import { Button, Modal } from '@/components/ui';
import { toast } from '@/components/ui/Toast/toastStore';
import styles from './ApplyChecklistModal.module.css';

interface TemplateItem {
  id: string;
  title: string;
}

interface Template {
  id: string;
  name: string;
  items: TemplateItem[];
  usedCount: number;
}

interface Props {
  shotId: string;
  shotCode: string;
  onClose: () => void;
  onApplied: () => void;
}

export function ApplyChecklistModal({ shotId, shotCode, onClose, onApplied }: Props) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    fetch('/api/templates')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: Template[]) => {
        setTemplates(data);
        if (data.length > 0) setSelectedId(data[0].id);
      })
      .catch(() => toast.error('Не удалось загрузить шаблоны'))
      .finally(() => setLoading(false));
  }, []);

  const handleApply = async () => {
    if (!selectedId) return;
    setApplying(true);
    try {
      const res = await fetch(`/api/shots/${shotId}/checklist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: selectedId }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        toast.error(d.message ?? 'Не удалось применить шаблон');
        return;
      }
      const chapter = await res.json();
      const count = Array.isArray(chapter.items) ? chapter.items.length : 0;
      toast.success(`Шаблон применён — добавлено ${count} пунктов`);
      onApplied();
      onClose();
    } catch {
      toast.error('Ошибка сети');
    } finally {
      setApplying(false);
    }
  };

  const selected = templates.find((t) => t.id === selectedId);

  const footer = (
    <>
      <Button variant="ghost" size="md" onClick={onClose}>
        Отмена
      </Button>
      <Button
        variant="primary"
        size="md"
        loading={applying}
        disabled={!selectedId || loading}
        onClick={handleApply}
      >
        Применить
      </Button>
    </>
  );

  return (
    <Modal title={`Шаблон чек-листа — ${shotCode}`} onClose={onClose} footer={footer} size="sm">
      <div className={styles.body}>
        {loading ? (
          <div className={styles.loading}>Загрузка шаблонов…</div>
        ) : templates.length === 0 ? (
          <div className={styles.empty}>
            Шаблонов пока нет.<br />
            Откройте страницу чек-листа и добавьте пункты вручную.
          </div>
        ) : (
          templates.map((t) => (
            <button
              key={t.id}
              className={[styles.item, t.id === selectedId ? styles.itemActive : ''].join(' ')}
              onClick={() => setSelectedId(t.id)}
            >
              <div className={styles.itemName}>{t.name}</div>
              <div className={styles.itemMeta}>
                {t.items.length} пунктов
                {t.usedCount > 0 && ` · применён ${t.usedCount} раз`}
              </div>

              {t.id === selectedId && selected && selected.items.length > 0 && (
                <div className={styles.preview}>
                  {selected.items.slice(0, 5).map((item) => (
                    <div key={item.id} className={styles.previewRow}>
                      <span className={styles.previewDot} />
                      {item.title}
                    </div>
                  ))}
                  {selected.items.length > 5 && (
                    <div className={styles.previewMore}>
                      + ещё {selected.items.length - 5}
                    </div>
                  )}
                </div>
              )}
            </button>
          ))
        )}
      </div>
    </Modal>
  );
}
