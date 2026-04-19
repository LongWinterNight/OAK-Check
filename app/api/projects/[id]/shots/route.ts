import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CreateShotSchema } from '@/lib/zod-schemas';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params;

  try {
    const shots = await prisma.shot.findMany({
      where: { projectId },
      include: { assignee: true },
      orderBy: { order: 'asc' },
    });

    // Добавляем прогресс к каждому шоту
    const shotsWithProgress = await Promise.all(
      shots.map(async (shot) => {
        const items = await prisma.checkItem.findMany({
          where: { shotId: shot.id },
          select: { state: true },
        });
        const progress = items.length === 0
          ? 0
          : Math.round(items.filter((i) => i.state === 'DONE').length / items.length * 100);
        return { ...shot, progress };
      })
    );

    return NextResponse.json(shotsWithProgress);
  } catch (e) {
    console.error('GET /api/projects/[id]/shots:', e);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params;

  try {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return NextResponse.json({ error: 'Проект не найден' }, { status: 404 });

    const body = await req.json();
    const parsed = CreateShotSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Невалидные данные' }, { status: 400 });
    }

    const count = await prisma.shot.count({ where: { projectId } });
    const shot = await prisma.shot.create({
      data: { projectId, order: count, ...parsed.data },
      include: { assignee: true },
    });

    return NextResponse.json(shot, { status: 201 });
  } catch (e) {
    console.error('POST /api/projects/[id]/shots:', e);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
