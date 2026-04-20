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
            items: { select: { state: true } },
            owner: { select: { name: true } },
          },
          orderBy: { code: 'asc' },
        },
      },
    }),
    auth(),
  ]);

  if (!project) notFound();

  const shots = project.shots.map((s) => ({
    id: s.id,
    code: s.code,
    title: s.title,
    status: s.status,
    owner: s.owner?.name ?? null,
    progress: computeProgress(s.items as { state: 'TODO' | 'WIP' | 'DONE' | 'BLOCKED' }[]),
  }));

  const userRole = (session?.user?.role ?? 'ARTIST') as Role;

  return (
    <ProjectDetailClient
      projectId={projectId}
      projectTitle={project.title}
      projectClient={project.client}
      shots={shots}
      userRole={userRole}
    />
  );
}
