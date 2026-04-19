import TopBar from '@/components/layout/TopBar/TopBar';
import styles from './page.module.css';

export default function LibraryPage() {
  return (
    <>
      <TopBar breadcrumbs={[{ label: 'Библиотека шаблонов' }]} />
      <div className={styles.content}>
        <h1 className={styles.title}>Библиотека шаблонов</h1>
        <p className={styles.note}>Страница в разработке.</p>
      </div>
    </>
  );
}
