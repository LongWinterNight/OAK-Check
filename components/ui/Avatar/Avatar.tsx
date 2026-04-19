import styles from './Avatar.module.css';

const PALETTE = [
  '#6366F1', '#8B5CF6', '#EC4899', '#EF4444',
  '#F59E0B', '#10B981', '#3B82F6', '#06B6D4',
];

function getColor(name: string): string {
  const code = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return PALETTE[code % PALETTE.length];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: number;
  online?: boolean;
  className?: string;
}

export default function Avatar({ name, src, size = 26, online, className }: AvatarProps) {
  const bg = getColor(name);
  const initials = getInitials(name);

  return (
    <div
      className={[styles.avatar, className ?? ''].join(' ')}
      style={{ width: size, height: size, background: src ? undefined : bg }}
      title={name}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <span
          className={styles.initials}
          style={{ fontSize: size * 0.42 }}
        >
          {initials}
        </span>
      )}
      {online !== undefined && (
        <span
          className={[styles.dot, online ? styles.online : styles.offline].join(' ')}
          aria-label={online ? 'Онлайн' : 'Офлайн'}
        />
      )}
    </div>
  );
}

interface AvatarStackProps {
  names: string[];
  srcs?: (string | null)[];
  size?: number;
  max?: number;
}

export function AvatarStack({ names, srcs = [], size = 22, max = 3 }: AvatarStackProps) {
  const visible = names.slice(0, max);
  const rest = names.length - max;

  return (
    <div className={styles.stack}>
      {visible.map((name, i) => (
        <div
          key={i}
          style={{ marginLeft: i > 0 ? -(size * 0.3) : 0 }}
        >
          <Avatar
            name={name}
            src={srcs[i]}
            size={size}
            className={styles.stackItem}
          />
        </div>
      ))}
      {rest > 0 && (
        <div
          className={styles.more}
          style={{ width: size, height: size, fontSize: size * 0.38, marginLeft: -(size * 0.3) }}
        >
          +{rest}
        </div>
      )}
    </div>
  );
}
