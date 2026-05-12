'use client';

import { useState, useEffect } from 'react';
import { Button, Modal, DatePicker } from '@/components/ui';
import styles from './NewProjectModal.module.css';

interface ShotData {
  id: string;
  code: string;
  title: string;
  resolution?: string;
  dueDate?: string | null;
  status?: string;
}

interface EditShotModalProps {
  shot: ShotData;
  onClose: () => void;
  onUpdated: (shot: ShotData) => void;
}

export function EditShotModal({ shot, onClose, onUpdated }: EditShotModalProps) {
  const [title, setTitle] = useState(shot.title);
  const [code, setCode] = useState(shot.code);
  const [resolution, setResolution] = useState(shot.resolution ?? '');
  const [dueDate, setDueDate] = useState(
    shot.dueDate ? new Date(shot.dueDate).toISOString().split('T')[0] : ''
  );
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Обязательное поле';
    if (!code.trim()) errs.code = 'Обязательное поле';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const res = await fetch(`/api/shots/${shot.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          code: code.trim().toUpperCase(),
          resolution: resolution.trim() || undefined,
          dueDate: dueDate || null,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setErrors({ form: d.message ?? 'Не удалось сохранить' });
        return;
      }
      const updated = await res.json();
      onUpdated({ ...updated, dueDate: updated.dueDate ?? null });
      onClose();
    } catch {
      setErrors({ form: 'Ошибка сети' });
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <>
      <Button type="button" variant="ghost" size="md" onClick={onClose}>Отмена</Button>
      <Button type="submit" form="edit-shot-form" variant="primary" size="md" loading={loading}>
        Сохранить
      </Button>
    </>
  );

  return (
    <Modal title="Редактировать шот" onClose={onClose} footer={footer} size="md">
      <form id="edit-shot-form" className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.row}>
          <div className={styles.field} style={{ flex: '0 0 110px' }}>
            <label className={styles.label}>Код *</label>
            <input
              className={[styles.input, errors.code ? styles.inputError : ''].join(' ')}
              value={code}
              onChange={(e) => { setCode(e.target.value); setErrors((p) => ({ ...p, code: '' })); }}
              style={{ textTransform: 'uppercase' }}
            />
            {errors.code && <span className={styles.fieldError}>{errors.code}</span>}
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Название *</label>
            <input
              className={[styles.input, errors.title ? styles.inputError : ''].join(' ')}
              value={title}
              onChange={(e) => { setTitle(e.target.value); setErrors((p) => ({ ...p, title: '' })); }}
            />
            {errors.title && <span className={styles.fieldError}>{errors.title}</span>}
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>Разрешение</label>
            <input className={styles.input} value={resolution} onChange={(e) => setResolution(e.target.value)} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Дедлайн</label>
            <DatePicker value={dueDate} onChange={setDueDate} />
          </div>
        </div>

        {errors.form && <div className={styles.formError}>{errors.form}</div>}
      </form>
    </Modal>
  );
}
