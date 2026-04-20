import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { computeChapterStats } from '@/lib/utils';
import { ApplyTemplateSchema, CreateCheckItemSchema as CreateItemSchema } from '@/lib/zod-schemas';
import { requireAuth, requireRole } from '@/lib/auth-guard';
import { logActivity } from '@/lib/activity';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id: shotId } = await params;
  try {
    const items = await prisma.checkItem.findMany({
      where: { shotId },
      include: { chapter: true, owner: true },
      orderBy: [{ chapter: { order: 'asc' } }, { order: 'asc' }],
    });

    const chapterMap = new Map<string, typeof items[0]['chapter']>();
    for (const item of items) {
      if (!chapterMap.has(item.chapterId)) chapterMap.set(item.chapterId, item.chapter);
    }

    const chapters = Array.from(chapterMap.values()).map((chapter) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const chapterItems = items
        .filter((item) => item.chapterId === chapter.id)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .map(({ chapter: _chap, ...item }) => item);

      return { ...chapter, items: chapterItems, ...computeChapterStats(chapterItems) };
    });

    return NextResponse.json(chapters);
  } catch (e) {
    console.error('GET /api/shots/[id]/checklist:', e);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireRole(['LEAD', 'ADMIN']);
  if (error) return error;

  const { id: shotId } = await params;
  try {
    const body = await req.json();

    // Создание одиночного пункта
    if (body.chapterId && body.title && !body.templateId) {
      const parsed = CreateItemSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
      }

      const { chapterId, title, ownerId } = parsed.data;

      const lastItem = await prisma.checkItem.findFirst({
        where: { chapterId },
        orderBy: { order: 'desc' },
      });

      const item = await prisma.checkItem.create({
        data: { shotId, chapterId, title, state: 'TODO', order: (lastItem?.order ?? 0) + 1, ownerId },
        include: { owner: true },
      });

      await logActivity({
        userId: user.id,
        type: 'ITEM_CREATED',
        shotId,
        message: `${user.name} добавил пункт «${title}»`,
      });

      return NextResponse.json(item, { status: 201 });
    }

    // Применение шаблона
    const parsed = ApplyTemplateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Невалидные данные' }, { status: 400 });
    }

    const { templateId, chapterName } = parsed.data;
    const template = await prisma.checklistTemplate.findUnique({
      where: { id: templateId },
      include: { items: { orderBy: { order: 'asc' } } },
    });
    if (!template) return NextResponse.json({ error: 'Шаблон не найден' }, { status: 404 });

    const existingChapters = await prisma.chapter.findMany({
      where: { shotId },
      orderBy: { order: 'desc' },
      take: 1,
    });
    const nextOrder = existingChapters.length > 0 ? existingChapters[0].order + 1 : 1;

    const chapter = await prisma.chapter.create({
      data: {
        title: chapterName || template.name,
        order: nextOrder,
        shotId,
        items: {
          create: template.items.map((item) => ({
            title: item.title,
            order: item.order,
            state: 'TODO' as const,
            shotId,
          })),
        },
      },
      include: { items: true },
    });

    await prisma.checklistTemplate.update({
      where: { id: templateId },
      data: { usedCount: { increment: 1 } },
    });

    return NextResponse.json(chapter, { status: 201 });
  } catch (e) {
    console.error('POST /api/shots/[id]/checklist:', e);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
