import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Icons } from '@/components/icons';
import styles from './DeadlineAlert.module.css';

export default async function DeadlineAlert() {
  const tomorrow = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const urgentShots = await prisma.shot.findMany({
    where: {
      dueDate: { gte: today, lte: tomorrow },
      status: { not: 'DONE' },
    },
    include: { project: { select: { id: true, title: true } } },
    orderBy: { dueDate: 'asc' },
    take: 5,
  });

  if (urgentShots.length === 0) return null;

  return (
    <div className={styles.alert}>
      <div className={styles.header}>
        <Icons.Clock size={14} />
        <span>Дедлайн сегодня / завтра</span>
        <span className={styles.badge}>{urgentShots.length}</span>
      </div>
      <div className={styles.list}>
        {urgentShots.map((shot) => {
          const due = new Date(shot.dueDate!);
          const isToday = due.toDateString() === new Date().toDateString();
          return (
            <Link
              key={shot.id}
              href={`/projects/${shot.project.id}/${shot.id}/checklist`}
              className={styles.item}
            >
              <span className={[styles.dot, isToday ? styles.dotUrgent : styles.dotSoon].join(' ')} />
              <span className={styles.code}>{shot.code}</span>
              <span className={styles.title}>{shot.title}</span>
              <span className={styles.project}>{shot.project.title}</span>
              <span className={[styles.due, isToday ? styles.dueUrgent : ''].join(' ')}>
                {isToday ? 'Сегодня' : 'Завтра'}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
