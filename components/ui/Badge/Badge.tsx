import React from 'react';
import styles from './Badge.module.css';

export type BadgeKind = 'neutral' | 'done' | 'wip' | 'blocked' | 'info' | 'accent' | 'oak';
export type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  kind?: BadgeKind;
  size?: BadgeSize;
  dot?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export default function Badge({
  kind = 'neutral',
  size = 'md',
  dot = false,
  icon,
  children,
  className,
}: BadgeProps) {
  return (
    <span className={[styles.badge, styles[kind], styles[size], className ?? ''].join(' ')}>
      {dot && <span className={styles.dot} aria-hidden="true" />}
      {icon && <span className={styles.icon}>{icon}</span>}
      {children}
    </span>
  );
}
