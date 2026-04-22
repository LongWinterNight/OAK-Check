import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CreateCommentSchema } from '@/lib/zod-schemas';
import { requireAuth } from '@/lib/auth-guard';
import { logger } from '@/lib/logger';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id: shotId } = await params;
  try {
    const comments = await prisma.comment.findMany({
      where: { shotId },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
      orderBy: { createdAt: 'asc' },
      take: 200,
    });
    return NextResponse.json(comments);
  } catch (e) {
    logger.error('GET /api/shots/[id]/comments:', e);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Используем текущего авторизованного пользователя
  const { user, error } = await requireAuth();
  if (error) return error;

  if (!rateLimit(`comments:${user.id}`, 60, 60_000)) {
    return NextResponse.json({ error: 'Слишком много запросов. Подождите минуту.' }, { status: 429 });
  }

  const { id: shotId } = await params;
  try {
    const body = await req.json();
    const parsed = CreateCommentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Невалидные данные' }, { status: 400 });
    }

    const comment = await prisma.comment.create({
      data: { shotId, userId: user.id, ...parsed.data },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (e) {
    logger.error('POST /api/shots/[id]/comments:', e);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
