'use client';

import { useEffect, useRef } from 'react';
import { Icons } from '@/components/icons';
import { useToastStore, type Toast, type ToastKind } from './toastStore';
import styles from './Toast.module.css';

const KIND_ICON: Record<ToastKind, React.ReactNode> = {
  success: <Icons.Check size={14} />,
  error: <Icons.X size={14} />,
  info: <Icons.Bell size={14} />,
  warning: <Icons.AlertTriangle size={14} />,
};

function ToastItem({ toast }: { toast: Toast }) {
  const remove = useToastStore((s) => s.remove);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const dur = toast.duration ?? 4000;
    timerRef.current = setTimeout(() => remove(toast.id), dur);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [toast.id, toast.duration, remove]);

  return (
    <div className={[styles.toast, styles[toast.kind]].join(' ')} role="alert">
      <span className={styles.icon}>{KIND_ICON[toast.kind]}</span>
      <span className={styles.message}>{toast.message}</span>
      <button
        className={styles.close}
        onClick={() => remove(toast.id)}
        aria-label="Закрыть"
      >
        <Icons.X size={12} />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div className={styles.container} aria-live="polite" aria-atomic="false">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
}
