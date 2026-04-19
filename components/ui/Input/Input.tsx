import React from 'react';
import styles from './Input.module.css';

type InputSize = 'sm' | 'md' | 'lg';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: InputSize;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export default function Input({
  size = 'md',
  iconLeft,
  iconRight,
  className,
  ...rest
}: InputProps) {
  if (!iconLeft && !iconRight) {
    return (
      <input
        {...rest}
        className={[styles.input, styles[size], className ?? ''].join(' ')}
      />
    );
  }

  return (
    <div className={[styles.wrapper, styles[size], className ?? ''].join(' ')}>
      {iconLeft && <span className={styles.iconLeft}>{iconLeft}</span>}
      <input {...rest} className={styles.innerInput} />
      {iconRight && <span className={styles.iconRight}>{iconRight}</span>}
    </div>
  );
}
