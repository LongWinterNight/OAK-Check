import React from 'react';
import styles from './Card.module.css';

interface CardProps {
  children: React.ReactNode;
  padding?: number | string;
  hoverable?: boolean;
  className?: string;
  onClick?: () => void;
}

export default function Card({
  children,
  padding = 16,
  hoverable = false,
  className,
  onClick,
}: CardProps) {
  return (
    <div
      className={[styles.card, hoverable ? styles.hoverable : '', className ?? ''].join(' ')}
      style={{ padding }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter') onClick(); } : undefined}
    >
      {children}
    </div>
  );
}
