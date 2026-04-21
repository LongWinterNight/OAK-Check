'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icons } from '@/components/icons';
import { toast } from '@/components/ui/Toast/toastStore';
import type { RenderVersion, Comment } from '@/types';
import styles from './RenderPreview.module.css';

interface RenderPreviewProps {
  versions: RenderVersion[];
  comments: Comment[];
  canDeleteVersion?: boolean;
  onVersionDeleted?: (id: string) => void;
  onAddPin?: (pinX: number, pinY: number) => void;
}

function Lightbox({
  versions,
  activeVersion,
  comments,
  onClose,
  onPrev,
  onNext,
}: {
  versions: RenderVersion[];
  activeVersion: string;
  comments: Comment[];
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const current = versions.find((v) => v.version === activeVersion);
  const pinnedComments = comments.filter((c) => c.pinX !== null && c.pinY !== null);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose, onPrev, onNext]);

  return createPortal(
    <div className={styles.lightboxOverlay} onClick={onClose}>
      <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.lightboxClose} onClick={onClose} title="Закрыть (Esc)">
          <Icons.X size={18} />
        </button>

        {versions.length > 1 && (
          <>
            <button className={[styles.lightboxNav, styles.lightboxNavL].join(' ')} onClick={onPrev} title="Предыдущая (←)">
              <Icons.ChevL size={20} />
            </button>
            <button className={[styles.lightboxNav, styles.lightboxNavR].join(' ')} onClick={onNext} title="Следующая (→)">
              <Icons.ChevR size={20} />
            </button>
          </>
        )}

        <div className={styles.lightboxImgWrap}>
          {current?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={current.url} alt={activeVersion} className={styles.lightboxImg} />
          ) : (
            <div className={styles.lightboxPlaceholder} />
          )}

          {/* Пины в лайтбоксе */}
          {pinnedComments.map((c, i) => (
            <div
              key={c.id}
              className={styles.pin}
              style={{ left: `${c.pinX}%`, top: `${c.pinY}%` }}
              onMouseEnter={() => setHovered(c.id)}
              onMouseLeave={() => setHovered(null)}
            >
              {i + 1}
              {hovered === c.id && (
                <div className={styles.pinTooltip}>{c.body}</div>
              )}
            </div>
          ))}
        </div>

        <div className={styles.lightboxVersion}>{activeVersion}</div>
      </div>
    </div>,
    document.body
  );
}

export default function RenderPreview({
  versions,
  comments,
  canDeleteVersion = false,
  onVersionDeleted,
  onAddPin,
}: RenderPreviewProps) {
  const [activeVersion, setActiveVersion] = useState(
    versions.length > 0 ? versions[versions.length - 1].version : ''
  );
  const [hoveredPin, setHoveredPin] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [pinMode, setPinMode] = useState(false);
  const [pendingPin, setPendingPin] = useState<{ x: number; y: number } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const currentVersion = versions.find((v) => v.version === activeVersion);
  const pinnedComments = comments.filter((c) => c.pinX !== null && c.pinY !== null);

  const versionIndex = versions.findIndex((v) => v.version === activeVersion);

  const goNext = () => {
    const next = versions[(versionIndex + 1) % versions.length];
    if (next) setActiveVersion(next.version);
  };
  const goPrev = () => {
    const prev = versions[(versionIndex - 1 + versions.length) % versions.length];
    if (prev) setActiveVersion(prev.version);
  };

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onAddPin) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pinX = ((e.clientX - rect.left) / rect.width) * 100;
    const pinY = ((e.clientY - rect.top) / rect.height) * 100;
    setPendingPin({ x: pinX, y: pinY });
    setPinMode(false);
    onAddPin(pinX, pinY);
  };

  const handleDeleteVersion = async (versionId: string, shotId: string) => {
    if (deletingId) return;
    setDeletingId(versionId);
    try {
      const res = await fetch(`/api/shots/${shotId}/versions/${versionId}`, { method: 'DELETE' });
      if (res.ok) {
        onVersionDeleted?.(versionId);
        // Switch to another version if active was deleted
        const remaining = versions.filter((v) => v.id !== versionId);
        if (remaining.length > 0) {
          setActiveVersion(remaining[remaining.length - 1].version);
        }
      } else {
        toast.error('Не удалось удалить версию');
      }
    } catch {
      toast.error('Ошибка сети');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      {/* Image with pins */}
      <div
        className={[styles.preview, pinMode ? styles.pinModeActive : ''].join(' ')}
        onClick={pinMode ? handleImageClick : undefined}
        title={pinMode ? 'Кликните на рендер чтобы добавить пин' : undefined}
      >
        {currentVersion?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={currentVersion.url}
            alt={`Рендер ${activeVersion}`}
            className={styles.img}
            onClick={!pinMode ? () => setLightboxOpen(true) : undefined}
            style={{ cursor: pinMode ? 'crosshair' : 'zoom-in' }}
          />
        ) : (
          <div
            className={styles.placeholder}
            style={{ background: 'linear-gradient(135deg, #2a3a4a, #1a2a3a)' }}
          />
        )}

        <span className={styles.watermark}>{activeVersion} · OAK3D</span>

        {/* Pin mode button */}
        {onAddPin && (
          <button
            className={[styles.pinModeBtn, pinMode ? styles.pinModeBtnActive : ''].join(' ')}
            onClick={(e) => { e.stopPropagation(); setPinMode((v) => !v); }}
            title={pinMode ? 'Отменить добавление пина' : 'Добавить пин на рендер'}
          >
            <Icons.Dot size={8} />
          </button>
        )}

        {/* Pending pin */}
        {pendingPin && (
          <div
            className={[styles.pin, styles.pinPending].join(' ')}
            style={{ left: `${pendingPin.x}%`, top: `${pendingPin.y}%` }}
          />
        )}

        {/* Existing pins */}
        {pinnedComments.map((comment, i) => (
          <div
            key={comment.id}
            className={styles.pin}
            style={{ left: `${comment.pinX}%`, top: `${comment.pinY}%` }}
            onMouseEnter={() => setHoveredPin(comment.id)}
            onMouseLeave={() => setHoveredPin(null)}
            title={comment.body}
          >
            {i + 1}
            {hoveredPin === comment.id && (
              <div className={styles.pinTooltip}>{comment.body}</div>
            )}
          </div>
        ))}
      </div>

      {/* Version switcher */}
      {versions.length > 0 && (
        <div className={styles.versions}>
          {versions.map((v) => (
            <div key={v.id} className={styles.versionItem}>
              <button
                className={[styles.versionBtn, v.version === activeVersion ? styles.active : ''].join(' ')}
                onClick={() => setActiveVersion(v.version)}
              >
                {v.version}
              </button>
              {canDeleteVersion && v.version === activeVersion && versions.length > 1 && (
                <button
                  className={styles.versionDelete}
                  title="Удалить эту версию"
                  disabled={deletingId === v.id}
                  onClick={() => {
                    if (confirm(`Удалить версию ${v.version}?`)) {
                      handleDeleteVersion(v.id, v.shotId);
                    }
                  }}
                >
                  <Icons.X size={10} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <Lightbox
          versions={versions}
          activeVersion={activeVersion}
          comments={comments}
          onClose={() => setLightboxOpen(false)}
          onPrev={goPrev}
          onNext={goNext}
        />
      )}
    </div>
  );
}
