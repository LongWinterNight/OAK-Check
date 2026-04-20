import { auth } from '@/auth';
import TopBar from '@/components/layout/TopBar/TopBar';
import StatsRow from '@/components/dashboard/StatsRow';
import ProjectsTable from '@/components/dashboard/ProjectsTable';
import MyDay from '@/components/dashboard/MyDay';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import styles from './page.module.css';

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;

  return (
    <>
      <TopBar breadcrumbs={[{ label: 'Дашборд' }]} action={null} />
      <div className={styles.content}>
        <StatsRow />
        <div className={styles.grid}>
          <div className={styles.left}>
            <ProjectsTable />
          </div>
          <div className={styles.right}>
            <MyDay userId={userId} />
            <ActivityFeed />
          </div>
        </div>
      </div>
    </>
  );
}
