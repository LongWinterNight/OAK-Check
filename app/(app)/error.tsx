'use client';

import { useEffect } from 'react';
import styles from './error.module.css';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AppError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[AppError]', error);
  }, [error]);

  return (
    <div className={styles.wrap}>
      <div className={styles.code}>500</div>
      <div className={styles.title}>Что-то пошло не так</div>
      <div className={styles.desc}>{error.message || 'Непредвиденная ошибка приложения'}</div>
      <button className={styles.btn} onClick={reset}>Попробовать снова</button>
    </div>
  );
}
