'use client';

import Button from '@/components/ui/Button/Button';
import { Modal } from './Modal';
import styles from './ConfirmDialog.module.css';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Подтвердить',
  danger = false,
  loading = false,
  onClose,
  onConfirm,
}: ConfirmDialogProps) {
  const footer = (
    <>
      <Button variant="ghost" size="md" onClick={onClose}>Отмена</Button>
      <Button
        variant={danger ? 'danger' : 'primary'}
        size="md"
        loading={loading}
        onClick={onConfirm}
      >
        {confirmLabel}
      </Button>
    </>
  );

  return (
    <Modal title={title} onClose={onClose} footer={footer} size="sm">
      <p className={styles.message}>{message}</p>
    </Modal>
  );
}
