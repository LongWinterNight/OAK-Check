import TopBar from '@/components/layout/TopBar/TopBar';
import KanbanBoard from '@/components/kanban/KanbanBoard';
import styles from './page.module.css';

export default function KanbanPage() {
  return (
    <>
      <TopBar breadcrumbs={[{ label: 'Канбан' }]} />
      <div className={styles.content}>
        <KanbanBoard />
      </div>
    </>
  );
}
