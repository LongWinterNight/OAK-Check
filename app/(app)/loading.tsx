import styles from './error.module.css';

export default function AppLoading() {
  return (
    <div className={styles.wrap}>
      <div className={styles.desc}>Загрузка…</div>
    </div>
  );
}
