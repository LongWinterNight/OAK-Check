import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { computeChapterStats } from '@/lib/utils';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: shotId } = await params;

  try {
    // Получаем все пункты шота с главами
    const items = await prisma.checkItem.findMany({
      where: { shotId },
      include: {
        chapter: true,
        owner: true,
      },
      orderBy: [{ chapter: { order: 'asc' } }, { order: 'asc' }],
    });

    // Получаем уникальные главы в порядке
    const chapterMap = new Map<string, typeof items[0]['chapter']>();
    for (const item of items) {
      if (!chapterMap.has(item.chapterId)) {
        chapterMap.set(item.chapterId, item.chapter);
      }
    }

    const chapters = Array.from(chapterMap.values()).map((chapter) => {
      const chapterItems = items
        .filter((i) => i.chapterId === chapter.id)
        .map(({ chapter: _c, ...item }) => item);

      const stats = computeChapterStats(chapterItems);

      return {
        ...chapter,
        items: chapterItems,
        ...stats,
      };
    });

    return NextResponse.json(chapters);
  } catch (e) {
    console.error('GET /api/shots/[id]/checklist:', e);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
