import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import TopBar from '@/components/layout/TopBar/TopBar';
import SettingsShell from './SettingsShell';
import styles from './page.module.css';

export default async function SettingsPage() {
  const session = await auth();
  const sessionUser = session?.user as { id?: string; role?: string; name?: string; email?: string } | undefined;

  const [users, projects, stats] = await Promise.all([
    prisma.user.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, email: true, role: true, online: true, avatarUrl: true, createdAt: true },
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
  ]);

  const [totalShots, totalItems, totalComments, totalVersions] = stats;

  const currentUser = sessionUser ? {
    id: sessionUser.id ?? '',
    name: sessionUser.name ?? '',
    email: sessionUser.email ?? '',
    role: (sessionUser.role ?? 'ARTIST') as string,
  } : null;

  return (
    <>
      <TopBar breadcrumbs={[{ label: 'Настройки' }]} />
      <div className={styles.content}>
        <SettingsShell
          currentUser={currentUser}
          users={users.map(u => ({ ...u, createdAt: u.createdAt.toISOString() }))}
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
        />
      </div>
    </>
  );
}
