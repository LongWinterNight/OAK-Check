import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CreateCommentSchema } from '@/lib/zod-schemas';
import { requireAuth } from '@/lib/auth-guard';
import { apiError } from '@/lib/api-error';
import { logger } from '@/lib/logger';
import { rateLimit } from '@/lib/rate-limit';
import { logActivity } from '@/lib/activity';
import { broadcast } from '@/lib/sse/emitter';
import { can } from '@/lib/roles';

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
    return apiError('SERVER_ERROR');
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAuth();
  if (error) return error;

  if (!rateLimit(`comments:${user.id}`, 60, 60_000)) {
    return apiError('RATE_LIMIT', 'Слишком много запросов. Подождите минуту.');
  }

  const { id: shotId } = await params;
  try {
    const body = await req.json();
    const parsed = CreateCommentSchema.safeParse(body);
    if (!parsed.success) {
      return apiError('VALIDATION_ERROR', parsed.error.issues[0].message);
    }

    // Только специальные роли могут ставить пины (ARTIST — получатель правок)
    if (parsed.data.pinX !== undefined && !can.pinComment(user.role)) {
      return apiError('FORBIDDEN', 'Только ревьюер может ставить пины на рендер');
    }

    const shot = await prisma.shot.findUnique({
      where: { id: shotId },
      select: { id: true, code: true, projectId: true },
    });
    if (!shot) return apiError('NOT_FOUND', 'Шот не найден');

    const comment = await prisma.comment.create({
      data: { shotId, userId: user.id, ...parsed.data },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    });

    await logActivity({
      userId: user.id,
      type: 'COMMENT_ADDED',
      shotId,
      message: comment.pinX !== null
        ? `${user.name} оставил пин-комментарий на ${shot.code}`
        : `${user.name} прокомментировал ${shot.code}`,
    });

    broadcast(shot.projectId, { type: 'comment:added', shotId, comment });

    return NextResponse.json(comment, { status: 201 });
  } catch (e) {
    logger.error('POST /api/shots/[id]/comments:', e);
    return apiError('SERVER_ERROR');
  }
}
