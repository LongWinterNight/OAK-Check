'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { Icons } from '@/components/icons';
import styles from './UploadSheet.module.css';

interface Shot {
  id: string;
  code: string;
  title: string;
  projectTitle: string;
}

interface UploadSheetProps {
  open: boolean;
  onClose: () => void;
}

function fmtBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}

export function UploadSheet({ open, onClose }: UploadSheetProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [shots, setShots] = useState<Shot[]>([]);
  const [shotId, setShotId] = useState('');
  const [version, setVersion] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  // Load user's active shots when sheet opens
  useEffect(() => {
    if (!open) return;
    setFile(null); setError(''); setProgress(0); setShotId(''); setVersion('');
    fetch('/api/shots/mine')
      .then((r) => r.json())
      .then((data: Shot[]) => {
        setShots(data ?? []);
        if (data?.length === 1) setShotId(data[0].id);
      })
      .catch(() => setShots([]));
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  }, []);

  const handleSubmit = async () => {
    if (!file || !shotId) return;
    setUploading(true); setError(''); setProgress(10);

    try {
      // Upload file to server via multipart
      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!uploadRes.ok) throw new Error('Ошибка загрузки файла');
      const { url, fileSize } = await uploadRes.json();

      setProgress(70);

      // Create render version record
      const versionRes = await fetch(`/api/shots/${shotId}/versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          fileSize,
          version: version.trim() || undefined,
          format: file.type.includes('video') ? 'VIDEO' : 'IMAGE',
        }),
      });

      if (!versionRes.ok) {
        const body = await versionRes.json().catch(() => ({}));
        throw new Error(body.error ?? 'Ошибка создания версии');
      }

      setProgress(100);
      setTimeout(onClose, 400);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка загрузки');
      setUploading(false); setProgress(0);
    }
  };

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.sheet} role="dialog" aria-modal aria-label="Загрузить рендер">
        <div className={styles.handle} />
        <div className={styles.head}>
          <span className={styles.title}>Загрузить рендер</span>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Закрыть">
            <Icons.X size={18} />
          </button>
        </div>

        <div className={styles.body}>
          {/* File drop zone */}
          {!file ? (
            <div
              className={[styles.dropzone, dragOver ? styles.dropzoneActive : ''].join(' ')}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
            >
              <Icons.Upload size={28} />
              <span className={styles.dropzoneText}>Нажмите или перетащите файл</span>
              <span className={styles.dropzoneHint}>PNG · EXR · MP4 · до 500 MB</span>
              <input
                ref={inputRef}
                type="file"
                accept="image/*,video/*,.exr"
                style={{ display: 'none' }}
                onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
              />
            </div>
          ) : (
            <div className={styles.fileSelected}>
              <Icons.Image size={20} color="var(--accent)" />
              <span className={styles.fileName}>{file.name}</span>
              <span className={styles.fileSize}>{fmtBytes(file.size)}</span>
              <button
                onClick={() => setFile(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-subtle)', display: 'flex' }}
                aria-label="Удалить файл"
              >
                <Icons.X size={16} />
              </button>
            </div>
          )}

          {/* Shot selector */}
          <div>
            <div className={styles.label}>Шот</div>
            <select
              className={styles.select}
              value={shotId}
              onChange={(e) => setShotId(e.target.value)}
            >
              <option value="">— Выберите шот —</option>
              {shots.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} · {s.title} ({s.projectTitle})
                </option>
              ))}
            </select>
          </div>

          {/* Version tag */}
          <div>
            <div className={styles.label}>Версия (необязательно)</div>
            <input
              className={styles.versionInput}
              type="text"
              placeholder="v013"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              maxLength={12}
            />
          </div>

          {/* Progress */}
          {uploading && (
            <div className={styles.progress}>
              <div className={styles.progressBar} style={{ width: `${progress}%` }} />
            </div>
          )}

          {/* Error */}
          {error && <div className={styles.error}>{error}</div>}

          {/* Submit */}
          <button
            className={styles.submitBtn}
            onClick={handleSubmit}
            disabled={!file || !shotId || uploading}
          >
            <Icons.Upload size={16} color="#fff" />
            {uploading ? 'Загрузка…' : 'Загрузить'}
          </button>
        </div>
      </div>
    </div>
  );
}
