import { prisma } from '@/lib/prisma';
import { MyDayList, type MyDayItem } from './MyDayList';
import styles from './MyDay.module.css';

const DB_TO_UI: Record<string, 'todo' | 'wip' | 'done' | 'blocked'> = {
  TODO: 'todo', WIP: 'wip', DONE: 'done', BLOCKED: 'blocked',
} as const;

interface MyDayProps {
  userId?: string;
}

export default async function MyDay({ userId }: MyDayProps) {
  if (!userId) {
    return (
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.title}>Мой день</span>
        </div>
        <div className={styles.empty}>Войдите, чтобы увидеть свои задачи</div>
      </div>
    );
  }

  const rawItems = await prisma.checkItem.findMany({
    where: { ownerId: userId, state: { not: 'DONE' } },
    include: {
      shot: {
        select: {
          id: true,
          code: true,
          projectId: true,
          project: { select: { title: true } },
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
    take: 8,
  });

  const items: MyDayItem[] = rawItems.map((i) => ({
    id: i.id,
    title: i.title,
    state: DB_TO_UI[i.state] ?? 'todo',
    shotId: i.shot.id,
    shotCode: i.shot.code,
    projectTitle: i.shot.project.title,
    projectId: i.shot.projectId,
  }));

  return (
    <div className={styles.card}>
      <MyDayList items={items} />
    </div>
  );
}
