import TopBar from '@/components/layout/TopBar/TopBar';
import styles from './page.module.css';

export default function KanbanPage() {
  return (
    <>
      <TopBar breadcrumbs={[{ label: 'Канбан' }]} />
      <div className={styles.content}>
        <h1 className={styles.title}>Канбан</h1>
        <p className={styles.note}>Страница в разработке — будет реализована на следующем шаге.</p>
      </div>
    </>
  );
}
