import TopBar from '@/components/layout/TopBar/TopBar';
import { ActivityFeedInfinite } from '@/components/activity/ActivityFeedInfinite';
import styles from './page.module.css';

export default function ActivityPage() {
  return (
    <>
      <TopBar breadcrumbs={[{ label: 'Лента активности' }]} />
      <div className={styles.content}>
        <ActivityFeedInfinite />
      </div>
    </>
  );
}
