import styles from './Skeleton.module.css';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  radius?: number | string;
  className?: string;
}

export function Skeleton({ width, height = 14, radius = 6, className }: SkeletonProps) {
  return (
    <span
      className={[styles.skeleton, className].filter(Boolean).join(' ')}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius: typeof radius === 'number' ? `${radius}px` : radius,
      }}
      aria-hidden="true"
    />
  );
}

export function SkeletonText({ lines = 1, className }: { lines?: number; className?: string }) {
  return (
    <div className={[styles.textBlock, className].filter(Boolean).join(' ')}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          width={i === lines - 1 && lines > 1 ? '60%' : '100%'}
          height={13}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={[styles.card, className].filter(Boolean).join(' ')}>
      <Skeleton width="40%" height={11} radius={4} />
      <Skeleton width="80%" height={14} radius={4} />
      <Skeleton width="100%" height={5} radius={3} />
      <div className={styles.cardFooter}>
        <Skeleton width={60} height={20} radius={100} />
        <Skeleton width={22} height={22} radius={11} />
      </div>
    </div>
  );
}
