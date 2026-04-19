import { auth } from '@/auth';
import { Icons } from '@/components/icons';
import { NavLinks } from './NavLinks';
import { UserRow } from './UserRow';
import styles from './Sidebar.module.css';

async function getProjects() {
  try {
    const { prisma } = await import('@/lib/prisma');
    const projects = await prisma.project.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, title: true, coverGradient: true },
      orderBy: { createdAt: 'desc' },
      take: 8,
    });
    return projects.map((p) => ({
      id: p.id,
      name: p.title,
      gradient: p.coverGradient,
    }));
  } catch {
    return [
      { id: 'proj_skolkovo', name: 'Skolkovo One', gradient: 'linear-gradient(135deg, #3a5a7a, #1a2a3a)' },
      { id: 'proj_kosmo',    name: 'Kosmo',        gradient: 'linear-gradient(135deg, #5a3a5a, #2a1a2a)' },
    ];
  }
}

export default async function Sidebar() {
  const [session, projects] = await Promise.all([auth(), getProjects()]);
  const user = session?.user;

  return (
    <aside className={styles.sidebar}>
      {/* Логотип */}
      <div className={styles.logo}>
        <div className={styles.logoIcon}>
          <Icons.Oak size={18} color="var(--oak)" />
        </div>
        <div className={styles.logoText}>
          <span className={styles.logoTitle}>OAK·Check</span>
          <span className={styles.logoSub}>studio · 3DsMax pipeline</span>
        </div>
      </div>

      {/* Навигация */}
      <NavLinks projects={projects} />

      {/* Пользователь */}
      <div className={styles.userRow}>
        <UserRow
          name={user?.name ?? 'Пользователь'}
          role={(user as { role?: string })?.role ?? 'ARTIST'}
        />
      </div>
    </aside>
  );
}
