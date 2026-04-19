import { SkeletonCard } from '@/components/ui/Skeleton/Skeleton';
import styles from './loading.module.css';

export default function ProjectsLoading() {
  return (
    <div className={styles.root}>
      <div className={styles.toolbar}>
        <div className={styles.searchSkeleton} />
        <div className={styles.btnSkeleton} />
      </div>
      <div className={styles.grid}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
