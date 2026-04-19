import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  value: number;      // 0–100
  height?: number;    // px, default 6
  color?: string;     // CSS цвет, default var(--accent)
  className?: string;
}

export default function ProgressBar({
  value,
  height = 6,
  color,
  className,
}: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, value));

  return (
    <div
      className={[styles.track, className ?? ''].join(' ')}
      style={{ height }}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={styles.fill}
        style={{
          width: `${pct}%`,
          background: color ?? 'var(--accent)',
        }}
      />
    </div>
  );
}
