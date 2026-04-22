import { auth } from '@/auth';
import { can, type Role } from '@/lib/roles';
import TopBar from '@/components/layout/TopBar/TopBar';
import StatsRow from '@/components/dashboard/StatsRow';
import ProjectsTable from '@/components/dashboard/ProjectsTable';
import MyDay from '@/components/dashboard/MyDay';
import MyShots from '@/components/dashboard/MyShots';
import DeadlineAlert from '@/components/dashboard/DeadlineAlert';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import styles from './page.module.css';

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;
  const userRole = (session?.user as { role?: string })?.role as Role | undefined;

  const showDeadlines = userRole && ['PM', 'LEAD', 'ADMIN'].includes(userRole);
  const showMyShots = userRole && ['ARTIST', 'QA', 'POST'].includes(userRole) && userId;

  return (
    <>
      <TopBar breadcrumbs={[{ label: 'Дашборд' }]} action={null} />
      <div className={styles.content}>
        {showDeadlines && <DeadlineAlert />}
        <StatsRow />
        <div className={styles.grid}>
          <div className={styles.left}>
            <ProjectsTable />
            {showMyShots && <MyShots userId={userId!} />}
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
