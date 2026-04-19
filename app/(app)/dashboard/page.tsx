import TopBar from '@/components/layout/TopBar/TopBar';
import { Button } from '@/components/ui';
import { Icons } from '@/components/icons';
import StatsRow from '@/components/dashboard/StatsRow';
import ProjectsTable from '@/components/dashboard/ProjectsTable';
import MyDay from '@/components/dashboard/MyDay';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import styles from './page.module.css';

export default function DashboardPage() {
  return (
    <>
      <TopBar
        breadcrumbs={[{ label: 'Дашборд' }]}
        action={
          <Button variant="secondary" size="sm" icon={<Icons.Plus size={14} />}>
            Новый шот
          </Button>
        }
      />
      <div className={styles.content}>
        <StatsRow />
        <div className={styles.grid}>
          <div className={styles.left}>
            <ProjectsTable />
          </div>
          <div className={styles.right}>
            <MyDay />
            <ActivityFeed />
          </div>
        </div>
      </div>
    </>
  );
}
