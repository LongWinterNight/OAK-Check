import Avatar from '@/components/ui/Avatar/Avatar';
import styles from './ActivityFeed.module.css';

const ACTIVITY = [
  { user: 'Артём Ковалёв', time: '11:30', text: 'обновил версию шота до v012', shot: 'SH04' },
  { user: 'Катя Смирнова', time: '11:15', text: 'оставила комментарий: firefly на карнизах', shot: 'SH04' },
  { user: 'Дарья Лин',     time: '10:42', text: 'пометила «HDRI multiplier» как требующий правки', shot: 'SH04' },
  { user: 'Артём Ковалёв', time: '10:05', text: 'загрузил test-render 1080p', shot: 'SH04' },
  { user: 'Дарья Лин',     time: 'вчера', text: 'согласовала моделирование', shot: 'SH04' },
  { user: 'Миша Петров',   time: 'вчера', text: 'добавил 3 референса в pre-production', shot: 'SH04' },
];

export default function ActivityFeed() {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.title}>Активность</span>
      </div>
      <div className={styles.list}>
        {ACTIVITY.map((a, i) => (
          <div key={i} className={styles.row}>
            <span className={styles.time}>{a.time}</span>
            <Avatar name={a.user} size={22} />
            <div className={styles.text}>
              <span className={styles.name}>{a.user.split(' ')[0]}</span>{' '}
              <span className={styles.action}>{a.text}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
