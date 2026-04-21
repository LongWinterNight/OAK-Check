import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-guard';
import { apiError } from '@/lib/api-error';
import { logger } from '@/lib/logger';

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
    logger.error('DELETE /api/shots/[id]/comments/[commentId]:', e);
    return apiError('SERVER_ERROR');
  }
}
