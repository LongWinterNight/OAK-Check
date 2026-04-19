import TopBar from '@/components/layout/TopBar/TopBar';
import { Button } from '@/components/ui';
import { Icons } from '@/components/icons';
import styles from './page.module.css';

export default function ProjectsPage() {
  return (
    <>
      <TopBar
        breadcrumbs={[{ label: 'Проекты' }]}
        action={
          <Button variant="primary" size="sm" icon={<Icons.Plus size={14} />}>
            Новый проект
          </Button>
        }
      />
      <div className={styles.content}>
        <h1 className={styles.title}>Проекты</h1>
        <p className={styles.note}>Страница в разработке — будет дополнена после Checklist.</p>
      </div>
    </>
  );
}
