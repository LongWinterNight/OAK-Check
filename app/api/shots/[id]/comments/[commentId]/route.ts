import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UpdateCommentSchema } from '@/lib/zod-schemas';
import { requireAuth } from '@/lib/auth-guard';
import { apiError } from '@/lib/api-error';
import { logger } from '@/lib/logger';
import { broadcast } from '@/lib/sse/emitter';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { commentId } = await params;
  try {
    const body = await req.json();
    const parsed = UpdateCommentSchema.safeParse(body);
    if (!parsed.success) {
      return apiError('VALIDATION_ERROR', parsed.error.issues[0].message);
    }

    const existing = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { shot: { select: { projectId: true } } },
    });
    if (!existing) return apiError('NOT_FOUND', 'Комментарий не найден');

    // Только автор может редактировать (даже ADMIN не правит чужие — это история)
    if (existing.userId !== user.id) {
      return apiError('FORBIDDEN', 'Можно редактировать только свои комментарии');
    }

    const updated = await prisma.comment.update({
      where: { id: commentId },
      data: { body: parsed.data.body, editedAt: new Date() },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    });

    broadcast(existing.shot.projectId, { type: 'comment:updated', shotId: existing.shotId, comment: updated });

    return NextResponse.json(updated);
  } catch (e) {
    logger.error('PATCH /api/shots/[id]/comments/[commentId]:', e);
    return apiError('SERVER_ERROR');
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { commentId } = await params;
  try {
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) return apiError('NOT_FOUND', 'Комментарий не найден');

    if (comment.userId !== user.id && user.role !== 'ADMIN') {
      return apiError('FORBIDDEN');
    }

    await prisma.comment.delete({ where: { id: commentId } });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    if ((e as { code?: string }).code === 'P2025') {
      return new NextResponse(null, { status: 204 });
    }
    logger.error('DELETE /api/shots/[id]/comments/[commentId]:', e);
    return apiError('SERVER_ERROR');
  }
}
