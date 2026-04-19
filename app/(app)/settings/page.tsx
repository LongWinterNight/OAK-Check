import TopBar from '@/components/layout/TopBar/TopBar';
import SettingsClient from './SettingsClient';
import styles from './page.module.css';

export default function SettingsPage() {
  return (
    <>
      <TopBar breadcrumbs={[{ label: 'Настройки' }]} />
      <div className={styles.content}>
        <SettingsClient />
      </div>
    </>
  );
}
