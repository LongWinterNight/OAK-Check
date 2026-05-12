'use client';

import { signOut } from 'next-auth/react';
import { useState } from 'react';
import Link from 'next/link';
import Avatar from '@/components/ui/Avatar/Avatar';
import { Icons } from '@/components/icons';
import styles from './UserRow.module.css';

const ROLE_LABELS: Record<string, string> = {
  ARTIST: '3D Artist',
  LEAD: 'Lead Artist',
  QA: 'QA',
  POST: 'Post',
  PM: 'PM',
  ADMIN: 'Admin',
};

interface UserRowProps {
  name: string;
  role: string;
  avatarUrl?: string | null;
}

export function UserRow({ name, role, avatarUrl }: UserRowProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className={styles.wrap}>
      {menuOpen && (
        <>
          <div className={styles.backdrop} onClick={() => setMenuOpen(false)} />
          <div className={styles.menu}>
            <Link href="/settings" className={styles.menuItem} onClick={() => setMenuOpen(false)}>
              <Icons.Settings size={13} />
              Настройки
            </Link>
            <div className={styles.menuDivider} />
            <button
              className={[styles.menuItem, styles.menuDanger].join(' ')}
              onClick={() => signOut({ callbackUrl: '/login' })}
            >
              <Icons.X size={13} />
              Выйти
            </button>
          </div>
        </>
      )}
      <button className={styles.row} onClick={() => setMenuOpen((v) => !v)}>
        <Avatar name={name} src={avatarUrl ?? null} size={26} online />
        <div className={styles.info}>
          <div className={styles.name}>{name}</div>
          <div className={styles.roleLabel}>{ROLE_LABELS[role] ?? role}</div>
        </div>
        <Icons.ChevD size={12} color="var(--fg-subtle)" />
      </button>
    </div>
  );
}
