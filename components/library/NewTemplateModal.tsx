'use client';

import { useState, useRef, useEffect } from 'react';
import { Button, Modal } from '@/components/ui';
import { Icons } from '@/components/icons';
import { uid } from '@/lib/uid';
import styles from './NewTemplateModal.module.css';

interface NewTemplateModalProps {
  onClose: () => void;
  onCreated: (template: {
    id: string; name: string; category: string;
    description?: string | null; usedCount: number;
    items: { id: string; title: string; order: number }[];
  }) => void;
}

interface ItemDraft {
  key: string;
  title: string;
}

export function NewTemplateModal({ onClose, onCreated }: NewTemplateModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [items, setItems] = useState<ItemDraft[]>([{ key: uid(), title: '' }]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => { nameRef.current?.focus(); }, []);

  const addItem = () => {
    setItems((prev) => [...prev, { key: uid(), title: '' }]);
  };

  const removeItem = (key: string) => {
    setItems((prev) => prev.filter((i) => i.key !== key));
  };

  const updateItem = (key: string, title: string) => {
    setItems((prev) => prev.map((i) => i.key === key ? { ...i, title } : i));
  };

  const handleItemKeyDown = (e: React.KeyboardEvent, key: string) => {
    if (e.key === 'Enter') { e.preventDefault(); addItem(); }
    if (e.key === 'Backspace' && items.find((i) => i.key === key)?.title === '' && items.length > 1) {
      e.preventDefault();
      removeItem(key);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Обязательное поле';
    const validItems = items.filter((i) => i.title.trim());
    if (validItems.length === 0) errs.items = 'Добавьте хотя бы один пункт';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          category: category.trim() || 'Общее',
          description: description.trim() || undefined,
          items: validItems.map((i, idx) => ({ title: i.title.trim(), order: idx })),
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setErrors({ form: d.message ?? 'Не удалось создать шаблон' });
        return;
      }
      const template = await res.json();
      onCreated(template);
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
      <Button type="submit" form="new-template-form" variant="primary" size="md" loading={loading}>
        Создать шаблон
      </Button>
    </>
  );

  return (
    <Modal title="Новый шаблон" onClose={onClose} footer={footer} size="md">
      <form id="new-template-form" className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label className={styles.label}>Название *</label>
          <input
            ref={nameRef}
            className={[styles.input, errors.name ? styles.inputError : ''].join(' ')}
            value={name}
            onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: '' })); }}
            placeholder="Интерьерный рендер · Full"
          />
          {errors.name && <span className={styles.fieldError}>{errors.name}</span>}
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>Категория</label>
            <input
              className={styles.input}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Интерьер"
              list="category-suggestions"
            />
            <datalist id="category-suggestions">
              <option value="Интерьер" />
              <option value="Экстерьер" />
              <option value="Общее" />
              <option value="Детали" />
            </datalist>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Описание</label>
            <input
              className={styles.input}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Необязательно"
            />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>
            Пункты чеклиста
            <span className={styles.hint}> — Enter добавляет новый</span>
          </label>
          <div className={styles.itemsList}>
            {items.map((item, idx) => (
              <div key={item.key} className={styles.itemRow}>
                <span className={styles.itemIdx}>{idx + 1}.</span>
                <input
                  className={styles.itemInput}
                  value={item.title}
                  onChange={(e) => updateItem(item.key, e.target.value)}
                  onKeyDown={(e) => handleItemKeyDown(e, item.key)}
                  placeholder="Название пункта"
                  autoFocus={idx === items.length - 1 && idx > 0}
                />
                {items.length > 1 && (
                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={() => removeItem(item.key)}
                    aria-label="Удалить"
                  >
                    <Icons.X size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button type="button" className={styles.addItemBtn} onClick={addItem}>
            <Icons.Plus size={12} /> Добавить пункт
          </button>
          {errors.items && <span className={styles.fieldError}>{errors.items}</span>}
        </div>

        {errors.form && <div className={styles.formError}>{errors.form}</div>}
      </form>
    </Modal>
  );
}
