import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-guard';
import { apiError } from '@/lib/api-error';
import { logger } from '@/lib/logger';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireRole(['LEAD', 'ADMIN']);
  if (error) return error;

  const { id } = await params;
  try {
    const chapter = await prisma.chapter.findUnique({ where: { id } });
    if (!chapter) return apiError('NOT_FOUND', 'Этап не найден');

    await prisma.chapter.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    logger.error('DELETE /api/chapters/[id]:', e);
    return apiError('SERVER_ERROR');
  }
}
