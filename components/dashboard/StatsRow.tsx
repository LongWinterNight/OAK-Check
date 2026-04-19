import styles from './StatsRow.module.css';

const STATS = [
  { label: 'Всего шотов', value: '62', note: 'по 4 проектам' },
  { label: 'В работе', value: '18', note: '↑3 за неделю' },
  { label: 'Готово сегодня', value: '7', note: '+2 vs вчера' },
  { label: 'Блокеров', value: '3', note: 'требуют внимания' },
];

export default function StatsRow() {
  return (
    <div className={styles.row}>
      {STATS.map((s) => (
        <div key={s.label} className={styles.card}>
          <div className={styles.label}>{s.label}</div>
          <div className={styles.value}>{s.value}</div>
          <div className={styles.note}>{s.note}</div>
        </div>
      ))}
    </div>
  );
}
