'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icons } from '@/components/icons';
import type { RenderVersion, Comment } from '@/types';
import { threadStatus, STATUS_COLOR } from '@/lib/pin-status';
import CommentsPanel from './CommentsPanel';
import styles from './LightboxView.module.css';

function tooltipText(body: string): string {
  const hasLetters = /\p{L}|\p{N}/u.test(body);
  return hasLetters ? body : 'Без описания';
}

interface LightboxViewProps {
  versions: RenderVersion[];
  activeVersion: string;
  comments: Comment[];
  shotCode?: string;
  shotTitle?: string;
  canPin?: boolean;
  highlightedCommentId?: string | null;
  onHighlight?: (id: string | null) => void;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onVersionSelect?: (version: string) => void;
  onPinSubmit?: (body: string, x: number, y: number) => Promise<unknown>;
  // Управление комментариями в правой панели
  currentUser?: { id: string; name: string };
  currentUserRole?: string;
  shotId?: string;
  onCommentSubmit?: (body: string) => void;
  onCommentDelete?: (commentId: string) => void;
  onCommentReply?: (parentId: string, body: string) => void;
  onCommentEdit?: (commentId: string, body: string) => void;
}

const MIN_SCALE = 1;
const MAX_SCALE = 6;
const SCALE_STEP = 0.0015;

