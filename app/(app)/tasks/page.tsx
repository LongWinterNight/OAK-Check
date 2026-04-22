import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import TopBar from '@/components/layout/TopBar/TopBar';
import TasksClient, {
  type TaskItem,
  type ShotChapter,
  type TaskComment,
  type DayInfo,
  type ShotInfo,
} from './TasksClient';

export default async function TasksPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const userId = session.user.id;

  // Active assigned shot (WIP preferred, then REVIEW)
  const activeShot = await prisma.shot.findFirst({
    where: { assigneeId: userId, status: { in: ['WIP', 'REVIEW', 'TODO'] } },
    include: {
      chapters: {
        include: { items: { select: { state: true } } },
        orderBy: { order: 'asc' },
      },
      versions: { orderBy: { createdAt: 'desc' }, take: 1 },
      comments: {
        include: { user: { select: { id: true, name: true, avatarUrl: true } } },
        orderBy: { createdAt: 'asc' },
        take: 200,
      },
      items: {
        where: { ownerId: userId, state: { not: 'DONE' } },
        include: { chapter: { select: { title: true } } },
        orderBy: { order: 'asc' },
      },
      project: { select: { id: true, title: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });

  // Items for Today tab — all items assigned to user across all shots
  const rawItems = await prisma.checkItem.findMany({
    where: { ownerId: userId, state: { not: 'DONE' } },
    include: {
      chapter: { select: { title: true } },
      shot: { select: { id: true, code: true, projectId: true } },
    },
    orderBy: { updatedAt: 'desc' },
    take: 40,
  });

  const items: TaskItem[] = rawItems.map((i) => ({
    id: i.id,
    title: i.title,
    state: i.state as TaskItem['state'],
    shotId: i.shot.id,
    shotCode: i.shot.code,
    projectId: i.shot.projectId,
    chapterTitle: i.chapter?.title ?? null,
  }));

  const dayInfo: DayInfo = {
    total: items.length,
    done: 0,
    shotCode: activeShot?.code ?? null,
    projectTitle: activeShot?.project.title ?? null,
  };

  const chapters: ShotChapter[] = activeShot
    ? activeShot.chapters.map((ch) => ({
        id: ch.id,
        title: ch.title,
        total: ch.items.length,
        done: ch.items.filter((i) => i.state === 'DONE').length,
        projectId: activeShot.project.id,
        shotId: activeShot.id,
      }))
    : [];

  const comments: TaskComment[] = activeShot
    ? activeShot.comments.map((c) => ({
        id: c.id,
        body: c.body,
        createdAt: c.createdAt.toISOString(),
        user: c.user,
        pinX: (c as { pinX?: number | null }).pinX ?? null,
        pinY: (c as { pinY?: number | null }).pinY ?? null,
      }))
    : [];

  const latestVersion = activeShot?.versions[0]?.version ?? null;
  const previewUrl = (activeShot?.versions[0] as { url?: string } | undefined)?.url ?? null;
  const pinCount = activeShot
    ? await prisma.comment.count({
        where: {
          shotId: activeShot.id,
          pinX: { not: null },
        },
      })
    : 0;

  const shot: ShotInfo | null = activeShot
    ? {
        id: activeShot.id,
        projectId: activeShot.project.id,
        latestVersion,
        pinCount,
        previewUrl,
      }
    : null;

  return (
    <>
      <TopBar breadcrumbs={[{ label: 'Задачи' }]} />
      <TasksClient
        items={items}
        chapters={chapters}
        comments={comments}
        day={dayInfo}
        shot={shot}
        currentUserId={userId}
      />
    </>
  );
}
