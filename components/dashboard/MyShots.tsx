import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Badge, ProgressBar } from '@/components/ui';
import { shotStatusBadgeKind } from '@/lib/utils';
import styles from './MyShots.module.css';

const STATUS_LABELS: Record<string, string> = {
  TODO: 'Бэклог', WIP: 'В работе', REVIEW: 'На ревью', DONE: 'Сдано',
};

interface MyShotsProps {
  userId: string;
}

export default async function MyShots({ userId }: MyShotsProps) {
  const shots = await prisma.shot.findMany({
    where: { assigneeId: userId, status: { not: 'DONE' } },
    include: {
      project: { select: { id: true, title: true } },
      items: { select: { state: true } },
    },
    orderBy: { dueDate: 'asc' },
    take: 10,
  });

  const rows = shots.map((s) => {
    const total = s.items.length;
    const done = s.items.filter((i) => i.state === 'DONE').length;
    const progress = total > 0 ? Math.round((done / total) * 100) : 0;
    const due = s.dueDate
      ? new Date(s.dueDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
      : null;
    return { ...s, progress, due };
  });

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.title}>Мои шоты</span>
        <span className={styles.count}>{rows.length} активных</span>
      </div>
      {rows.length === 0 ? (
        <div className={styles.empty}>Нет назначенных шотов</div>
      ) : (
        <div className={styles.list}>
          {rows.map((shot) => (
            <Link
              key={shot.id}
              href={`/projects/${shot.project.id}/${shot.id}/checklist`}
              className={styles.row}
            >
              <div className={styles.info}>
                <div className={styles.shotTitle}>{shot.title}</div>
                <div className={styles.meta}>{shot.project.title} · {shot.code}</div>
              </div>
              <div className={styles.right}>
                <div className={styles.progressWrap}>
                  <ProgressBar value={shot.progress} height={4} />
                  <span className={styles.pct}>{shot.progress}%</span>
                </div>
                <Badge
                  kind={shotStatusBadgeKind(shot.status as 'TODO' | 'WIP' | 'REVIEW' | 'DONE')}
                  size="sm"
                  dot
                >
                  {STATUS_LABELS[shot.status] ?? shot.status}
                </Badge>
                {shot.due && <span className={styles.due}>{shot.due}</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
