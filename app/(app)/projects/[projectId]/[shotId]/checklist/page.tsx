import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { computeChapterStats } from '@/lib/utils';
import type { ChapterWithItems } from '@/types';
import ChecklistClient from './ChecklistClient';

interface Props {
  params: Promise<{ projectId: string; shotId: string }>;
}

export default async function ChecklistPage({ params }: Props) {
  const { projectId, shotId } = await params;
  const session = await auth();

  const [shot, usersRaw] = await Promise.all([
    prisma.shot.findFirst({
      where: { id: shotId, projectId },
      include: { project: true, owner: true },
    }),
    prisma.user.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),
  ]);

  if (!shot) notFound();

  const items = await prisma.checkItem.findMany({
    where: { shotId },
    include: { chapter: true, owner: true },
    orderBy: [{ chapter: { order: 'asc' } }, { order: 'asc' }],
  });

  const chapterMap = new Map<string, typeof items[0]['chapter']>();
  for (const item of items) {
    if (!chapterMap.has(item.chapterId)) {
      chapterMap.set(item.chapterId, item.chapter);
    }
  }

  const chapters: ChapterWithItems[] = Array.from(chapterMap.values()).map((chapter) => {
    const chapterItems = items
      .filter((item) => item.chapterId === chapter.id)
      .map(({ chapter: _ch, ...item }) => ({
        ...item,
        state: item.state as 'TODO' | 'WIP' | 'DONE' | 'BLOCKED',
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
        owner: item.owner
          ? {
              ...item.owner,
              role: item.owner.role as 'ARTIST' | 'LEAD' | 'QA' | 'POST' | 'PM' | 'ADMIN',
              createdAt: item.owner.createdAt.toISOString(),
            }
          : null,
      }));

    const stats = computeChapterStats(chapterItems);

    return {
      id: chapter.id,
      shotId: chapter.shotId,
      title: chapter.title,
      order: chapter.order,
      items: chapterItems,
      ...stats,
    };
  });

  const versionsRaw = await prisma.renderVersion.findMany({
    where: { shotId },
    orderBy: { createdAt: 'asc' },
  });

  const versions = versionsRaw.map((ver) => ({
    ...ver,
    createdAt: ver.createdAt.toISOString(),
    thumbnailUrl: ver.thumbnailUrl ?? null,
    fileSize: ver.fileSize ?? null,
  }));

  const commentsRaw = await prisma.comment.findMany({
    where: { shotId },
    include: { user: true },
    orderBy: { createdAt: 'asc' },
  });

  const comments = commentsRaw.map((com) => ({
    ...com,
    createdAt: com.createdAt.toISOString(),
    user: {
      ...com.user,
      role: com.user.role as 'ARTIST' | 'LEAD' | 'QA' | 'POST' | 'PM' | 'ADMIN',
      createdAt: com.user.createdAt.toISOString(),
    },
    pinX: com.pinX ?? null,
    pinY: com.pinY ?? null,
    parentId: com.parentId ?? null,
    versionId: com.versionId ?? null,
  }));

  const shotData = {
    ...shot,
    createdAt: shot.createdAt.toISOString(),
    updatedAt: shot.updatedAt.toISOString(),
    dueDate: shot.dueDate?.toISOString() ?? null,
    status: shot.status as 'TODO' | 'WIP' | 'REVIEW' | 'DONE',
    project: shot.project
      ? {
          ...shot.project,
          status: shot.project.status as 'ACTIVE' | 'PAUSED' | 'DONE' | 'ARCHIVED',
          createdAt: shot.project.createdAt.toISOString(),
          updatedAt: shot.project.updatedAt.toISOString(),
          dueDate: shot.project.dueDate?.toISOString() ?? null,
        }
      : undefined,
    owner: shot.owner
      ? {
          ...shot.owner,
          role: shot.owner.role as 'ARTIST' | 'LEAD' | 'QA' | 'POST' | 'PM' | 'ADMIN',
          createdAt: shot.owner.createdAt.toISOString(),
        }
      : null,
    assignee: shot.owner
      ? {
          ...shot.owner,
          role: shot.owner.role as 'ARTIST' | 'LEAD' | 'QA' | 'POST' | 'PM' | 'ADMIN',
          createdAt: shot.owner.createdAt.toISOString(),
        }
      : null,
  };

  // Аватарка не лежит в JWT (там только id/name/role) — догружаем из БД.
  // На session.user.id один лёгкий SELECT с avatarUrl.
  const sessionUserAvatar = session?.user?.id
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { avatarUrl: true },
      })
    : null;

  const currentUser = session?.user
    ? {
        id: session.user.id,
        name: session.user.name ?? 'Пользователь',
        avatarUrl: sessionUserAvatar?.avatarUrl ?? null,
      }
    : { id: '', name: 'Гость', avatarUrl: null };
  const userRole = session?.user?.role ?? 'ARTIST';

  return (
    <ChecklistClient
      shot={shotData as Parameters<typeof ChecklistClient>[0]['shot']}
      projectId={projectId}
      initialChapters={chapters}
      versions={versions}
      comments={comments}
      currentUser={currentUser}
      userRole={userRole}
      users={usersRaw}
    />
  );
}
