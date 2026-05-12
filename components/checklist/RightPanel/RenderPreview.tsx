'use client';

import { useState } from 'react';
import { Icons } from '@/components/icons';
import { toast } from '@/components/ui/Toast/toastStore';
import type { RenderVersion, Comment } from '@/types';
import LightboxView from './LightboxView';
import styles from './RenderPreview.module.css';

// Если body состоит только из эмодзи/символов без слов — показывать заглушку.
function tooltipText(body: string): string {
  const hasLetters = /\p{L}|\p{N}/u.test(body);
  return hasLetters ? body : 'Без описания';
}

interface RenderPreviewProps {
  versions: RenderVersion[];
  comments: Comment[];
  shotCode?: string;
  shotTitle?: string;
  canDeleteVersion?: boolean;
  canPin?: boolean;
  pendingPin?: { x: number; y: number } | null;
  highlightedCommentId?: string | null;
  onHighlight?: (commentId: string | null) => void;
  onPinSet?: (pinX: number, pinY: number) => void;
  onPinClear?: () => void;
  onLightboxPinSubmit?: (body: string, x: number, y: number) => Promise<unknown>;
  onVersionDeleted?: (id: string) => void;
  // Управление комментариями в правой панели лайтбокса
  currentUser?: { id: string; name: string };
  currentUserRole?: string;
  shotId?: string;
  onCommentSubmit?: (body: string) => void;
  onCommentDelete?: (commentId: string) => void;
  onCommentReply?: (parentId: string, body: string) => void;
  onCommentEdit?: (commentId: string, body: string) => void;
}

export default function RenderPreview({
  versions,
  comments,
  shotCode,
  shotTitle,
  canDeleteVersion = false,
  canPin = false,
  pendingPin = null,
  highlightedCommentId = null,
  onHighlight,
  onPinSet,
  onPinClear,
  onLightboxPinSubmit,
  onVersionDeleted,
  currentUser,
  currentUserRole,
  shotId,
  onCommentSubmit,
  onCommentDelete,
  onCommentReply,
  onCommentEdit,
}: RenderPreviewProps) {
  const [activeVersion, setActiveVersion] = useState(
    versions.length > 0 ? versions[versions.length - 1].version : ''
  );
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [pinMode, setPinMode] = useState(false);
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
    if (!pinMode || !onPinSet) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pinX = ((e.clientX - rect.left) / rect.width) * 100;
    const pinY = ((e.clientY - rect.top) / rect.height) * 100;
    onPinSet(pinX, pinY);
    setPinMode(false);
  };

  const handleDeleteVersion = async (versionId: string, shotId: string) => {
    if (deletingId) return;
    setDeletingId(versionId);
    try {
      const res = await fetch(`/api/shots/${shotId}/versions/${versionId}`, { method: 'DELETE' });
      if (res.ok) {
        onVersionDeleted?.(versionId);
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
        title={pinMode ? 'Кликните на рендер чтобы поставить пин' : undefined}
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

        {/* Pin mode toggle — visible only for reviewers (canPin) */}
        {canPin && onPinSet && (
          <button
            className={[styles.pinModeBtn, pinMode ? styles.pinModeBtnActive : ''].join(' ')}
            onClick={(e) => { e.stopPropagation(); setPinMode((v) => !v); }}
            title={pinMode ? 'Отменить добавление пина' : 'Поставить пин на рендер'}
          >
            <Icons.Dot size={8} /> {pinMode ? 'Кликните на рендер' : 'Пин'}
          </button>
        )}

        {/* Pending pin (visible until comment submitted) */}
        {pendingPin && (
          <>
            <div
              className={[styles.pin, styles.pinPending].join(' ')}
              style={{ left: `${pendingPin.x}%`, top: `${pendingPin.y}%` }}
            />
            <button
              type="button"
              className={styles.pinPendingClear}
              style={{ left: `${pendingPin.x}%`, top: `${pendingPin.y}%` }}
              onClick={(e) => { e.stopPropagation(); onPinClear?.(); }}
              title="Снять временный пин"
            >
              <Icons.X size={9} />
            </button>
          </>
        )}

        {/* Existing pins from comments */}
        {pinnedComments.map((comment, i) => {
          const isActive = highlightedCommentId === comment.id;
          return (
            <div
              key={comment.id}
              className={[styles.pin, isActive ? styles.pinActive : ''].join(' ')}
              style={{ left: `${comment.pinX}%`, top: `${comment.pinY}%` }}
              onMouseEnter={() => onHighlight?.(comment.id)}
              onMouseLeave={() => onHighlight?.(null)}
              onClick={(e) => {
                e.stopPropagation();
                const el = document.querySelector(`[data-comment-id="${comment.id}"]`);
                el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                onHighlight?.(comment.id);
                window.setTimeout(() => onHighlight?.(null), 1500);
              }}
              title={tooltipText(comment.body)}
            >
              {i + 1}
              {isActive && (
                <div className={styles.pinTooltip}>{tooltipText(comment.body)}</div>
              )}
            </div>
          );
        })}
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

      {/* Lightbox with zoom + pin support */}
      {lightboxOpen && (
        <LightboxView
          versions={versions}
          activeVersion={activeVersion}
          comments={comments}
          shotCode={shotCode}
          shotTitle={shotTitle}
          canPin={canPin}
          highlightedCommentId={highlightedCommentId}
          onHighlight={onHighlight}
          onClose={() => setLightboxOpen(false)}
          onPrev={goPrev}
          onNext={goNext}
          onVersionSelect={setActiveVersion}
          onPinSubmit={onLightboxPinSubmit}
          currentUser={currentUser}
          currentUserRole={currentUserRole}
          shotId={shotId}
          onCommentSubmit={onCommentSubmit}
          onCommentDelete={onCommentDelete}
          onCommentReply={onCommentReply}
          onCommentEdit={onCommentEdit}
        />
      )}
    </div>
  );
}
