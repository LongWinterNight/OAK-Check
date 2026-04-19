'use client';

import { useThemeStore } from '@/store/useThemeStore';
import styles from './tab.module.css';

const ACCENTS = [
  { id: 'blue' as const,  color: '#3b82f6', label: 'Синий' },
  { id: 'oak'  as const,  color: '#8b5cf6', label: 'Дуб' },
  { id: 'amber'as const,  color: '#f59e0b', label: 'Янтарный' },
  { id: 'green'as const,  color: '#22c55e', label: 'Зелёный' },
  { id: 'lime' as const,  color: '#84cc16', label: 'Лайм' },
];

const RADII = [
  { value: 0,  label: 'Плоский' },
  { value: 4,  label: 'Малый' },
  { value: 8,  label: 'Средний' },
  { value: 12, label: 'Большой' },
];

export default function AppearanceTab() {
  const { dark, accent, radius, toggle, setAccent, setRadius } = useThemeStore();

  return (
    <>
      {/* Theme */}
      <div className={styles.section}>
        <div className={styles.sectionHead}>
          <div>
            <div className={styles.sectionTitle}>Тема</div>
            <div className={styles.sectionDesc}>Выберите цветовую схему интерфейса</div>
          </div>
        </div>
        <div className={styles.sectionBody}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-3)' }}>
            {[
              { id: false, label: 'Светлая', desc: 'Светлый режим' },
              { id: true,  label: 'Тёмная',  desc: 'Классическая тёмная тема' },
            ].map(t => (
              <button
                key={String(t.id)}
                onClick={() => { if (dark !== t.id) toggle(); }}
                style={{
                  padding: 'var(--spacing-4)', borderRadius: 'var(--radius)', cursor: 'pointer', textAlign: 'left',
                  border: `2px solid ${dark === t.id ? 'var(--accent)' : 'var(--border)'}`,
                  background: dark === t.id ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'var(--surface-2)',
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 600, color: dark === t.id ? 'var(--accent)' : 'var(--fg)' }}>{t.label}</div>
                <div style={{ fontSize: 11, color: 'var(--fg-subtle)', marginTop: 2 }}>{t.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Accent color */}
      <div className={styles.section}>
        <div className={styles.sectionHead}>
          <div>
            <div className={styles.sectionTitle}>Акцентный цвет</div>
            <div className={styles.sectionDesc}>Цвет кнопок, активных элементов и ссылок</div>
          </div>
        </div>
        <div className={styles.sectionBody}>
          <div style={{ display: 'flex', gap: 'var(--spacing-3)', flexWrap: 'wrap', alignItems: 'center' }}>
            {ACCENTS.map(a => (
              <button
                key={a.id}
                onClick={() => setAccent(a.id)}
                title={a.label}
                style={{
                  width: 36, height: 36, borderRadius: '50%', background: a.color, cursor: 'pointer',
                  border: accent === a.id ? `3px solid var(--fg)` : '3px solid transparent',
                  boxShadow: accent === a.id ? `0 0 0 2px ${a.color}` : 'none',
                  outline: 'none', flexShrink: 0,
                }}
              />
            ))}
            <span style={{ fontSize: 12, color: 'var(--fg-subtle)', marginLeft: 4 }}>
              {ACCENTS.find(a => a.id === accent)?.label}
            </span>
          </div>
        </div>
      </div>

      {/* Border radius */}
      <div className={styles.section}>
        <div className={styles.sectionHead}>
          <div>
            <div className={styles.sectionTitle}>Скругление углов</div>
            <div className={styles.sectionDesc}>Форма карточек и элементов интерфейса</div>
          </div>
        </div>
        <div className={styles.sectionBody}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--spacing-3)' }}>
            {RADII.map(r => (
              <button
                key={r.value}
                onClick={() => setRadius(r.value)}
                style={{
                  padding: 'var(--spacing-3)', cursor: 'pointer', textAlign: 'center', outline: 'none',
                  borderRadius: r.value + 'px',
                  border: `2px solid ${radius === r.value ? 'var(--accent)' : 'var(--border)'}`,
                  background: radius === r.value ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'var(--surface-2)',
                  color: radius === r.value ? 'var(--accent)' : 'var(--fg)',
                  fontSize: 12, fontWeight: 500,
                }}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
