import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getStorageStatus } from '@/lib/storage';
import TopBar from '@/components/layout/TopBar/TopBar';
import SettingsShell from './SettingsShell';
import styles from './page.module.css';

export default async function SettingsPage() {
  const session = await auth();
  const isAdmin = session?.user?.role === 'ADMIN';

  const [users, projects, stats, storage] = await Promise.all([
    prisma.user.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, email: true, username: true, role: true, online: true, avatarUrl: true, createdAt: true, lastLoginAt: true, lastSeenAt: true },
    }),
    prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
      include: { shots: { select: { id: true } } },
    }),
    Promise.all([
      prisma.shot.count(),
      prisma.checkItem.count(),
      prisma.comment.count(),
      prisma.renderVersion.count(),
    ]),
    isAdmin ? getStorageStatus() : Promise.resolve(null),
  ]);

  const [totalShots, totalItems, totalComments, totalVersions] = stats;

  const currentUserDb = session?.user?.id
    ? users.find(u => u.id === session.user.id) ?? null
    : null;

  const currentUser = session?.user ? {
    id: session.user.id,
    name: session.user.name ?? '',
    email: session.user.email ?? '',
    username: currentUserDb?.username ?? null,
    role: session.user.role,
    avatarUrl: currentUserDb?.avatarUrl ?? null,
    lastLoginAt: currentUserDb?.lastLoginAt?.toISOString() ?? null,
  } : null;

  return (
    <>
      <TopBar breadcrumbs={[{ label: 'Настройки' }]} />
      <div className={styles.content}>
        <SettingsShell
          currentUser={currentUser}
          users={users.map(u => ({
            ...u,
            createdAt: u.createdAt.toISOString(),
            // online = heartbeat за последние 2 минуты (lastSeenAt свежее)
            online: u.lastSeenAt ? u.lastSeenAt.getTime() >= Date.now() - 2 * 60_000 : false,
          }))}
          projects={projects.map(p => ({
            id: p.id,
            title: p.title,
            client: p.client,
            status: p.status,
            shotsCount: p.shots.length,
            coverGradient: p.coverGradient,
            dueDate: p.dueDate?.toISOString() ?? null,
          }))}
          systemStats={{ totalShots, totalItems, totalComments, totalVersions }}
          storage={storage}
        />
      </div>
    </>
  );
}
