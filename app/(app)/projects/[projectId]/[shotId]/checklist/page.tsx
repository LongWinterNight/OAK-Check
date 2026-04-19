import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { computeChapterStats } from '@/lib/utils';
import type { ChapterWithItems } from '@/types';
import ChecklistClient from './ChecklistClient';

interface Props {
  params: Promise<{ projectId: string; shotId: string }>;
}

export default async function ChecklistPage({ params }: Props) {
  const { projectId, shotId } = await params;

  const shot = await prisma.shot.findFirst({
    where: { id: shotId, projectId },
    include: {
      project: true,
      assignee: true,
    },
  });

  if (!shot) notFound();

  // Получаем чеклист
  const items = await prisma.checkItem.findMany({
    where: { shotId },
    include: { chapter: true, owner: true },
    orderBy: [{ chapter: { order: 'asc' } }, { order: 'asc' }],
  });

  // Группируем по главам
  const chapterMap = new Map<string, typeof items[0]['chapter']>();
  for (const item of items) {
    if (!chapterMap.has(item.chapterId)) {
      chapterMap.set(item.chapterId, item.chapter);
    }
  }

  const chapters: ChapterWithItems[] = Array.from(chapterMap.values()).map((chapter) => {
    const chapterItems = items
      .filter((i) => i.chapterId === chapter.id)
      .map(({ chapter: _c, ...item }) => ({
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
      title: chapter.title,
      description: chapter.description,
      order: chapter.order,
      templateId: chapter.templateId,
      items: chapterItems,
      ...stats,
    };
  });

  // Версии рендеров
  const versionsRaw = await prisma.renderVersion.findMany({
    where: { shotId },
    orderBy: { createdAt: 'asc' },
  });

  const versions = versionsRaw.map((v) => ({
    ...v,
    createdAt: v.createdAt.toISOString(),
    thumbnailUrl: v.thumbnailUrl ?? null,
    fileSize: v.fileSize ?? null,
  }));

  // Комментарии
  const commentsRaw = await prisma.comment.findMany({
    where: { shotId },
    include: { user: true },
    orderBy: { createdAt: 'asc' },
  });

  const comments = commentsRaw.map((c) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
    user: {
      ...c.user,
      role: c.user.role as 'ARTIST' | 'LEAD' | 'QA' | 'POST' | 'PM' | 'ADMIN',
      createdAt: c.user.createdAt.toISOString(),
    },
    pinX: c.pinX ?? null,
    pinY: c.pinY ?? null,
    parentId: c.parentId ?? null,
  }));

  const shotData = {
    ...shot,
    createdAt: shot.createdAt.toISOString(),
    updatedAt: shot.updatedAt.toISOString(),
    dueDate: shot.dueDate?.toISOString() ?? null,
    status: shot.status as 'TODO' | 'WIP' | 'REVIEW' | 'APPROVED' | 'BLOCKED' | 'DONE',
    project: shot.project
      ? {
          ...shot.project,
          status: shot.project.status as 'ACTIVE' | 'COMPLETED' | 'ARCHIVED',
          createdAt: shot.project.createdAt.toISOString(),
          updatedAt: shot.project.updatedAt.toISOString(),
        }
      : undefined,
    assignee: shot.assignee
      ? {
          ...shot.assignee,
          role: shot.assignee.role as 'ARTIST' | 'LEAD' | 'QA' | 'POST' | 'PM' | 'ADMIN',
          createdAt: shot.assignee.createdAt.toISOString(),
        }
      : null,
  };

  return (
    <ChecklistClient
      shot={shotData}
      initialChapters={chapters}
      versions={versions}
      comments={comments}
    />
  );
}
