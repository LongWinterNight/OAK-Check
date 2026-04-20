'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Icons } from '@/components/icons';
import styles from './LoginForm.module.css';

interface InviteFormProps {
  token: string;
  email: string;
  role: string;
}

export function InviteForm({ token, email, role }: InviteFormProps) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !password || !confirm) { setError('Заполните все поля'); return; }
    if (password !== confirm) { setError('Пароли не совпадают'); return; }
    if (password.length < 8) { setError('Пароль должен содержать минимум 8 символов'); return; }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, name, password }),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error ?? 'Ошибка регистрации');
        return;
      }

      const signInRes = await signIn('credentials', {
        identifier: email,
        password,
        redirect: false,
      });

      if (signInRes?.error) {
        router.replace('/login');
      } else {
        router.replace('/dashboard');
        router.refresh();
      }
    } catch {
      setError('Ошибка сети');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}>
          <Icons.Oak size={22} color="var(--oak)" />
        </div>
        <div>
          <div className={styles.logoTitle}>OAK·Check</div>
          <div className={styles.logoSub}>studio · 3DsMax pipeline</div>
        </div>
      </div>

      <h1 className={styles.heading}>Создание аккаунта</h1>
      <p className={styles.sub}>
        Приглашение для <strong>{email}</strong> · роль <strong>{role}</strong>
      </p>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="name">Имя</label>
          <div className={styles.inputWrap}>
            <Icons.User size={14} />
            <input
              id="name"
              type="text"
              className={styles.input}
              value={name}
              onChange={e => { setName(e.target.value); setError(null); }}
              placeholder="Артём Иванов"
              autoComplete="name"
              autoFocus
            />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="password">Пароль</label>
          <div className={styles.inputWrap}>
            <Icons.Lock size={14} />
            <input
              id="password"
              type={showPwd ? 'text' : 'password'}
              className={styles.input}
              value={password}
              onChange={e => { setPassword(e.target.value); setError(null); }}
              placeholder="Минимум 8 символов"
              autoComplete="new-password"
            />
            <button
              type="button"
              className={styles.eyeBtn}
              onClick={() => setShowPwd(v => !v)}
              aria-label={showPwd ? 'Скрыть пароль' : 'Показать пароль'}
            >
              <Icons.Eye size={14} />
            </button>
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="confirm">Подтвердите пароль</label>
          <div className={styles.inputWrap}>
            <Icons.Lock size={14} />
            <input
              id="confirm"
              type={showPwd ? 'text' : 'password'}
              className={styles.input}
              value={confirm}
              onChange={e => { setConfirm(e.target.value); setError(null); }}
              placeholder="Повторите пароль"
              autoComplete="new-password"
            />
          </div>
        </div>

        {error && (
          <div className={styles.error} role="alert">
            <Icons.AlertTriangle size={13} />
            {error}
          </div>
        )}

        <button type="submit" className={styles.btn} disabled={loading}>
          {loading ? <span className={styles.spin} /> : null}
          {loading ? 'Создаём аккаунт…' : 'Создать аккаунт'}
        </button>
      </form>

      <p className={styles.hint}>Уже есть аккаунт? <a href="/login" style={{ color: 'var(--accent)' }}>Войти</a></p>
    </div>
  );
}
