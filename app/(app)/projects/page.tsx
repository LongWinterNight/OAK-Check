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
            items: { select: { state: true, chapter: { select: { title: true } } } },
            owner: { select: { id: true, name: true, avatarUrl: true } },
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

      // Считаем агрегаты — нужны для бейджей на карточке
      const reviewCount = shots.filter((s) => s.status === 'REVIEW').length;
      const blockedItemsCount = p.shots.reduce(
        (sum, s) => sum + s.items.filter((i) => i.state === 'BLOCKED').length,
        0,
      );

      // Активный этап = глава с наибольшим количеством WIP-пунктов по проекту.
      // Если ничего нет — «—».
      const stageCounts = new Map<string, number>();
      for (const s of p.shots) {
        for (const it of s.items) {
          if (it.state === 'WIP' && it.chapter?.title) {
            stageCounts.set(it.chapter.title, (stageCounts.get(it.chapter.title) ?? 0) + 1);
          }
        }
      }
      const activeStage = [...stageCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

      // Уникальные участники команды (исполнители шотов) — максимум 3 для аватаров
      const memberMap = new Map<string, { id: string; name: string; avatarUrl: string | null }>();
      for (const s of p.shots) {
        if (s.owner && !memberMap.has(s.owner.id)) {
          memberMap.set(s.owner.id, s.owner);
        }
      }
      const members = [...memberMap.values()].slice(0, 4);

      const totalProgress =
        shots.length > 0
          ? shots.reduce((sum, s) => sum + s.progress, 0) / shots.length
          : 0;

      const doneShots = shots.filter((s) => s.status === 'DONE').length;

      return {
        id: p.id,
        title: p.title,
        client: p.client,
        status: p.status,
        dueDate: p.dueDate?.toISOString() ?? null,
        coverGradient: p.coverGradient,
        coverImage: p.coverImage,
        shots,
        doneShots,
        totalProgress,
        reviewCount,
        blockedItemsCount,
        activeStage,
        members,
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
