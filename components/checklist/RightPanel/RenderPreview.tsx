'use client';

import { useState } from 'react';
import type { RenderVersion, Comment } from '@/types';
import styles from './RenderPreview.module.css';

interface RenderPreviewProps {
  versions: RenderVersion[];
  comments: Comment[];
}

export default function RenderPreview({ versions, comments }: RenderPreviewProps) {
  const [activeVersion, setActiveVersion] = useState(
    versions.length > 0 ? versions[versions.length - 1].version : 'v012'
  );
  const [hoveredPin, setHoveredPin] = useState<string | null>(null);

  const currentVersion = versions.find((v) => v.version === activeVersion);
  const pinnedComments = comments.filter((c) => c.pinX !== null && c.pinY !== null);

  return (
    <div>
      {/* Изображение с пинами */}
      <div className={styles.preview}>
        {currentVersion?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={currentVersion.url}
            alt={`Рендер ${activeVersion}`}
            className={styles.img}
          />
        ) : (
          <div
            className={styles.placeholder}
            style={{ background: 'linear-gradient(135deg, #2a3a4a, #1a2a3a)' }}
          />
        )}

        {/* Водяной знак */}
        <span className={styles.watermark}>
          {activeVersion} · OAK3D
        </span>

        {/* Пины комментариев */}
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

      {/* Переключатель версий */}
      {versions.length > 0 && (
        <div className={styles.versions}>
          {versions.map((v) => (
            <button
              key={v.id}
              className={[styles.versionBtn, v.version === activeVersion ? styles.active : ''].join(' ')}
              onClick={() => setActiveVersion(v.version)}
            >
              {v.version}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
