import { Icons } from '@/components/icons';
import { Badge, Button, OakRing } from '@/components/ui';
import type { Shot } from '@/types';
import { shotStatusBadgeKind, shotStatusLabel } from '@/lib/utils';
import styles from './ShotHeader.module.css';

interface ShotHeaderProps {
  shot: Shot;
  progress: number;
  latestVersion?: string;
  onUploadRender?: () => void;
  onSendReview?: () => void;
}

export default function ShotHeader({
  shot,
  progress,
  latestVersion = 'v012',
  onUploadRender,
  onSendReview,
}: ShotHeaderProps) {
  return (
    <div className={styles.header}>
      {/* Превью шота */}
      <div className={styles.thumb}>
        <div
          className={styles.thumbPlaceholder}
          style={{ background: 'linear-gradient(135deg, #3a5a7a, #1a2a3a)' }}
        />
        <span className={styles.versionBadge}>{latestVersion} · IPR</span>
      </div>

      {/* Метаданные */}
      <div className={styles.meta}>
        <div className={styles.codeRow}>
          <span className={styles.code}>{shot.code}</span>
          <Badge kind={shotStatusBadgeKind(shot.status)} size="sm" dot>
            {shotStatusLabel(shot.status)}
          </Badge>
        </div>
        <h1 className={styles.title}>{shot.title}</h1>
        <div className={styles.infoRow}>
          <span className={styles.infoItem}>
            <Icons.Cube size={13} />
            {shot.software}
          </span>
          <span className={styles.infoItem}>
            <Icons.Image size={13} />
            {shot.resolution}
          </span>
          {shot.dueDate && (
            <span className={styles.infoItem}>
              <Icons.Calendar size={13} />
              {new Date(shot.dueDate).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' })}
            </span>
          )}
        </div>
      </div>

      {/* Прогресс + кнопки */}
      <div className={styles.right}>
        <div className={styles.progressBlock}>
          <OakRing value={progress} size={64} stroke={4} segments={4} />
          <span className={styles.progressLabel}>прогресс</span>
        </div>
        <div className={styles.actions}>
          <Button
            variant="secondary"
            size="sm"
            icon={<Icons.Upload size={14} />}
            onClick={onUploadRender}
          >
            Загрузить рендер
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Icons.Eye size={14} />}
            onClick={onSendReview}
          >
            На ревью
          </Button>
        </div>
      </div>
    </div>
  );
}
