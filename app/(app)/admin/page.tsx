import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import TopBar from '@/components/layout/TopBar/TopBar';
import styles from './page.module.css';

function fmtBytes(bytes: number) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

const ROLE_LABELS: Record<string, string> = {
  ARTIST: 'Artist', QA: 'QA', LEAD: 'Lead',
  POST: 'Post', PM: 'PM', ADMIN: 'Admin',
};

const STATUS_LABELS: Record<string, string> = {
  TODO: 'Бэклог', WIP: 'В работе', REVIEW: 'На ревью', DONE: 'Сдано',
};

const STATUS_COLORS: Record<string, string> = {
  TODO: 'var(--fg-subtle)',
  WIP: 'var(--accent)',
  REVIEW: '#f59e0b',
  DONE: 'var(--done)',
};

export default async function AdminPage() {
  const session = await auth();
  if (!session || (session.user as { role?: string }).role !== 'ADMIN') redirect('/dashboard');

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    usersByRole,
    totalProjects,
    activeProjects,
    totalShots,
    shotsByStatus,
    recentLogins,
    pendingInvitations,
    storageResult,
  ] = await prisma.$transaction([
    prisma.user.count(),
    prisma.user.groupBy({ by: ['role'], _count: { _all: true }, orderBy: { role: 'asc' } }),
    prisma.project.count(),
    prisma.project.count({ where: { status: 'ACTIVE' } }),
    prisma.shot.count(),
    prisma.shot.groupBy({ by: ['status'], _count: { _all: true }, orderBy: { status: 'asc' } }),
    prisma.user.count({ where: { lastLoginAt: { gte: sevenDaysAgo } } }),
    prisma.invitation.count({ where: { usedAt: null, expiresAt: { gte: new Date() } } }),
    prisma.renderVersion.aggregate({ _sum: { fileSize: true } }),
  ]);

  const storageUsedBytes = storageResult._sum.fileSize ?? 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const roleMap = Object.fromEntries(usersByRole.map((r) => [r.role, (r._count as any)?._all ?? 0]));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const statusMap = Object.fromEntries(shotsByStatus.map((s) => [s.status, (s._count as any)?._all ?? 0]));

  return (
    <>
      <TopBar breadcrumbs={[{ label: 'Администрирование' }]} />
      <div className={styles.content}>
        <div className={styles.grid}>

          {/* Users */}
          <div className={styles.card}>
            <div className={styles.cardLabel}>Пользователи</div>
            <div className={styles.cardValue}>{totalUsers}</div>
            <div className={styles.cardSub}>{recentLogins} активных за 7 дней</div>
            <div className={styles.breakdown}>
              {Object.entries(roleMap).map(([role, count]) => (
                <div key={role} className={styles.breakdownRow}>
                  <span className={styles.breakdownLabel}>{ROLE_LABELS[role] ?? role}</span>
                  <span className={styles.breakdownCount}>{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Projects */}
          <div className={styles.card}>
            <div className={styles.cardLabel}>Проекты</div>
            <div className={styles.cardValue}>{totalProjects}</div>
            <div className={styles.cardSub}>{activeProjects} активных</div>
            <div className={styles.cardMeta}>
              <span className={styles.metaTag} style={{ color: 'var(--done)' }}>
                {totalProjects - activeProjects} завершено
              </span>
            </div>
          </div>

          {/* Shots */}
          <div className={styles.card}>
            <div className={styles.cardLabel}>Шоты</div>
            <div className={styles.cardValue}>{totalShots}</div>
            <div className={styles.breakdown}>
              {(['TODO', 'WIP', 'REVIEW', 'DONE'] as const).map((s) => (
                <div key={s} className={styles.breakdownRow}>
                  <span className={styles.breakdownLabel} style={{ color: STATUS_COLORS[s] }}>
                    {STATUS_LABELS[s]}
                  </span>
                  <span className={styles.breakdownCount}>{statusMap[s] ?? 0}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Storage */}
          <div className={styles.card}>
            <div className={styles.cardLabel}>Хранилище</div>
            <div className={styles.cardValue}>{fmtBytes(storageUsedBytes)}</div>
            <div className={styles.cardSub}>объём загруженных версий</div>
          </div>

          {/* Invitations */}
          <div className={styles.card}>
            <div className={styles.cardLabel}>Приглашения</div>
            <div className={styles.cardValue}>{pendingInvitations}</div>
            <div className={styles.cardSub}>ожидают принятия</div>
            <a href="/settings?tab=team" className={styles.cardLink}>Управление командой →</a>
          </div>

        </div>
      </div>
    </>
  );
}
