'use client';

import { KeyboardEvent } from 'react';
import styles from './Check3.module.css';

export type ItemState = 'todo' | 'wip' | 'done';

const STATE_CYCLE: Record<ItemState, ItemState> = {
  todo: 'wip',
  wip: 'done',
  done: 'todo',
};

const ARIA_CHECKED: Record<ItemState, boolean | 'mixed'> = {
  todo: false,
  wip: 'mixed',
  done: true,
};

interface Check3Props {
  state: ItemState;
  onChange: (next: ItemState) => void;
  size?: number;
  disabled?: boolean;
  className?: string;
}

export default function Check3({
  state,
  onChange,
  size = 16,
  disabled = false,
  className,
}: Check3Props) {
  const handleClick = () => {
    if (!disabled) onChange(STATE_CYCLE[state]);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (!disabled) onChange(STATE_CYCLE[state]);
    }
  };

  return (
    <div
      role="checkbox"
      aria-checked={ARIA_CHECKED[state]}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={[
        styles.check,
        styles[state],
        disabled ? styles.disabled : '',
        className ?? '',
      ].join(' ')}
      style={{ width: size, height: size, borderRadius: size / 3 }}
    >
      {state === 'wip' && (
        <span
          className={styles.wipSquare}
          style={{ width: size * 0.4, height: size * 0.4 }}
        />
      )}
      {state === 'done' && (
        <svg
          width={size * 0.65}
          height={size * 0.65}
          viewBox="0 0 10 10"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M1.5 5.5L3.5 7.5L8.5 2.5"
            stroke="white"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  );
}
