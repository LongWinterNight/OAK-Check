import Sidebar from '@/components/layout/Sidebar/Sidebar';
import styles from './layout.module.css';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <Sidebar />
      <div className={styles.main}>{children}</div>
    </div>
  );
}
