'use client';

import styles from './tab.module.css';

type User = { id: string; name: string; online: boolean; createdAt: string };

interface SystemTabProps {
  stats: { totalShots: number; totalItems: number; totalComments: number; totalVersions: number };
  users: User[];
}

export default function SystemTab({ stats, users }: SystemTabProps) {
  const onlineCount = users.filter(u => u.online).length;
  const newestUser = users.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];

  function clearCache() {
    alert('Для очистки кэша Next.js перезапустите сервер разработки.');
  }

  return (
    <>
      {/* Stats */}
      <div className={styles.section}>
        <div className={styles.sectionHead}>
          <div>
            <div className={styles.sectionTitle}>Статистика системы</div>
            <div className={styles.sectionDesc}>Общие данные по базе OAK·Check</div>
          </div>
        </div>
        <div className={styles.sectionBody}>
          <div className={styles.statGrid}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{stats.totalShots}</div>
              <div className={styles.statLabel}>Шотов</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{stats.totalItems}</div>
              <div className={styles.statLabel}>Пунктов чеклиста</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{stats.totalComments}</div>
              <div className={styles.statLabel}>Комментариев</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{stats.totalVersions}</div>
              <div className={styles.statLabel}>Версий рендера</div>
            </div>
          </div>
        </div>
      </div>

      {/* Users online */}
      <div className={styles.section}>
        <div className={styles.sectionHead}>
          <div>
            <div className={styles.sectionTitle}>Активность пользователей</div>
            <div className={styles.sectionDesc}>Онлайн: {onlineCount} из {users.length}</div>
          </div>
        </div>
        <div className={styles.sectionBody}>
          <div className={styles.statGrid}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{onlineCount}</div>
              <div className={styles.statLabel}>Сейчас онлайн</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{users.length}</div>
              <div className={styles.statLabel}>Всего участников</div>
            </div>
          </div>
          {newestUser && (
            <div style={{ fontSize: 12, color: 'var(--fg-subtle)' }}>
              Последний добавленный: <strong style={{ color: 'var(--fg)' }}>{newestUser.name}</strong>
              {' '}— {new Date(newestUser.createdAt).toLocaleDateString('ru-RU')}
            </div>
          )}
        </div>
      </div>

      {/* Database info */}
      <div className={styles.section}>
        <div className={styles.sectionHead}>
          <div>
            <div className={styles.sectionTitle}>База данных</div>
            <div className={styles.sectionDesc}>PostgreSQL · oak_check</div>
          </div>
        </div>
        <div className={styles.sectionBody}>
          <table className={styles.table}>
            <tbody>
              <tr>
                <td style={{ fontWeight: 500, width: '40%' }}>СУБД</td>
                <td>PostgreSQL 18</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 500 }}>База</td>
                <td>oak_check</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 500 }}>ORM</td>
                <td>Prisma 7 (adapter-pg)</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 500 }}>Хранилище файлов</td>
                <td>Локальный диск · /public/uploads</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 500 }}>Реальное время</td>
                <td>Server-Sent Events (SSE)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* System actions */}
      <div className={styles.section}>
        <div className={styles.sectionHead}>
          <div>
            <div className={styles.sectionTitle}>Системные операции</div>
            <div className={styles.sectionDesc}>Администрирование приложения</div>
          </div>
        </div>
        <div className={styles.sectionBody}>
          <div style={{ display: 'flex', gap: 'var(--spacing-3)', flexWrap: 'wrap' }}>
            <button className="btn" onClick={clearCache}>Очистить кэш Next.js</button>
          </div>
          <div className={styles.hint} style={{ marginTop: 4 }}>
            Очистка кэша может помочь при проблемах с отображением актуальных данных.
          </div>
        </div>
      </div>
    </>
  );
}
