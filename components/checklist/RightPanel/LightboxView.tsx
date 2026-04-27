'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icons } from '@/components/icons';
import type { RenderVersion, Comment } from '@/types';
import styles from './LightboxView.module.css';

function tooltipText(body: string): string {
  const hasLetters = /\p{L}|\p{N}/u.test(body);
  return hasLetters ? body : 'Без описания';
}

interface LightboxViewProps {
  versions: RenderVersion[];
  activeVersion: string;
  comments: Comment[];
  canPin?: boolean;
  highlightedCommentId?: string | null;
  onHighlight?: (id: string | null) => void;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onPinSubmit?: (body: string, x: number, y: number) => Promise<unknown>;
}

const MIN_SCALE = 1;
const MAX_SCALE = 6;
const SCALE_STEP = 0.0015;

export default function LightboxView({
  versions,
  activeVersion,
  comments,
  canPin = false,
  highlightedCommentId,
  onHighlight,
  onClose,
  onPrev,
  onNext,
  onPinSubmit,
}: LightboxViewProps) {
  const current = versions.find((v) => v.version === activeVersion);
  const pinnedComments = comments.filter((c) => c.pinX !== null && c.pinY !== null);

  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [pinMode, setPinMode] = useState(false);
  const [pendingPin, setPendingPin] = useState<{ x: number; y: number } | null>(null);
  const [draft, setDraft] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const wrapRef = useRef<HTMLDivElement>(null);
  const panState = useRef<{ active: boolean; startX: number; startY: number; baseX: number; baseY: number }>({
    active: false, startX: 0, startY: 0, baseX: 0, baseY: 0,
  });
  const formRef = useRef<HTMLDivElement>(null);

  // Reset zoom and pin при смене версии
  useEffect(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
    setPendingPin(null);
    setDraft('');
    setPinMode(false);
  }, [activeVersion]);

  // Esc / стрелки
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (pendingPin) return; // в режиме редактирования коммента не трогаем стрелки
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose, onPrev, onNext, pendingPin]);

  // Wheel zoom — относительно курсора (точка под курсором остаётся на месте)
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!wrapRef.current) return;
    e.preventDefault();
    const rect = wrapRef.current.getBoundingClientRect();
    // курсор в координатах wrapper'а
    const cx = e.clientX - rect.left - rect.width / 2;
    const cy = e.clientY - rect.top - rect.height / 2;

    const delta = -e.deltaY * SCALE_STEP * scale;
    const next = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale + delta));
    if (next === scale) return;

    // компенсация translate так, чтобы точка под курсором осталась на месте
    const ratio = next / scale;
    const newTx = cx - (cx - translate.x) * ratio;
    const newTy = cy - (cy - translate.y) * ratio;

    setScale(next);
    if (next === 1) {
      setTranslate({ x: 0, y: 0 });
    } else {
      setTranslate({ x: newTx, y: newTy });
    }
  };

  const resetZoom = () => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  };

  // Pan через перетаскивание (только когда scale > 1 и не в pin-режиме)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pinMode) return;
    if (scale <= 1) return;
    panState.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      baseX: translate.x,
      baseY: translate.y,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!panState.current.active) return;
    const dx = e.clientX - panState.current.startX;
    const dy = e.clientY - panState.current.startY;
    setTranslate({ x: panState.current.baseX + dx, y: panState.current.baseY + dy });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (panState.current.active) {
      panState.current.active = false;
      // На некоторых event-флоу (отмена tap, перехват системой) pointer
      // capture уже освобождён к этому моменту. releasePointerCapture
      // на освобождённом id бросает NotFoundError — оборачиваем в try.
      try {
        const el = e.currentTarget as HTMLElement;
        if (el.hasPointerCapture?.(e.pointerId)) {
          el.releasePointerCapture(e.pointerId);
        }
      } catch {
        // ignore
      }
    }
  };

  // Click для установки пина (учитывает текущий transform — getBoundingClientRect возвращает реальный rect)
  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!pinMode || !canPin) return;
    if (panState.current.active) return; // защита от случайного click при drag
    const target = e.currentTarget.querySelector(`.${styles.img}`) as HTMLImageElement | null;
    const rect = target?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    if (x < 0 || x > 100 || y < 0 || y > 100) return;
    setPendingPin({ x, y });
    setPinMode(false);
    // фокус в textarea — через requestAnimationFrame после рендера
    requestAnimationFrame(() => {
      formRef.current?.querySelector('textarea')?.focus();
    });
  };

  const submitPin = async () => {
    if (!pendingPin || !draft.trim() || !onPinSubmit || submitting) return;
    setSubmitting(true);
    try {
      const result = await onPinSubmit(draft.trim(), pendingPin.x, pendingPin.y);
      if (result) {
        setPendingPin(null);
        setDraft('');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const cancelPendingPin = () => {
    setPendingPin(null);
    setDraft('');
  };

  const transformStyle: React.CSSProperties = {
    transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
    cursor: pinMode
      ? 'crosshair'
      : scale > 1
        ? (panState.current.active ? 'grabbing' : 'grab')
        : 'default',
  };

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
        {/* Top toolbar */}
        <div className={styles.topToolbar}>
          {canPin && onPinSubmit && (
            <button
              className={[styles.toolBtn, pinMode ? styles.toolBtnActive : ''].join(' ')}
              onClick={() => setPinMode((v) => !v)}
              title={pinMode ? 'Отменить установку пина' : 'Поставить пин (клик по рендеру)'}
            >
              <Icons.Dot size={8} /> {pinMode ? 'Кликните на рендер' : 'Пин'}
            </button>
          )}
          <div className={styles.zoomControls}>
            <span className={styles.zoomLabel}>{Math.round(scale * 100)}%</span>
            <button
              className={styles.toolBtn}
              onClick={resetZoom}
              disabled={scale === 1}
              title="Сбросить масштаб (1:1)"
            >
              1:1
            </button>
          </div>
          <button className={styles.closeBtn} onClick={onClose} title="Закрыть (Esc)">
            <Icons.X size={18} />
          </button>
        </div>

        {versions.length > 1 && (
          <>
            <button className={[styles.nav, styles.navL].join(' ')} onClick={onPrev} title="Предыдущая (←)">
              <Icons.ChevL size={20} />
            </button>
            <button className={[styles.nav, styles.navR].join(' ')} onClick={onNext} title="Следующая (→)">
              <Icons.ChevR size={20} />
            </button>
          </>
        )}

        <div
          ref={wrapRef}
          className={styles.imgWrap}
          onWheel={handleWheel}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onClick={handleImageClick}
        >
          <div className={styles.imgInner} style={transformStyle}>
            {current?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={current.url} alt={activeVersion} className={styles.img} draggable={false} />
            ) : (
              <div className={styles.placeholder} />
            )}

            {/* Pending pin */}
            {pendingPin && (
              <div
                className={[styles.pin, styles.pinPending].join(' ')}
                style={{ left: `${pendingPin.x}%`, top: `${pendingPin.y}%` }}
              />
            )}

            {/* Existing pins */}
            {pinnedComments.map((c, i) => {
              const isActive = highlightedCommentId === c.id;
              return (
                <div
                  key={c.id}
                  className={[styles.pin, isActive ? styles.pinActive : ''].join(' ')}
                  style={{ left: `${c.pinX}%`, top: `${c.pinY}%` }}
                  onMouseEnter={() => onHighlight?.(c.id)}
                  onMouseLeave={() => onHighlight?.(null)}
                  onClick={(e) => e.stopPropagation()}
                >
                  {i + 1}
                  {isActive && (
                    <div className={styles.pinTooltip}>{tooltipText(c.body)}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Pin comment composer */}
        {pendingPin && onPinSubmit && (
          <div ref={formRef} className={styles.pinForm} onClick={(e) => e.stopPropagation()}>
            <div className={styles.pinFormHeader}>
              <span className={styles.pinFormDot} />
              <span>Комментарий к пину</span>
              <button type="button" className={styles.pinFormClear} onClick={cancelPendingPin} title="Отменить">
                <Icons.X size={11} /> Отменить
              </button>
            </div>
            <textarea
              className={styles.pinFormInput}
              placeholder="Опишите проблему в этой точке…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  submitPin();
                }
                if (e.key === 'Escape') {
                  e.preventDefault();
                  cancelPendingPin();
                }
              }}
              rows={2}
              disabled={submitting}
            />
            <div className={styles.pinFormActions}>
              <button
                type="button"
                className={styles.pinFormSubmit}
                disabled={!draft.trim() || submitting}
                onClick={submitPin}
              >
                {submitting ? 'Отправка…' : 'Отправить'}
              </button>
            </div>
          </div>
        )}

        <div className={styles.version}>{activeVersion}</div>
      </div>
    </div>,
    document.body,
  );
}
