'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Modal } from '@/components/ui';
import styles from './AvatarCropModal.module.css';

interface AvatarCropModalProps {
  file: File;
  onCropped: (blob: Blob, fileName: string) => void;
  onClose: () => void;
}

const FRAME_SIZE = 320;     // диаметр круглого фрейма в превью
const OUTPUT_SIZE = 512;    // размер итоговой аватарки в пикселях
const MIN_ZOOM = 1;         // 1 = «вписано» (минимальный размер изображения = FRAME_SIZE)
const MAX_ZOOM = 4;

export function AvatarCropModal({ file, onCropped, onClose }: AvatarCropModalProps) {
  const [imgUrl, setImgUrl] = useState<string>('');
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [busy, setBusy] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ active: boolean; startX: number; startY: number; baseX: number; baseY: number }>({
    active: false, startX: 0, startY: 0, baseX: 0, baseY: 0,
  });

  // Загружаем файл как объектный URL и Image()
  useEffect(() => {
    const url = URL.createObjectURL(file);
    setImgUrl(url);
    const el = new Image();
    el.onload = () => {
      setImg(el);
      setZoom(1);
      setOffset({ x: 0, y: 0 });
    };
    el.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Базовый scale — чтобы меньшая сторона ровно вписалась во фрейм
  const baseScale = useMemo(() => {
    if (!img) return 1;
    return FRAME_SIZE / Math.min(img.naturalWidth, img.naturalHeight);
  }, [img]);

  // Итоговый размер картинки на экране при текущем zoom
  const displayed = useMemo(() => {
    if (!img) return { w: FRAME_SIZE, h: FRAME_SIZE };
    return {
      w: img.naturalWidth * baseScale * zoom,
      h: img.naturalHeight * baseScale * zoom,
    };
  }, [img, baseScale, zoom]);

  // Ограничения offset: картинка не должна выходить за пределы фрейма
  const clampOffset = (x: number, y: number) => {
    const maxX = 0;
    const minX = FRAME_SIZE - displayed.w;
    const maxY = 0;
    const minY = FRAME_SIZE - displayed.h;
    return {
      x: Math.min(maxX, Math.max(minX, x)),
      y: Math.min(maxY, Math.max(minY, y)),
    };
  };

  // Когда меняется zoom — re-clamp offset
  useEffect(() => {
    setOffset((prev) => {
      const next = clampOffset(prev.x, prev.y);
      // Центрировать при первом mount (offset {0,0} но displayed > FRAME)
      if (prev.x === 0 && prev.y === 0 && displayed.w > FRAME_SIZE) {
        return {
          x: (FRAME_SIZE - displayed.w) / 2,
          y: (FRAME_SIZE - displayed.h) / 2,
        };
      }
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayed.w, displayed.h]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      baseX: offset.x,
      baseY: offset.y,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setOffset(clampOffset(dragRef.current.baseX + dx, dragRef.current.baseY + dy));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current.active = false;
    try {
      const el = e.currentTarget as HTMLElement;
      if (el.hasPointerCapture?.(e.pointerId)) el.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const next = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom - e.deltaY * 0.001));
    setZoom(next);
  };

  // Применить — экспортируем кроп в blob
  const handleApply = async () => {
    if (!img || busy) return;
    setBusy(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = OUTPUT_SIZE;
      canvas.height = OUTPUT_SIZE;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas не поддерживается');

      // Натуральные координаты source-региона на исходной картинке
      const totalScale = baseScale * zoom;
      const sx = -offset.x / totalScale;
      const sy = -offset.y / totalScale;
      const sSize = FRAME_SIZE / totalScale;

      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
      ctx.drawImage(img, sx, sy, sSize, sSize, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

      const blob = await new Promise<Blob | null>((res) =>
        canvas.toBlob(res, 'image/jpeg', 0.92),
      );
      if (!blob) throw new Error('Не удалось сжать изображение');

      // имя файла — заменяем расширение на .jpg для корректного MIME
      const name = file.name.replace(/\.[^.]+$/, '') + '.jpg';
      onCropped(blob, name);
    } finally {
      setBusy(false);
    }
  };

  const footer = (
    <>
      <Button type="button" variant="ghost" size="md" onClick={onClose} disabled={busy}>Отмена</Button>
      <Button type="button" variant="primary" size="md" onClick={handleApply} loading={busy}>
        Применить
      </Button>
    </>
  );

  return (
    <Modal
      title="Обрезка аватарки"
      subtitle="Перетаскивайте чтобы позиционировать, прокручивайте чтобы масштабировать"
      onClose={onClose}
      footer={footer}
      size="md"
    >
      <div className={styles.wrap}>
        <div
          ref={frameRef}
          className={styles.frame}
          style={{ width: FRAME_SIZE, height: FRAME_SIZE }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onWheel={handleWheel}
        >
          {imgUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imgUrl}
              alt="Preview"
              className={styles.img}
              draggable={false}
              style={{
                width: displayed.w,
                height: displayed.h,
                transform: `translate(${offset.x}px, ${offset.y}px)`,
              }}
            />
          )}
          <div className={styles.mask} />
        </div>

        <div className={styles.zoomRow}>
          <span className={styles.zoomLabel}>Масштаб</span>
          <input
            type="range"
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className={styles.slider}
          />
          <span className={styles.zoomValue}>{zoom.toFixed(1)}x</span>
        </div>
      </div>
    </Modal>
  );
}
