import { auth } from '@/auth';
import TopBar from '@/components/layout/TopBar/TopBar';
import { ProjectsGrid } from '@/components/projects/ProjectsGrid';
import { computeProgress } from '@/lib/utils';
import type { Role } from '@/lib/roles';
import styles from './page.module.css';

async function getProjects() {
  try {
    const { prisma } = await import('@/lib/prisma');
    const projects = await prisma.project.findMany({
      include: {
        shots: {
          include: {
            items: { select: { state: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return projects.map((p) => {
      const shots = p.shots.map((s) => ({
        id: s.id,
        code: s.code,
        status: s.status,
        progress: computeProgress(s.items as { state: 'TODO' | 'WIP' | 'DONE' | 'BLOCKED' }[]),
      }));
      const totalProgress =
        shots.length > 0
          ? shots.reduce((sum, s) => sum + s.progress, 0) / shots.length
          : 0;

      return {
        id: p.id,
        title: p.title,
        client: p.client,
        status: p.status,
        dueDate: p.dueDate?.toISOString() ?? null,
        coverGradient: p.coverGradient,
        coverImage: p.coverImage,
        shots,
        totalProgress,
      };
    });
  } catch {
    return [];
  }
}

export default async function ProjectsPage() {
  const [projects, session] = await Promise.all([getProjects(), auth()]);
  const userRole = session?.user?.role ?? 'ARTIST';

  return (
    <>
      <TopBar breadcrumbs={[{ label: 'Проекты' }]} />
      <div className={styles.content}>
        <ProjectsGrid initialProjects={projects} userRole={userRole} />
      </div>
    </>
  );
}
