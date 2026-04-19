'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/store/useThemeStore';
import styles from './SettingsClient.module.css';

const ACCENTS = [
  { id: 'blue',  label: 'Синий',    color: '#3b82f6' },
  { id: 'oak',   label: 'Дуб',      color: '#8a6f3e' },
  { id: 'amber', label: 'Янтарь',   color: '#f59e0b' },
  { id: 'green', label: 'Зелёный',  color: '#22c55e' },
  { id: 'lime',  label: 'Лайм',     color: '#84cc16' },
] as const;

const RADII = [
  { value: 4,  label: 'Sharp' },
  { value: 8,  label: 'Default' },
  { value: 12, label: 'Rounded' },
  { value: 20, label: 'Pill' },
];

export default function SettingsClient() {
  const { dark, accent, radius, toggle, setAccent, setRadius, applyToDOM } = useThemeStore();

  useEffect(() => { applyToDOM(); }, [applyToDOM]);

  return (
    <div className={styles.root}>
      {/* Тема */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Тема</h2>
        <div className={styles.row}>
          <div className={styles.rowLabel}>
            <span>Тёмный режим</span>
            <span className={styles.hint}>Переключает тёмную тему</span>
          </div>
          <button
            role="switch"
            aria-checked={dark}
            onClick={toggle}
            className={[styles.toggle, dark ? styles.toggleOn : ''].join(' ')}
          >
            <span className={styles.toggleThumb} />
          </button>
        </div>
      </section>

      {/* Акцентный цвет */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Акцентный цвет</h2>
        <div className={styles.accentGrid}>
          {ACCENTS.map((a) => (
            <button
              key={a.id}
              onClick={() => setAccent(a.id)}
              className={[styles.accentBtn, accent === a.id ? styles.accentActive : ''].join(' ')}
              style={{ '--accent-swatch': a.color } as React.CSSProperties}
              aria-label={a.label}
              title={a.label}
            >
              <span className={styles.accentSwatch} />
              <span className={styles.accentLabel}>{a.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Скругления */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Скругление углов</h2>
        <div className={styles.radiusRow}>
          {RADII.map((r) => (
            <button
              key={r.value}
              onClick={() => setRadius(r.value)}
              className={[styles.radiusBtn, radius === r.value ? styles.radiusActive : ''].join(' ')}
            >
              <span
                className={styles.radiusPreview}
                style={{ borderRadius: r.value }}
              />
              <span className={styles.radiusLabel}>{r.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Информация */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>О системе</h2>
        <div className={styles.infoGrid}>
          <div className={styles.infoRow}>
            <span className={styles.infoKey}>Система</span>
            <span className={styles.infoVal}>OAK·Check v0.1.0</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoKey}>Стек</span>
            <span className={styles.infoVal}>Next.js 16 · Prisma 7 · PostgreSQL</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoKey}>Real-time</span>
            <span className={styles.infoVal}>SSE (Server-Sent Events)</span>
          </div>
        </div>
      </section>
    </div>
  );
}
