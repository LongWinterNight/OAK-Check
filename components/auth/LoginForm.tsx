'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Icons } from '@/components/icons';
import styles from './LoginForm.module.css';

export function LoginForm() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get('callbackUrl') ?? '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) { setError('Заполните все поля'); return; }

    setLoading(true);
    setError(null);

    const res = await signIn('credentials', {
      identifier,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError('Неверный email или пароль');
    } else {
      router.replace(callbackUrl);
      router.refresh();
    }
  };

  return (
    <div className={styles.card}>
      {/* Logo */}
      <div className={styles.logo}>
        <div className={styles.logoIcon}>
          <Icons.Oak size={22} color="var(--oak)" />
        </div>
        <div>
          <div className={styles.logoTitle}>OAK·Check</div>
          <div className={styles.logoSub}>studio · 3DsMax pipeline</div>
        </div>
      </div>

      <h1 className={styles.heading}>Вход в систему</h1>
      <p className={styles.sub}>Войдите со своими учётными данными студии</p>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="identifier">Логин или Email</label>
          <div className={styles.inputWrap}>
            <Icons.User size={14} />
            <input
              id="identifier"
              type="text"
              className={styles.input}
              value={identifier}
              onChange={(e) => { setIdentifier(e.target.value); setError(null); }}
              placeholder="safanch6230i или artem@oak3d.ru"
              autoComplete="username"
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
              onChange={(e) => { setPassword(e.target.value); setError(null); }}
              placeholder="••••••••"
              autoComplete="current-password"
            />
            <button
              type="button"
              className={styles.eyeBtn}
              onClick={() => setShowPwd((v) => !v)}
              aria-label={showPwd ? 'Скрыть пароль' : 'Показать пароль'}
            >
              <Icons.Eye size={14} />
            </button>
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
          {loading ? 'Входим…' : 'Войти'}
        </button>
      </form>

      <p className={styles.hint}>
        Нет доступа? Обратитесь к администратору студии.
      </p>
    </div>
  );
}
