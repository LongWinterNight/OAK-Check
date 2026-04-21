'use client';

import { useState } from 'react';
import { Button, Modal, DatePicker } from '@/components/ui';
import styles from './NewProjectModal.module.css';

type ProjectStatus = 'ACTIVE' | 'PAUSED' | 'DONE' | 'ARCHIVED';

interface ProjectData {
  id: string;
  title: string;
  client: string;
  status: ProjectStatus;
  dueDate: string | null;
}

interface EditProjectModalProps {
  project: ProjectData;
  onClose: () => void;
  onUpdated: (project: ProjectData) => void;
}

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: 'ACTIVE', label: 'Активный' },
  { value: 'PAUSED', label: 'На паузе' },
  { value: 'DONE', label: 'Завершён' },
  { value: 'ARCHIVED', label: 'Архив' },
];

export function EditProjectModal({ project, onClose, onUpdated }: EditProjectModalProps) {
  const [title, setTitle] = useState(project.title);
  const [client, setClient] = useState(project.client);
  const [status, setStatus] = useState<ProjectStatus>(project.status);
  const [dueDate, setDueDate] = useState(
    project.dueDate ? new Date(project.dueDate).toISOString().split('T')[0] : ''
  );
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
      const res = await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          client: client.trim(),
          status,
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
      <Button type="submit" form="edit-project-form" variant="primary" size="md" loading={loading}>
        Сохранить
      </Button>
    </>
  );

  return (
    <Modal title="Редактировать проект" onClose={onClose} footer={footer} size="md">
      <form id="edit-project-form" className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label className={styles.label}>Название *</label>
          <input
            className={[styles.input, errors.title ? styles.inputError : ''].join(' ')}
            value={title}
            onChange={(e) => { setTitle(e.target.value); setErrors((p) => ({ ...p, title: '' })); }}
          />
          {errors.title && <span className={styles.fieldError}>{errors.title}</span>}
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>Клиент *</label>
            <input
              className={[styles.input, errors.client ? styles.inputError : ''].join(' ')}
              value={client}
              onChange={(e) => { setClient(e.target.value); setErrors((p) => ({ ...p, client: '' })); }}
            />
            {errors.client && <span className={styles.fieldError}>{errors.client}</span>}
          </div>
          <div className={styles.field} style={{ flex: '0 0 140px' }}>
            <label className={styles.label}>Статус</label>
            <select
              className={styles.select}
              value={status}
              onChange={(e) => setStatus(e.target.value as ProjectStatus)}
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Дедлайн</label>
          <DatePicker value={dueDate} onChange={setDueDate} />
        </div>

        {errors.form && <div className={styles.formError}>{errors.form}</div>}
      </form>
    </Modal>
  );
}
