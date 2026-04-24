'use client';

import { useState, useRef, useEffect } from 'react';
import { Button, Modal, DatePicker } from '@/components/ui';
import { CoverPicker } from './CoverPicker';
import { DEFAULT_GRADIENT } from './projectCovers';
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
  const [coverGradient, setCoverGradient] = useState(DEFAULT_GRADIENT);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => { titleRef.current?.focus(); }, []);

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
          coverGradient,
          coverImage,
        }),
      });
      if (!res.ok) throw new Error();
      onCreated(await res.json());
      onClose();
    } catch {
      setErrors({ form: 'Не удалось создать проект' });
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <>
      <Button type="button" variant="ghost" size="md" onClick={onClose}>Отмена</Button>
      <Button type="submit" form="new-project-form" variant="primary" size="md" loading={loading}>
        Создать проект
      </Button>
    </>
  );

  return (
    <Modal title="Новый проект" onClose={onClose} footer={footer} size="md">
      <form id="new-project-form" className={styles.form} onSubmit={handleSubmit}>
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
            <DatePicker value={dueDate} onChange={setDueDate} />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Обложка</label>
          <CoverPicker
            coverGradient={coverGradient}
            coverImage={coverImage}
            onGradientChange={setCoverGradient}
            onImageChange={setCoverImage}
          />
        </div>

        {errors.form && <div className={styles.formError}>{errors.form}</div>}
      </form>
    </Modal>
  );
}
