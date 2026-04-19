import { prisma } from '@/lib/prisma';
import Avatar from '@/components/ui/Avatar/Avatar';
import styles from './ActivityFeed.module.css';

function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 24) return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  return 'вчера';
}

export default async function ActivityFeed() {
  const activities = await prisma.activity.findMany({
    include: { user: true },
    orderBy: { createdAt: 'desc' },
    take: 8,
  });

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.title}>Активность</span>
      </div>
      <div className={styles.list}>
        {activities.map((a) => (
          <div key={a.id} className={styles.row}>
            <span className={styles.time}>{formatTime(a.createdAt)}</span>
            <Avatar name={a.user.name} size={22} />
            <div className={styles.text}>
              <span className={styles.name}>{a.user.name.split(' ')[0]}</span>{' '}
              <span className={styles.action}>{a.message}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
