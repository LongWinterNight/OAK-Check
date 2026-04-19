'use client';

import { useState, useEffect, useRef } from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui';
import styles from './NewProjectModal.module.css';

type ProjectStatus = 'ACTIVE' | 'PAUSED' | 'DONE' | 'ARCHIVED';

interface NewProjectModalProps {
  onClose: () => void;
  onCreated: (project: any) => void; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export function NewProjectModal({ onClose, onCreated }: NewProjectModalProps) {
  const [title, setTitle] = useState('');
  const [client, setClient] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('ACTIVE');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const overlayRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Обязательное поле';
    if (!client.trim()) errs.client = 'Обязательное поле';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          client: client.trim(),
          status,
          dueDate: dueDate || undefined,
        }),
      });

      if (!res.ok) throw new Error('Ошибка создания');
      const project = await res.json();
      onCreated(project);
      onClose();
    } catch {
      setErrors({ form: 'Не удалось создать проект' });
    } finally {
      setLoading(false);
    }
  };

  const handleOverlay = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div className={styles.overlay} ref={overlayRef} onClick={handleOverlay}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label="Новый проект">
        <div className={styles.header}>
          <div className={styles.title}>Новый проект</div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Закрыть">
            <Icons.X size={16} />
          </button>
        </div>

        <form className={styles.body} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>Название проекта *</label>
            <input
              ref={titleRef}
              className={[styles.input, errors.title ? styles.inputError : ''].join(' ')}
              value={title}
              onChange={(e) => { setTitle(e.target.value); setErrors((p) => ({ ...p, title: '' })); }}
              placeholder="Skolkovo One"
            />
            {errors.title && <span className={styles.fieldError}>{errors.title}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Клиент / Заказчик *</label>
            <input
              className={[styles.input, errors.client ? styles.inputError : ''].join(' ')}
              value={client}
              onChange={(e) => { setClient(e.target.value); setErrors((p) => ({ ...p, client: '' })); }}
              placeholder="Sberbank Real Estate"
            />
            {errors.client && <span className={styles.fieldError}>{errors.client}</span>}
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Статус</label>
              <select
                className={styles.select}
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
              >
                <option value="ACTIVE">Активный</option>
                <option value="PAUSED">На паузе</option>
                <option value="DONE">Завершён</option>
                <option value="ARCHIVED">Архив</option>
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Дедлайн</label>
              <input
                type="date"
                className={styles.input}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          {errors.form && <div className={styles.formError}>{errors.form}</div>}

          <div className={styles.footer}>
            <Button type="button" variant="ghost" size="md" onClick={onClose}>Отмена</Button>
            <Button type="submit" variant="primary" size="md" loading={loading}>
              Создать проект
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
