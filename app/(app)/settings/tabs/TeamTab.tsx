'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './tab.module.css';

type User = {
  id: string; name: string; email: string; role: string;
  online: boolean; avatarUrl: string | null; createdAt: string;
};

type Invitation = {
  id: string; email: string; role: string; createdAt: string;
  expiresAt: string; usedAt: string | null;
};

interface TeamTabProps {
  users: User[];
  isAdmin: boolean;
  currentUserId: string;
}

const ROLES = ['ARTIST', 'QA', 'LEAD', 'POST', 'PM', 'ADMIN'];

function roleClass(role: string) {
  if (role === 'ADMIN') return styles.roleAdmin;
  if (role === 'LEAD') return styles.roleLead;
  if (role === 'QA') return styles.roleQa;
  return '';
}

export default function TeamTab({ users: initial, isAdmin, currentUserId }: TeamTabProps) {
  const [users, setUsers] = useState<User[]>(initial);
  const [saving, setSaving] = useState<string | null>(null);

  // Invite form state
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('ARTIST');
  const [inviteSending, setInviteSending] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);

  // Pending invitations
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [invLoading, setInvLoading] = useState(false);

  const loadInvitations = useCallback(async () => {
    if (!isAdmin) return;
    setInvLoading(true);
    try {
      const res = await fetch('/api/invitations');
      if (res.ok) setInvitations(await res.json());
    } finally {
      setInvLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => { loadInvitations(); }, [loadInvitations]);

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

  async function sendInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail) { setInviteError('Введите email'); return; }
    setInviteSending(true);
    setInviteError(null);
    setInviteSuccess(null);
    try {
      const res = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setInviteError(data.error ?? 'Ошибка сервера');
        return;
      }
      setInviteSuccess(`Приглашение отправлено на ${inviteEmail}`);
      setInviteEmail('');
      setInviteRole('ARTIST');
      await loadInvitations();
    } catch {
      setInviteError('Ошибка сети');
    } finally {
      setInviteSending(false);
    }
  }

  async function revokeInvite(id: string) {
    if (!confirm('Отозвать приглашение?')) return;
    setSaving(id);
    try {
      await fetch(`/api/invitations/${id}`, { method: 'DELETE' });
      setInvitations(prev => prev.filter(i => i.id !== id));
    } finally { setSaving(null); }
  }

  const pending = invitations.filter(i => !i.usedAt && new Date(i.expiresAt) > new Date());

  return (
    <>
      <div className={styles.section}>
        <div className={styles.sectionHead}>
          <div>
            <div className={styles.sectionTitle}>Команда</div>
            <div className={styles.sectionDesc}>{users.length} участников в системе</div>
          </div>
          {isAdmin && (
            <button
              className={styles.btnPrimary}
              onClick={() => { setShowInvite(v => !v); setInviteError(null); setInviteSuccess(null); }}
            >
              {showInvite ? 'Отмена' : '+ Пригласить'}
            </button>
          )}
        </div>

        {isAdmin && showInvite && (
          <form className={styles.inviteForm} onSubmit={sendInvite}>
            <input
              type="email"
              className={styles.input}
              placeholder="email@example.com"
              value={inviteEmail}
              onChange={e => { setInviteEmail(e.target.value); setInviteError(null); setInviteSuccess(null); }}
              required
            />
            <select
              className={styles.select}
              value={inviteRole}
              onChange={e => setInviteRole(e.target.value)}
              style={{ width: 120 }}
            >
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <button type="submit" className={styles.btnPrimary} disabled={inviteSending}>
              {inviteSending ? 'Отправка…' : 'Отправить'}
            </button>
            {inviteError && <span style={{ color: 'var(--blocked)', fontSize: 12 }}>{inviteError}</span>}
            {inviteSuccess && <span style={{ color: 'var(--done)', fontSize: 12 }}>{inviteSuccess}</span>}
          </form>
        )}

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

      {isAdmin && (
        <div className={styles.section}>
          <div className={styles.sectionHead}>
            <div>
              <div className={styles.sectionTitle}>Ожидающие приглашения</div>
              <div className={styles.sectionDesc}>{invLoading ? 'Загрузка…' : `${pending.length} активных`}</div>
            </div>
          </div>
          {pending.length > 0 ? (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Роль</th>
                  <th>Истекает</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {pending.map(inv => (
                  <tr key={inv.id}>
                    <td style={{ color: 'var(--fg-subtle)' }}>{inv.email}</td>
                    <td><span className={styles.role}>{inv.role}</span></td>
                    <td style={{ color: 'var(--fg-subtle)', fontSize: 12 }}>
                      {new Date(inv.expiresAt).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td>
                      <button
                        onClick={() => revokeInvite(inv.id)}
                        disabled={saving === inv.id}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 12, padding: '2px 6px' }}
                      >
                        Отозвать
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            !invLoading && <p style={{ fontSize: 13, color: 'var(--fg-subtle)', margin: 0 }}>Нет активных приглашений</p>
          )}
        </div>
      )}
    </>
  );
}
