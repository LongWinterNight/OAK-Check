import { SkeletonCard } from '@/components/ui/Skeleton/Skeleton';
import styles from './loading.module.css';

export default function LibraryLoading() {
  return (
    <div className={styles.root}>
      <div className={styles.toolbar}>
        <div className={styles.searchSkeleton} />
      </div>
      <div className={styles.cats}>
        {[80, 100, 70, 90, 60].map((w, i) => (
          <div key={i} className={styles.catSkeleton} style={{ width: w }} />
        ))}
      </div>
      <div className={styles.grid}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
