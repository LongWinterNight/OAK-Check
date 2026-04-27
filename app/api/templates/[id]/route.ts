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
    await prisma.checklistTemplate.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    if ((e as { code?: string }).code === 'P2025') {
      return new NextResponse(null, { status: 204 });
    }
    logger.error('DELETE /api/templates/[id]:', e);
    return apiError('SERVER_ERROR');
  }
}
