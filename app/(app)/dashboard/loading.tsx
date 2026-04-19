import { Skeleton } from '@/components/ui/Skeleton/Skeleton';
import styles from './loading.module.css';

export default function DashboardLoading() {
  return (
    <div className={styles.root}>
      {/* Stats row */}
      <div className={styles.statsRow}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={styles.statCard}>
            <Skeleton width={80} height={10} radius={4} />
            <Skeleton width={60} height={30} radius={6} />
            <Skeleton width={100} height={11} radius={4} />
          </div>
        ))}
      </div>

      {/* Two-column body */}
      <div className={styles.body}>
        <div className={styles.table}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={styles.tableRow}>
              <Skeleton width={44} height={44} radius={8} />
              <div className={styles.tableRowText}>
                <Skeleton width="60%" height={13} radius={4} />
                <Skeleton width="40%" height={10} radius={4} />
              </div>
              <Skeleton width={80} height={5} radius={3} />
              <Skeleton width={60} height={20} radius={100} />
            </div>
          ))}
        </div>

        <div className={styles.right}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={styles.activityRow}>
              <Skeleton width={26} height={26} radius={13} />
              <div className={styles.tableRowText}>
                <Skeleton width="70%" height={12} radius={4} />
                <Skeleton width="45%" height={10} radius={4} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
