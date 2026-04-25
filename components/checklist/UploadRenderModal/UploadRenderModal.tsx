'use client';

import { useState, useRef } from 'react';
import { Button, Modal } from '@/components/ui';
import { Icons } from '@/components/icons';
import { toast } from '@/components/ui/Toast/toastStore';
import type { RenderVersion } from '@/types';
import formStyles from '@/components/projects/NewProjectModal.module.css';
import styles from './UploadRenderModal.module.css';

interface Props {
  shotId: string;
  onUploaded: (version: RenderVersion) => void;
  onClose: () => void;
}

export function UploadRenderModal({ shotId, onUploaded, onClose }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [version, setVersion] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setFile(f);
    if (!version) {
      const match = f.name.match(/v\d+/i);
      if (match) setVersion(match[0].toLowerCase());
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !version.trim() || uploading) return;
    setUploading(true);

    try {
      const fd = new FormData();
      fd.append('file', file);

      const uploadRes = await fetch('/api/upload', { method: 'POST', body: fd });
      if (!uploadRes.ok) throw new Error('Ошибка загрузки файла');
      const { url } = await uploadRes.json();

      const versionRes = await fetch(`/api/shots/${shotId}/versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          version: version.trim(),
          url,
          format: file.name.split('.').pop()?.toUpperCase() ?? 'EXR',
          fileSize: file.size,
        }),
      });
      if (!versionRes.ok) throw new Error('Ошибка сохранения версии');

      const newVersion = await versionRes.json();
      onUploaded({ ...newVersion, createdAt: newVersion.createdAt ?? new Date().toISOString() });
      toast.success(`Рендер ${version} загружен`);
      onClose();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const footer = (
    <>
      <Button type="button" variant="ghost" size="md" onClick={onClose}>Отмена</Button>
      <Button
        type="submit"
        form="upload-render-form"
        variant="primary"
        size="md"
        loading={uploading}
        disabled={!file || !version.trim()}
        icon={<Icons.Upload size={14} />}
      >
        Загрузить
      </Button>
    </>
  );

  return (
    <Modal title="Загрузить рендер" onClose={onClose} footer={footer} size="md">
      <form id="upload-render-form" className={formStyles.form} onSubmit={handleSubmit}>
        <div
          className={[
            styles.dropzone,
            file ? styles.dropzoneFilled : '',
            dragOver ? styles.dropzoneActive : '',
          ].join(' ')}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
        >
          <input
            ref={inputRef}
            type="file"
            hidden
            accept=".exr,.jpg,.jpeg,.png,.tiff,.tif,.webp"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
          {file ? (
            <div className={styles.fileInfo}>
              <Icons.Upload size={20} color="var(--accent)" />
              <span className={styles.fileName}>{file.name}</span>
              <span className={styles.fileSize}>{(file.size / 1024 / 1024).toFixed(1)} МБ</span>
              <button
                type="button"
                className={styles.removeBtn}
                onClick={(e) => { e.stopPropagation(); setFile(null); }}
              >
                <Icons.X size={11} /> Убрать
              </button>
            </div>
          ) : (
            <div className={styles.dropHint}>
              <Icons.Upload size={24} color="var(--fg-muted)" />
              <span className={styles.dropMain}>Перетащите файл или нажмите</span>
              <span className={styles.dropSub}>EXR, PNG, JPG, TIFF — до 100 МБ</span>
            </div>
          )}
        </div>

        <div className={formStyles.field}>
          <label className={formStyles.label}>Версия *</label>
          <input
            className={formStyles.input}
            placeholder="v001"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
}
