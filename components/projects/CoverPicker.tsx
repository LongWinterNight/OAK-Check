'use client';

import { useRef, useState } from 'react';
import { Icons } from '@/components/icons';
import { PROJECT_GRADIENTS, DEFAULT_GRADIENT } from './projectCovers';
import styles from './CoverPicker.module.css';

interface CoverPickerProps {
  coverGradient: string;
  coverImage: string | null;
  onGradientChange: (value: string) => void;
  onImageChange: (url: string | null) => void;
}

export function CoverPicker({
  coverGradient,
  coverImage,
  onGradientChange,
  onImageChange,
}: CoverPickerProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const effectiveGradient = coverGradient || DEFAULT_GRADIENT;

  const preview: React.CSSProperties = coverImage
    ? {
        backgroundImage: `url(${coverImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : { background: effectiveGradient };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Нужна картинка (JPEG, PNG, WebP)');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Макс. размер — 10 МБ');
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      if (!res.ok) throw new Error();
      const { url } = await res.json();
      onImageChange(url);
    } catch {
      setError('Не удалось загрузить');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.preview} style={preview}>
        {coverImage && (
          <button
            type="button"
            className={styles.removeImage}
            onClick={() => onImageChange(null)}
            aria-label="Убрать картинку"
          >
            <Icons.X size={12} />
          </button>
        )}
      </div>

      <div className={styles.swatches}>
        {PROJECT_GRADIENTS.map((g) => {
          const isActive = !coverImage && effectiveGradient === g.value;
          return (
            <button
              key={g.id}
              type="button"
              className={[styles.swatch, isActive ? styles.swatchActive : ''].join(' ')}
              style={{ background: g.value }}
              onClick={() => { onGradientChange(g.value); onImageChange(null); }}
              title={g.label}
              aria-label={g.label}
              aria-pressed={isActive}
            />
          );
        })}
      </div>

      <div className={styles.uploadRow}>
        <button
          type="button"
          className={styles.uploadBtn}
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          <Icons.Image size={13} />
          {uploading ? 'Загрузка…' : coverImage ? 'Заменить картинку' : 'Загрузить картинку'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>

      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
}
