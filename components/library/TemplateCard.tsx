'use client';

import { useState } from 'react';
import { Icons } from '@/components/icons';
import { Badge, Button, ConfirmDialog } from '@/components/ui';
import styles from './TemplateCard.module.css';

interface TemplateItem {
  id: string;
  title: string;
  order: number;
}

interface Template {
  id: string;
  name: string;
  category: string;
  description?: string | null;
  usedCount: number;
  items: TemplateItem[];
}

interface TemplateCardProps {
  template: Template;
  canManage?: boolean;
  onApply: (template: Template) => void;
  onDelete: (id: string, name: string) => void;
}

export function TemplateCard({ template, canManage, onApply, onDelete }: TemplateCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const preview = template.items.slice(0, 4);
  const rest = template.items.length - preview.length;

  return (
    <>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.meta}>
            <Badge kind="neutral" size="sm">{template.category}</Badge>
            {template.usedCount > 0 && (
              <span className={styles.usage}>
                <Icons.Bell size={11} />
                {template.usedCount}
              </span>
            )}
          </div>
          {canManage && (
            <button
              className={styles.deleteBtn}
              onClick={() => setConfirmDelete(true)}
              aria-label="Удалить шаблон"
            >
              <Icons.X size={13} />
            </button>
          )}
        </div>

        <div className={styles.name}>{template.name}</div>
        {template.description && (
          <div className={styles.description}>{template.description}</div>
        )}

        <div className={styles.items}>
          {preview.map((item) => (
            <div key={item.id} className={styles.item}>
              <span className={styles.itemDot} />
              <span className={styles.itemTitle}>{item.title}</span>
            </div>
          ))}
          {rest > 0 && (
            <div className={styles.more}>+{rest} пункт{rest === 1 ? '' : rest < 5 ? 'а' : 'ов'}</div>
          )}
        </div>

        <div className={styles.footer}>
          <span className={styles.count}>
            {template.items.length} пункт{template.items.length === 1 ? '' : template.items.length < 5 ? 'а' : 'ов'}
          </span>
          <Button
            variant="secondary"
            size="sm"
            icon={<Icons.Plus size={13} />}
            onClick={() => onApply(template)}
          >
            Применить
          </Button>
        </div>
      </div>

      {confirmDelete && (
        <ConfirmDialog
          title="Удалить шаблон?"
          message={`Шаблон «${template.name}» будет удалён безвозвратно.`}
          confirmLabel="Удалить"
          danger
          onClose={() => setConfirmDelete(false)}
          onConfirm={() => { setConfirmDelete(false); onDelete(template.id, template.name); }}
        />
      )}
    </>
  );
}