export default function LightboxView({
  versions,
  activeVersion,
  comments,
  shotCode,
  shotTitle,
  canPin = false,
  highlightedCommentId,
  onHighlight,
  onClose,
  onPrev,
  onNext,
  onVersionSelect,
  onPinSubmit,
  currentUser,
  currentUserRole,
  shotId,
  onCommentSubmit,
  onCommentDelete,
  onCommentReply,
  onCommentEdit,
}: LightboxViewProps) {
  const current = versions.find((v) => v.version === activeVersion);
  const pinnedComments = comments.filter((c) => c.pinX !== null && c.pinY !== null);

  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [pinMode, setPinMode] = useState(false);
  const [pendingPin, setPendingPin] = useState<{ x: number; y: number } | null>(null);
  const [sidePanelOpen, setSidePanelOpen] = useState(true);
  // Скрытие пинов — для чистого просмотра пикселей под маркером
  const [pinsVisible, setPinsVisible] = useState(true);

  const wrapRef = useRef<HTMLDivElement>(null);
  const panState = useRef<{ active: boolean; startX: number; startY: number; baseX: number; baseY: number }>({
    active: false, startX: 0, startY: 0, baseX: 0, baseY: 0,
  });
  const cancelPendingPinRef = useRef<(() => void) | null>(null);

  // Reset zoom and pin при смене версии
  useEffect(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
    setPendingPin(null);
    setPinMode(false);
  }, [activeVersion]);

  // Hotkeys: Esc / стрелки / P (toggle pin mode)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // если фокус в textarea/input — отдаём приоритет редактированию
      const target = e.target as HTMLElement | null;
      const isEditing = target?.tagName === 'TEXTAREA' || target?.tagName === 'INPUT';

      if (e.key === 'Escape') {
        if (pendingPin) cancelPendingPinRef.current?.();
        else onClose();
        return;
      }
      if (isEditing || pendingPin) return; // стрелки/P не трогаем во время ввода

      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
      if ((e.key === 'p' || e.key === 'P' || e.key === 'з' || e.key === 'З') && canPin && onPinSubmit) {
        e.preventDefault();
        setPinMode((v) => !v);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose, onPrev, onNext, pendingPin, canPin, onPinSubmit]);

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
    // фокус в textarea правой панели — через requestAnimationFrame после рендера
    requestAnimationFrame(() => {
      document.querySelector<HTMLTextAreaElement>(`.${styles.sidePanel} textarea`)?.focus();
    });
  };

  const cancelPendingPin = () => {
    setPendingPin(null);
  };
  cancelPendingPinRef.current = cancelPendingPin;

  // Композер в правой панели вызывает один onSubmit(body). Здесь решаем,
  // что делать: если есть pendingPin — отправляем коммент с координатами,
  // иначе — обычный коммент без пина.
  const handlePanelSubmit = async (body: string) => {
    if (pendingPin && onPinSubmit) {
      const result = await onPinSubmit(body, pendingPin.x, pendingPin.y);
      if (result) setPendingPin(null);
    } else if (onCommentSubmit) {
      onCommentSubmit(body);
    }
  };

  const transformStyle: React.CSSProperties = {
    transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
    cursor: pinMode
      ? 'crosshair'
      : scale > 1
        ? (panState.current.active ? 'grabbing' : 'grab')
        : 'default',
  };

  const canShowSidePanel = !!onCommentSubmit && !!currentUser;
  const showSidePanel = canShowSidePanel && sidePanelOpen;

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={[styles.content, showSidePanel ? styles.contentWithSide : ''].join(' ')}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar: shot info | version tabs | tools */}
        <div className={styles.topBar}>
          <div className={styles.shotInfo}>
            {shotCode && <span className={styles.shotInfoCode}>{shotCode}</span>}
            {shotTitle && <span className={styles.shotInfoTitle}>{shotTitle}</span>}
          </div>

          {versions.length > 0 && (
            <div className={styles.versionTabs} role="tablist" aria-label="Версии рендера">
              {versions.map((v) => (
                <button
                  key={v.id}
                  role="tab"
                  aria-selected={v.version === activeVersion}
                  className={[
                    styles.versionTab,
                    v.version === activeVersion ? styles.versionTabActive : '',
                  ].join(' ')}
                  onClick={() => onVersionSelect?.(v.version)}
                  type="button"
                >
                  {v.version}
                </button>
              ))}
            </div>
          )}

          <div className={styles.topActions}>
            {canPin && onPinSubmit && (
              <button
                className={[styles.toolBtn, pinMode ? styles.toolBtnActive : ''].join(' ')}
                onClick={() => {
                  setPinMode((v) => {
                    // Включаем pin-mode — показываем пины (иначе непонятно
                    // где уже стоят и где можно поставить)
                    if (!v) setPinsVisible(true);
                    return !v;
                  });
                }}
                title={pinMode ? 'Отменить установку пина (P)' : 'Поставить пин (P)'}
              >
                <Icons.Dot size={8} /> {pinMode ? 'Кликните на рендер' : 'Добавить пин'}
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
            <button
              className={[styles.iconBtn, pinsVisible ? styles.iconBtnActive : ''].join(' ')}
              onClick={() => setPinsVisible((v) => !v)}
              title={pinsVisible ? 'Скрыть пины (для просмотра под маркерами)' : 'Показать пины'}
              aria-pressed={pinsVisible}
            >
              <Icons.Eye size={16} />
            </button>
            {canShowSidePanel && (
              <button
                className={[styles.iconBtn, sidePanelOpen ? styles.iconBtnActive : ''].join(' ')}
                onClick={() => setSidePanelOpen((v) => !v)}
                title={sidePanelOpen ? 'Скрыть комментарии' : 'Показать комментарии'}
                aria-pressed={sidePanelOpen}
              >
                <Icons.Msg size={16} />
              </button>
            )}
            <button className={styles.closeBtn} onClick={onClose} title="Закрыть (Esc)">
              <Icons.X size={18} />
            </button>
          </div>
        </div>

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
            {pinsVisible && pendingPin && (
              <div
                className={[styles.pin, styles.pinPending].join(' ')}
                style={{ left: `${pendingPin.x}%`, top: `${pendingPin.y}%` }}
              />
            )}

            {/* Existing pins — окрашены по статусу треда */}
            {pinsVisible && pinnedComments.map((c, i) => {
              const isActive = highlightedCommentId === c.id;
              const status = threadStatus(c, comments) ?? 'open';
              const color = STATUS_COLOR[status];
              return (
                <div
                  key={c.id}
                  className={[styles.pin, styles.pinStatus, isActive ? styles.pinStatusActive : ''].join(' ')}
                  style={{
                    left: `${c.pinX}%`,
                    top: `${c.pinY}%`,
                    background: color,
                    borderColor: '#fff',
                    color: '#fff',
                  }}
                  data-pin-status={status}
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

        {/* Right side panel — комментарии + агрегатор + композер */}
        {showSidePanel && (
          <aside className={styles.sidePanel} onClick={(e) => e.stopPropagation()}>
            <CommentsPanel
              comments={comments}
              currentUserId={currentUser?.id}
              currentUserRole={currentUserRole}
              currentUser={currentUser}
              pendingPin={pendingPin}
              highlightedCommentId={highlightedCommentId ?? null}
              onPinClear={cancelPendingPin}
              onHighlight={onHighlight}
              onSubmit={handlePanelSubmit}
              onDelete={onCommentDelete}
              onReply={onCommentReply}
              onEdit={onCommentEdit}
              shotId={shotId}
            />
          </aside>
        )}

        {/* Hotkey hint footer */}
        <div className={styles.hotkeys}>
          {canPin && onPinSubmit && (
            <span className={styles.hotkey}>
              <kbd className={styles.kbd}>P</kbd> Пин
            </span>
          )}
          {versions.length > 1 && (
            <span className={styles.hotkey}>
              <kbd className={styles.kbd}>←</kbd>
              <kbd className={styles.kbd}>→</kbd> Версия
            </span>
          )}
          <span className={styles.hotkey}>
            <kbd className={styles.kbd}>scroll</kbd> Зум
          </span>
          <span className={styles.hotkey}>
            <kbd className={styles.kbd}>Esc</kbd> Закрыть
          </span>
        </div>
      </div>
    </div>,
    document.body,
  );
}
