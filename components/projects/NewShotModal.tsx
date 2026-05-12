'use client';

import { useState, useRef, useEffect } from 'react';
import { Button, Modal, DatePicker, Badge } from '@/components/ui';
import styles from './NewProjectModal.module.css';

const STATUS_META: Record<string, { label: string; kind: 'neutral' | 'info' | 'wip' | 'done' }> = {
  TODO:   { label: 'Бэклог',   kind: 'neutral' },
  WIP:    { label: 'В работе', kind: 'info' },
  REVIEW: { label: 'На ревью', kind: 'wip' },
  DONE:   { label: 'Сдано',    kind: 'done' },
};

interface NewShotModalProps {
  projectId: string;
  defaultStatus?: string;
  onClose: () => void;
  onCreated: (shot: { id: string; code: string; title: string; status: string; owner: null; progress: number }) => void;
}

export function NewShotModal({ projectId, defaultStatus, onClose, onCreated }: NewShotModalProps) {
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [resolution, setResolution] = useState('3840×2160');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => { titleRef.current?.focus(); }, []);

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
      const res = await fetch(`/api/projects/${projectId}/shots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          code: code.trim().toUpperCase(),
          // software не указываем — студия не трекает ПО на уровне шота,
          // в БД подхватится default из prisma schema
          resolution: resolution.trim() || undefined,
          dueDate: dueDate || undefined,
          status: defaultStatus || undefined,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setErrors({ form: d.message ?? 'Не удалось создать шот' });
        return;
      }
      const shot = await res.json();
      onCreated({ id: shot.id, code: shot.code, title: shot.title, status: shot.status, owner: null, progress: 0 });
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
      <Button type="submit" form="new-shot-form" variant="primary" size="md" loading={loading}>
        Создать шот
      </Button>
    </>
  );

  const statusMeta = defaultStatus ? STATUS_META[defaultStatus] : null;

  return (
    <Modal title="Новый шот" onClose={onClose} footer={footer} size="md">
      <form id="new-shot-form" className={styles.form} onSubmit={handleSubmit}>
        {statusMeta && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--fg-muted)' }}>
            <span>Будет создан в колонке</span>
            <Badge kind={statusMeta.kind} size="sm" dot>{statusMeta.label}</Badge>
          </div>
        )}
        <div className={styles.row}>
          <div className={styles.field} style={{ flex: '0 0 110px' }}>
            <label className={styles.label}>Код *</label>
            <input
              className={[styles.input, errors.code ? styles.inputError : ''].join(' ')}
              value={code}
              onChange={(e) => { setCode(e.target.value); setErrors((p) => ({ ...p, code: '' })); }}
              placeholder="SH_010"
              style={{ textTransform: 'uppercase' }}
            />
            {errors.code && <span className={styles.fieldError}>{errors.code}</span>}
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Название *</label>
            <input
              ref={titleRef}
              className={[styles.input, errors.title ? styles.inputError : ''].join(' ')}
              value={title}
              onChange={(e) => { setTitle(e.target.value); setErrors((p) => ({ ...p, title: '' })); }}
              placeholder="Вид снаружи — угол А"
            />
            {errors.title && <span className={styles.fieldError}>{errors.title}</span>}
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>Разрешение</label>
            <input
              className={styles.input}
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              placeholder="3840×2160"
            />
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
