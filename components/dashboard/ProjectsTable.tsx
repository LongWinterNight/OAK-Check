import Link from 'next/link';
import Badge from '@/components/ui/Badge/Badge';
import ProgressBar from '@/components/ui/ProgressBar/ProgressBar';
import styles from './ProjectsTable.module.css';

const PROJECTS = [
  {
    id: 'proj_skolkovo', title: 'Skolkovo One', client: 'Ikon Development',
    gradient: 'linear-gradient(135deg, #3a5a7a, #1a2a3a)',
    shots: 18, done: 12, progress: 67, stage: 'Pre-render QC', due: '24 апр',
    status: 'ACTIVE' as const,
  },
  {
    id: 'proj_primavera', title: 'Primavera', client: 'Spartak',
    gradient: 'linear-gradient(135deg, #7a5a3a, #3a2a1a)',
    shots: 12, done: 12, progress: 100, stage: 'Финал', due: '12 апр',
    status: 'COMPLETED' as const,
  },
  {
    id: 'proj_kosmo', title: 'Kosmo', client: 'Gals',
    gradient: 'linear-gradient(135deg, #5a3a5a, #2a1a2a)',
    shots: 24, done: 9, progress: 38, stage: 'Моделирование', due: '3 мая',
    status: 'ACTIVE' as const,
  },
  {
    id: 'proj_beregovoy', title: 'Beregovoy 2', client: 'Glavstroy',
    gradient: 'linear-gradient(135deg, #3a6a5a, #1a2a2a)',
    shots: 8, done: 3, progress: 37, stage: 'Материалы', due: '2 мая',
    status: 'ACTIVE' as const,
  },
];

const STATUS_BADGE: Record<string, { kind: 'done' | 'wip' | 'neutral'; label: string }> = {
  ACTIVE: { kind: 'wip', label: 'Активный' },
  COMPLETED: { kind: 'done', label: 'Завершён' },
  ARCHIVED: { kind: 'neutral', label: 'Архив' },
};

export default function ProjectsTable() {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.title}>Проекты</span>
        <Link href="/projects" className={styles.link}>Все проекты</Link>
      </div>
      <table className={styles.table}>
        <thead>
          <tr className={styles.thead}>
            <th>Проект</th>
            <th>Прогресс</th>
            <th>Этап</th>
            <th>Статус</th>
            <th>Дедлайн</th>
          </tr>
        </thead>
        <tbody>
          {PROJECTS.map((p) => {
            const badge = STATUS_BADGE[p.status];
            return (
              <tr key={p.id} className={styles.row}>
                <td>
                  <Link href={`/projects/${p.id}`} className={styles.projectCell}>
                    <div
                      className={styles.thumb}
                      style={{ background: p.gradient }}
                      aria-hidden
                    />
                    <div>
                      <div className={styles.projectTitle}>{p.title}</div>
                      <div className={styles.client}>{p.client}</div>
                    </div>
                  </Link>
                </td>
                <td className={styles.progressCell}>
                  <ProgressBar value={p.progress} height={6} />
                  <span className={styles.progressLabel}>{p.done}/{p.shots}</span>
                </td>
                <td className={styles.stage}>{p.stage}</td>
                <td>
                  <Badge kind={badge.kind} size="sm">{badge.label}</Badge>
                </td>
                <td className={styles.due}>{p.due}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
