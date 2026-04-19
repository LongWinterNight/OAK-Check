'use client';

import { signOut } from 'next-auth/react';
import { useState } from 'react';
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
}

export function UserRow({ name, role }: UserRowProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className={styles.wrap}>
      {menuOpen && (
        <>
          <div className={styles.backdrop} onClick={() => setMenuOpen(false)} />
          <div className={styles.menu}>
            <button
              className={styles.menuItem}
              onClick={() => signOut({ callbackUrl: '/login' })}
            >
              <Icons.X size={13} />
              Выйти
            </button>
          </div>
        </>
      )}
      <button className={styles.row} onClick={() => setMenuOpen((v) => !v)}>
        <Avatar name={name} size={26} online />
        <div className={styles.info}>
          <div className={styles.name}>{name}</div>
          <div className={styles.roleLabel}>{ROLE_LABELS[role] ?? role}</div>
        </div>
        <Icons.ChevD size={12} color="var(--fg-subtle)" />
      </button>
    </div>
  );
}
