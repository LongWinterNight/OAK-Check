import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { computeProgress } from '@/lib/utils';
import type { Role } from '@/lib/roles';
import ProjectDetailClient from './ProjectDetailClient';

export default async function ProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;

  const [project, session] = await Promise.all([
    prisma.project.findUnique({
      where: { id: projectId },
      include: {
        shots: {
          include: {
            items: { select: { state: true, chapter: { select: { title: true } } } },
            owner: { select: { id: true, name: true, avatarUrl: true } },
            versions: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              select: { version: true, url: true, thumbnailUrl: true },
            },
            _count: { select: { comments: true } },
          },
          orderBy: { code: 'asc' },
        },
      },
    }),
    auth(),
  ]);

  if (!project) notFound();

  const shots = project.shots.map((s) => {
    // Активный этап шота = глава с максимумом WIP-пунктов
    const stageCounts = new Map<string, number>();
    for (const it of s.items) {
      if (it.state === 'WIP' && it.chapter?.title) {
        stageCounts.set(it.chapter.title, (stageCounts.get(it.chapter.title) ?? 0) + 1);
      }
    }
    const stage = [...stageCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

    const blockedItemsCount = s.items.filter((i) => i.state === 'BLOCKED').length;
    const latestVersion = s.versions[0] ?? null;

    return {
      id: s.id,
      code: s.code,
      title: s.title,
      status: s.status,
      owner: s.owner,
      progress: computeProgress(s.items as { state: 'TODO' | 'WIP' | 'DONE' | 'BLOCKED' }[]),
      stage,
      blockedItemsCount,
      commentsCount: s._count.comments,
      latestVersion: latestVersion?.version ?? null,
      thumbnail: latestVersion?.thumbnailUrl ?? latestVersion?.url ?? null,
      dueDate: s.dueDate?.toISOString() ?? null,
    };
  });

  // Stats для hero-блока
  const total = shots.length;
  const wipCount = shots.filter((s) => s.status === 'WIP').length;
  const reviewCount = shots.filter((s) => s.status === 'REVIEW').length;
  const doneCount = shots.filter((s) => s.status === 'DONE').length;
  const todoCount = shots.filter((s) => s.status === 'TODO').length;
  const projectBlockedCount = shots.reduce((sum, s) => sum + s.blockedItemsCount, 0);
  const totalProgress = total > 0
    ? Math.round(shots.reduce((sum, s) => sum + s.progress, 0) / total)
    : 0;

  const userRole = (session?.user?.role ?? 'ARTIST') as Role;

  return (
    <ProjectDetailClient
      projectId={projectId}
      project={{
        id: project.id,
        title: project.title,
        client: project.client,
        coverGradient: project.coverGradient,
        coverImage: project.coverImage,
        dueDate: project.dueDate?.toISOString() ?? null,
      }}
      shots={shots}
      stats={{
        total,
        todo: todoCount,
        wip: wipCount,
        review: reviewCount,
        done: doneCount,
        blocked: projectBlockedCount,
        progress: totalProgress,
      }}
      userRole={userRole}
    />
  );
}
