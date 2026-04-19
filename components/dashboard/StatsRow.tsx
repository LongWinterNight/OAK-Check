import { prisma } from '@/lib/prisma';
import styles from './StatsRow.module.css';

export default async function StatsRow() {
  const [totalShots, wipShots, blockedItems] = await Promise.all([
    prisma.shot.count(),
    prisma.shot.count({ where: { status: 'WIP' } }),
    prisma.checkItem.count({ where: { state: 'BLOCKED' } }),
  ]);

  const doneToday = await prisma.checkItem.count({
    where: {
      state: 'DONE',
      updatedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    },
  });

  const stats = [
    { label: 'Всего шотов', value: String(totalShots), note: 'по всем проектам' },
    { label: 'В работе', value: String(wipShots), note: 'статус WIP' },
    { label: 'Готово сегодня', value: String(doneToday), note: 'пунктов чеклиста' },
    { label: 'Блокеров', value: String(blockedItems), note: 'требуют внимания' },
  ];

  return (
    <div className={styles.row}>
      {stats.map((s) => (
        <div key={s.label} className={styles.card}>
          <div className={styles.label}>{s.label}</div>
          <div className={styles.value}>{s.value}</div>
          <div className={styles.note}>{s.note}</div>
        </div>
      ))}
    </div>
  );
}
