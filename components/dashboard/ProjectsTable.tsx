import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { computeProgress } from '@/lib/utils';
import Badge from '@/components/ui/Badge/Badge';
import ProgressBar from '@/components/ui/ProgressBar/ProgressBar';
import styles from './ProjectsTable.module.css';

const STATUS_BADGE: Record<string, { kind: 'done' | 'wip' | 'neutral'; label: string }> = {
  ACTIVE: { kind: 'wip', label: 'Активный' },
  PAUSED: { kind: 'neutral', label: 'Пауза' },
  DONE: { kind: 'done', label: 'Завершён' },
  ARCHIVED: { kind: 'neutral', label: 'Архив' },
};

export default async function ProjectsTable() {
  const projects = await prisma.project.findMany({
    include: {
      shots: {
        include: { items: { select: { state: true } } },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 6,
  });

  const rows = projects.map((p) => {
    const allItems = p.shots.flatMap((s) => s.items);
    const progress = computeProgress(allItems as { state: 'TODO' | 'WIP' | 'DONE' | 'BLOCKED' }[]);
    const doneShots = p.shots.filter((s) => s.status === 'DONE').length;
    const due = p.dueDate
      ? new Date(p.dueDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
      : '—';

    return { ...p, progress, doneShots, due };
  });

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
            <th>Шоты</th>
            <th>Статус</th>
            <th>Дедлайн</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => {
            const badge = STATUS_BADGE[p.status] ?? STATUS_BADGE.ACTIVE;
            return (
              <tr key={p.id} className={styles.row}>
                <td>
                  <Link href={`/projects/${p.id}`} className={styles.projectCell}>
                    <div
                      className={styles.thumb}
                      style={{ background: p.coverGradient }}
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
                  <span className={styles.progressLabel}>{Math.round(p.progress)}%</span>
                </td>
                <td className={styles.stage}>
                  {p.doneShots}/{p.shots.length}
                </td>
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
