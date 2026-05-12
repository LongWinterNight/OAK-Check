'use client';

import { useRef, useState } from 'react';
import { Icons } from '@/components/icons';
import { AvatarCropModal } from '@/components/settings/AvatarCropModal';
import styles from './tab.module.css';

interface ProfileTabProps {
  currentUser: { id: string; name: string; email: string; username?: string | null; role: string; avatarUrl: string | null; lastLoginAt: string | null } | null;
}

export default function ProfileTab({ currentUser }: ProfileTabProps) {
  const [name, setName] = useState(currentUser?.name ?? '');
  const [email, setEmail] = useState(currentUser?.email ?? '');
  const [username, setUsername] = useState(currentUser?.username ?? '');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(currentUser?.avatarUrl ?? null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'ok' | 'err'>('idle');
  const [errMsg, setErrMsg] = useState('');
  const [cropFile, setCropFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Лимит на исходник — 40 МБ; кропнутая аватарка получится ~50-200 КБ
    if (file.size > 40 * 1024 * 1024) {
      setErrMsg('Файл слишком большой (макс. 40 МБ)');
      setStatus('err');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    setStatus('idle');
    setCropFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleCropped(blob: Blob, fileName: string) {
    setCropFile(null);
    setAvatarUploading(true);
    setStatus('idle');
    try {
      const fd = new FormData();
      fd.append('file', new File([blob], fileName, { type: 'image/jpeg' }));
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Ошибка загрузки');
      const { url } = await res.json();
      await patchMe({ avatarUrl: url });
      setAvatarUrl(url);
    } catch (e: unknown) {
      setErrMsg(e instanceof Error ? e.message : 'Ошибка загрузки');
      setStatus('err');
    } finally {
      setAvatarUploading(false);
    }
  }

  async function saveProfile() {
    setSaving(true);
    setStatus('idle');
    try {
      const body: Record<string, string> = { name };
      const trimmedEmail = email.trim();
      const trimmedUsername = username.trim();
      if (trimmedEmail && trimmedEmail.toLowerCase() !== (currentUser?.email ?? '').toLowerCase()) {
        body.email = trimmedEmail;
      }
      if (trimmedUsername && trimmedUsername.toLowerCase() !== (currentUser?.username ?? '').toLowerCase()) {
        body.username = trimmedUsername;
      }
      await patchMe(body);
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
      {cropFile && (
        <AvatarCropModal
          file={cropFile}
          onCropped={handleCropped}
          onClose={() => setCropFile(null)}
        />
      )}
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
            <div className={styles.avatarWrap}>
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt={name} className={styles.avatarImg} />
              ) : (
                <div className={styles.avatar}>{initials}</div>
              )}
              <button
                className={styles.avatarOverlay}
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarUploading}
                title="Загрузить фото"
              >
                {avatarUploading ? '…' : <Icons.Camera size={16} />}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                hidden
                onChange={handleAvatarChange}
              />
            </div>
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
              <input className={styles.input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@oak3d.ru" />
            </div>
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.label}>Логин</label>
              <input
                className={styles.input}
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="например, ivan_petrov"
                autoComplete="off"
              />
              <span className={styles.hint}>Латинские буквы, цифры и _. Можно использовать вместо email для входа.</span>
            </div>
            <div className={styles.field} />
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

      {/* Security */}
      <div className={styles.section}>
        <div className={styles.sectionHead}>
          <div>
            <div className={styles.sectionTitle}>Безопасность</div>
            <div className={styles.sectionDesc}>Информация о последней активности</div>
          </div>
        </div>
        <div className={styles.sectionBody}>
          <table className={styles.table}>
            <tbody>
              <tr>
                <td style={{ fontWeight: 500, width: '40%' }}>Последний вход</td>
                <td>
                  {currentUser?.lastLoginAt
                    ? new Date(currentUser.lastLoginAt).toLocaleString('ru-RU', {
                        day: 'numeric', month: 'long', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })
                    : '—'}
                </td>
              </tr>
              <tr>
                <td style={{ fontWeight: 500 }}>Роль</td>
                <td>{currentUser?.role ?? '—'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
