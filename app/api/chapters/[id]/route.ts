import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-guard';
import { apiError } from '@/lib/api-error';
import { logger } from '@/lib/logger';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireRole(['LEAD', 'ADMIN']);
  if (error) return error;

  const { id } = await params;
  try {
    const body = await req.json();
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    if (!title) return apiError('VALIDATION_ERROR', 'Название не может быть пустым');

    const chapter = await prisma.chapter.findUnique({ where: { id } });
    if (!chapter) return apiError('NOT_FOUND', 'Этап не найден');

    const updated = await prisma.chapter.update({ where: { id }, data: { title } });
    return NextResponse.json(updated);
  } catch (e) {
    logger.error('PATCH /api/chapters/[id]:', e);
    return apiError('SERVER_ERROR');
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireRole(['LEAD', 'ADMIN']);
  if (error) return error;

  const { id } = await params;
  try {
    await prisma.chapter.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    // Idempotent: если запись уже удалена (повторный клик / параллельный
    // DELETE) — возвращаем 204, а не 500. P2025 — Prisma «record not found».
    if ((e as { code?: string }).code === 'P2025') {
      return new NextResponse(null, { status: 204 });
    }
    logger.error('DELETE /api/chapters/[id]:', e);
    return apiError('SERVER_ERROR');
  }
}
