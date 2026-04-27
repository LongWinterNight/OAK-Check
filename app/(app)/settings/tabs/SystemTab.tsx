'use client';

import { useState } from 'react';
import { toast } from '@/components/ui/Toast/toastStore';
import { ProgressBar } from '@/components/ui';
import { formatBytes } from '@/lib/format';
import type { StorageStatus } from '@/lib/storage';
import styles from './tab.module.css';

type User = { id: string; name: string; online: boolean; createdAt: string };

interface SystemTabProps {
  stats: { totalShots: number; totalItems: number; totalComments: number; totalVersions: number };
  users: User[];
  storage: StorageStatus | null;
}

export default function SystemTab({ stats, users, storage }: SystemTabProps) {
  const [cacheLoading, setCacheLoading] = useState(false);
  const onlineCount = users.filter(u => u.online).length;
  const newestUser = users.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];

  async function clearCache() {
    setCacheLoading(true);
    try {
      const res = await fetch('/api/admin/revalidate', { method: 'POST' });
      if (res.ok) toast.success('Кэш очищен');
      else toast.error('Не удалось очистить кэш');
    } catch {
      toast.error('Не удалось очистить кэш');
    } finally {
      setCacheLoading(false);
    }
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
          <table className={[styles.table, styles.tableKv].join(' ')}>
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
                <td style={{ fontWeight: 500 }}>Реальное время</td>
                <td>Server-Sent Events (SSE)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Storage */}
      {storage && (
        <div className={styles.section}>
          <div className={styles.sectionHead}>
            <div>
              <div className={styles.sectionTitle}>Хранилище файлов</div>
              <div className={styles.sectionDesc}>Google Drive · смонтированная папка</div>
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '4px 10px',
              borderRadius: 999,
              background: storage.accessible ? 'color-mix(in srgb, var(--done) 12%, transparent)' : 'color-mix(in srgb, var(--blocked) 12%, transparent)',
              color: storage.accessible ? 'var(--done)' : 'var(--blocked)',
              fontSize: 11, fontWeight: 500,
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: storage.accessible ? 'var(--done)' : 'var(--blocked)',
              }} />
              {storage.accessible ? 'Доступно' : 'Недоступно'}
            </div>
          </div>
          <div className={styles.sectionBody}>
            <table className={[styles.table, styles.tableKv].join(' ')}>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 500, width: '40%' }}>Путь</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{storage.path}</td>
                </tr>
                {storage.error && (
                  <tr>
                    <td style={{ fontWeight: 500 }}>Ошибка</td>
                    <td style={{ color: 'var(--blocked)' }}>{storage.error}</td>
                  </tr>
                )}
                <tr>
                  <td style={{ fontWeight: 500 }}>Использовано приложением</td>
                  <td>{formatBytes(storage.usedBytes)} <span style={{ color: 'var(--fg-subtle)' }}>· {storage.fileCount} файлов</span></td>
                </tr>
                {storage.diskTotalBytes !== undefined && storage.diskFreeBytes !== undefined && (
                  <>
                    <tr>
                      <td style={{ fontWeight: 500 }}>Свободно на диске</td>
                      <td>
                        {formatBytes(storage.diskFreeBytes)}
                        <span style={{ color: 'var(--fg-subtle)' }}>
                          {' '}из {formatBytes(storage.diskTotalBytes)}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={2} style={{ paddingTop: 8 }}>
                        <ProgressBar
                          value={Math.round((1 - storage.diskFreeBytes / storage.diskTotalBytes) * 100)}
                          height={6}
                        />
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
            <div className={styles.hint} style={{ marginTop: 8 }}>
              Файлы пишутся в локальную папку, Google Drive Desktop синхронизирует их в облако в фоне.
              Точная квота Google Drive здесь не показывается — для этого нужна нативная интеграция через API.
            </div>
          </div>
        </div>
      )}

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
            <button className={styles.btnPrimary} onClick={clearCache} disabled={cacheLoading}>
              {cacheLoading ? 'Очистка...' : 'Очистить кэш Next.js'}
            </button>
          </div>
          <div className={styles.hint} style={{ marginTop: 4 }}>
            Очистка кэша может помочь при проблемах с отображением актуальных данных.
          </div>
        </div>
      </div>
    </>
  );
}
