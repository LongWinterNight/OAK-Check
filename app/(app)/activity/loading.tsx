import { Skeleton } from '@/components/ui/Skeleton/Skeleton';
import styles from './loading.module.css';

export default function ActivityLoading() {
  return (
    <div className={styles.root}>
      {[1, 2, 3].map((g) => (
        <div key={g} className={styles.group}>
          <Skeleton width={120} height={10} radius={4} />
          <div className={styles.items}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={styles.row}>
                <Skeleton width={26} height={26} radius={13} />
                <div className={styles.text}>
                  <Skeleton width="65%" height={12} radius={4} />
                  <Skeleton width="35%" height={10} radius={4} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
