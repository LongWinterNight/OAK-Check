'use client';

import { useState } from 'react';
import styles from './tab.module.css';

interface ProfileTabProps {
  currentUser: { id: string; name: string; email: string; role: string } | null;
}

export default function ProfileTab({ currentUser }: ProfileTabProps) {
  const [name, setName] = useState(currentUser?.name ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'ok' | 'err'>('idle');
  const [errMsg, setErrMsg] = useState('');

  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';

  async function patchMe(body: object): Promise<void> {
    const res = await fetch('/api/users/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      let msg = 'Ошибка сервера';
      try { const d = await res.json(); msg = d.error ?? msg; } catch { /* empty body */ }
      throw new Error(msg);
    }
  }

  async function saveProfile() {
    setSaving(true);
    setStatus('idle');
    try {
      await patchMe({ name });
      setStatus('ok');
    } catch (e: unknown) {
      setErrMsg(e instanceof Error ? e.message : 'Ошибка');
      setStatus('err');
    } finally { setSaving(false); }
  }

  async function changePassword() {
    if (newPassword !== confirmPassword) { setErrMsg('Пароли не совпадают'); setStatus('err'); return; }
    if (newPassword.length < 6) { setErrMsg('Минимум 6 символов'); setStatus('err'); return; }
    setSaving(true);
    setStatus('idle');
    try {
      await patchMe({ currentPassword, newPassword });
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      setStatus('ok');
    } catch (e: unknown) {
      setErrMsg(e instanceof Error ? e.message : 'Ошибка');
      setStatus('err');
    } finally { setSaving(false); }
  }

  return (
    <>
      {/* Avatar + info */}
      <div className={styles.section}>
        <div className={styles.sectionHead}>
          <div>
            <div className={styles.sectionTitle}>Личные данные</div>
            <div className={styles.sectionDesc}>Ваш профиль в системе OAK·Check</div>
          </div>
        </div>
        <div className={styles.sectionBody}>
          <div className={styles.avatarRow}>
            <div className={styles.avatar}>{initials}</div>
            <div className={styles.avatarInfo}>
              <div className={styles.avatarName}>{name || '—'}</div>
              <div className={styles.avatarMeta}>{currentUser?.email}</div>
              <div className={styles.avatarMeta}>Роль: {currentUser?.role}</div>
            </div>
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.label}>Имя</label>
              <input className={styles.input} value={name} onChange={e => setName(e.target.value)} placeholder="Ваше имя" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Email</label>
              <input className={styles.input} value={currentUser?.email ?? ''} disabled style={{ opacity: 0.5 }} />
            </div>
          </div>

          <div className={styles.actions}>
            {status === 'ok' && <span className={styles.saveStatus}>Сохранено</span>}
            {status === 'err' && <span className={styles.saveError}>{errMsg}</span>}
            <button className="btn btn-primary" onClick={saveProfile} disabled={saving}>
              {saving ? 'Сохранение…' : 'Сохранить'}
            </button>
          </div>
        </div>
      </div>

      {/* Password */}
      <div className={styles.section}>
        <div className={styles.sectionHead}>
          <div>
            <div className={styles.sectionTitle}>Изменить пароль</div>
            <div className={styles.sectionDesc}>Используйте надёжный пароль от 6 символов</div>
          </div>
        </div>
        <div className={styles.sectionBody}>
          <div className={styles.field}>
            <label className={styles.label}>Текущий пароль</label>
            <input className={styles.input} type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
          </div>
          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.label}>Новый пароль</label>
              <input className={styles.input} type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Повторите пароль</label>
              <input className={styles.input} type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
            </div>
          </div>
          <div className={styles.actions}>
            <button className="btn btn-primary" onClick={changePassword} disabled={saving || !currentPassword || !newPassword}>
              Сменить пароль
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
