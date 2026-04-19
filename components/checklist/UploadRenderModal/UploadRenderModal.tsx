'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui';
import { Icons } from '@/components/icons';
import { toast } from '@/components/ui/Toast/toastStore';
import type { RenderVersion } from '@/types';
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
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleSubmit = async () => {
    if (!file || !version.trim()) return;
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
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <span className={styles.title}>Загрузить рендер</span>
          <button className={styles.close} onClick={onClose}><Icons.X size={14} /></button>
        </div>

        <div
          className={[styles.dropzone, file ? styles.dropzoneFilled : ''].join(' ')}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
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
              <Icons.Upload size={20} />
              <span className={styles.fileName}>{file.name}</span>
              <span className={styles.fileSize}>{(file.size / 1024 / 1024).toFixed(1)} МБ</span>
            </div>
          ) : (
            <div className={styles.dropHint}>
              <Icons.Upload size={24} />
              <span>Перетащите файл или нажмите</span>
              <span className={styles.dropSub}>EXR, PNG, JPG, TIFF — до 100 МБ</span>
            </div>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Версия</label>
          <input
            className={styles.input}
            placeholder="v001"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
          />
        </div>

        <div className={styles.actions}>
          <Button variant="ghost" onClick={onClose}>Отмена</Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!file || !version.trim() || uploading}
            icon={<Icons.Upload size={14} />}
          >
            {uploading ? 'Загрузка…' : 'Загрузить'}
          </Button>
        </div>
      </div>
    </div>
  );
}
