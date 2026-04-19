import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CreateCommentSchema } from '@/lib/zod-schemas';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: shotId } = await params;

  try {
    const comments = await prisma.comment.findMany({
      where: { shotId },
      include: { user: true },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(comments);
  } catch (e) {
    console.error('GET /api/shots/[id]/comments:', e);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: shotId } = await params;

  try {
    const body = await req.json();
    const parsed = CreateCommentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Невалидные данные' }, { status: 400 });
    }

    // Используем первого пользователя как текущего (до auth)
    const user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 401 });
    }

    const comment = await prisma.comment.create({
      data: {
        shotId,
        userId: user.id,
        ...parsed.data,
      },
      include: { user: true },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (e) {
    console.error('POST /api/shots/[id]/comments:', e);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
