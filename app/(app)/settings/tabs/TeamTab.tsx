'use client';

import { useState } from 'react';
import styles from './tab.module.css';

type User = {
  id: string; name: string; email: string; role: string;
  online: boolean; avatarUrl: string | null; createdAt: string;
};

interface TeamTabProps {
  users: User[];
  isAdmin: boolean;
  currentUserId: string;
}

const ROLES = ['ARTIST', 'QA', 'LEAD', 'ADMIN'];

function roleClass(role: string) {
  if (role === 'ADMIN') return styles.roleAdmin;
  if (role === 'LEAD') return styles.roleLead;
  if (role === 'QA') return styles.roleQa;
  return '';
}

export default function TeamTab({ users: initial, isAdmin, currentUserId }: TeamTabProps) {
  const [users, setUsers] = useState<User[]>(initial);
  const [saving, setSaving] = useState<string | null>(null);

  async function changeRole(userId: string, role: string) {
    setSaving(userId);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) return;
      setUsers(u => u.map(x => x.id === userId ? { ...x, role } : x));
    } finally { setSaving(null); }
  }

  async function deleteUser(userId: string) {
    if (!confirm('Удалить пользователя?')) return;
    setSaving(userId);
    try {
      const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
      if (!res.ok) return;
      setUsers(u => u.filter(x => x.id !== userId));
    } finally { setSaving(null); }
  }

  return (
    <div className={styles.section}>
      <div className={styles.sectionHead}>
        <div>
          <div className={styles.sectionTitle}>Команда</div>
          <div className={styles.sectionDesc}>{users.length} участников в системе</div>
        </div>
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Участник</th>
            <th>Email</th>
            <th>Роль</th>
            <th>Статус</th>
            <th>Дата входа</th>
            {isAdmin && <th></th>}
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td style={{ fontWeight: 500 }}>{u.name}{u.id === currentUserId && <span style={{ fontSize: 11, color: 'var(--fg-subtle)', marginLeft: 6 }}>(вы)</span>}</td>
              <td style={{ color: 'var(--fg-subtle)' }}>{u.email}</td>
              <td>
                {isAdmin && u.id !== currentUserId ? (
                  <select
                    className={styles.select}
                    value={u.role}
                    disabled={saving === u.id}
                    onChange={e => changeRole(u.id, e.target.value)}
                    style={{ width: 'auto', padding: '3px 6px', fontSize: 12 }}
                  >
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                ) : (
                  <span className={[styles.role, roleClass(u.role)].join(' ')}>{u.role}</span>
                )}
              </td>
              <td>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className={[styles.dot, u.online ? styles.dotOnline : ''].join(' ')} />
                  {u.online ? 'Онлайн' : 'Офлайн'}
                </span>
              </td>
              <td style={{ color: 'var(--fg-subtle)', fontSize: 12 }}>
                {new Date(u.createdAt).toLocaleDateString('ru-RU')}
              </td>
              {isAdmin && (
                <td>
                  {u.id !== currentUserId && (
                    <button
                      onClick={() => deleteUser(u.id)}
                      disabled={saving === u.id}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 12, padding: '2px 6px' }}
                    >
                      Удалить
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
