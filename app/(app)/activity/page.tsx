import TopBar from '@/components/layout/TopBar/TopBar';
import styles from './page.module.css';

export default function ActivityPage() {
  return (
    <>
      <TopBar breadcrumbs={[{ label: 'Лента активности' }]} />
      <div className={styles.content}>
        <h1 className={styles.title}>Лента активности</h1>
        <p className={styles.note}>Страница в разработке.</p>
      </div>
    </>
  );
}
