'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './tab.module.css';

type Project = {
  id: string; title: string; client: string; status: string;
  shotsCount: number; coverGradient: string; dueDate: string | null;
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Активен', PAUSED: 'Пауза', DONE: 'Завершён', ARCHIVED: 'Архив',
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: '#22c55e', PAUSED: '#f59e0b', DONE: 'var(--accent)', ARCHIVED: 'var(--fg-subtle)',
};

const STATUSES = ['ACTIVE', 'PAUSED', 'DONE', 'ARCHIVED'];

interface ProjectsTabProps {
  projects: Project[];
  isAdmin: boolean;
}

export default function ProjectsTab({ projects: initial, isAdmin }: ProjectsTabProps) {
  const [projects, setProjects] = useState<Project[]>(initial);
  const [saving, setSaving] = useState<string | null>(null);
  const [filter, setFilter] = useState('ALL');

  const filtered = filter === 'ALL' ? projects : projects.filter(p => p.status === filter);

  async function changeStatus(id: string, status: string) {
    setSaving(id);
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) return;
      setProjects(p => p.map(x => x.id === id ? { ...x, status } : x));
    } finally { setSaving(null); }
  }

  return (
    <div className={styles.section}>
      <div className={styles.sectionHead}>
        <div>
          <div className={styles.sectionTitle}>Проекты</div>
          <div className={styles.sectionDesc}>{projects.length} проектов в системе</div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['ALL', ...STATUSES].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              style={{
                padding: '4px 10px', borderRadius: 'var(--radius)', fontSize: 11, fontWeight: 600,
                border: '1px solid var(--border)', cursor: 'pointer',
                background: filter === s ? 'var(--accent)' : 'var(--surface-2)',
                color: filter === s ? '#fff' : 'var(--fg)',
              }}
            >
              {s === 'ALL' ? 'Все' : STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Проект</th>
            <th>Клиент</th>
            <th>Шоты</th>
            <th>Срок</th>
            <th>Статус</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(p => (
            <tr key={p.id}>
              <td>
                <Link href={`/projects/${p.id}`} style={{ color: 'var(--fg)', textDecoration: 'none', fontWeight: 500 }}>
                  {p.title}
                </Link>
              </td>
              <td style={{ color: 'var(--fg-subtle)' }}>{p.client}</td>
              <td>{p.shotsCount}</td>
              <td style={{ color: 'var(--fg-subtle)', fontSize: 12 }}>
                {p.dueDate ? new Date(p.dueDate).toLocaleDateString('ru-RU') : '—'}
              </td>
              <td>
                {isAdmin ? (
                  <select
                    className={styles.select}
                    value={p.status}
                    disabled={saving === p.id}
                    onChange={e => changeStatus(p.id, e.target.value)}
                    style={{ width: 'auto', padding: '3px 6px', fontSize: 12 }}
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                  </select>
                ) : (
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99,
                    background: `color-mix(in srgb, ${STATUS_COLORS[p.status]} 15%, transparent)`,
                    color: STATUS_COLORS[p.status],
                    border: `1px solid ${STATUS_COLORS[p.status]}`,
                  }}>
                    {STATUS_LABELS[p.status] ?? p.status}
                  </span>
                )}
              </td>
              <td>
                <Link href={`/projects/${p.id}`} style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none' }}>
                  Открыть →
                </Link>
              </td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--fg-subtle)', padding: '24px' }}>Нет проектов</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
