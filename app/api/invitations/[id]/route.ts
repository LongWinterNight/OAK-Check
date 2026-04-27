import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-guard';
import { logActivity } from '@/lib/activity';
import { apiError } from '@/lib/api-error';
import { logger } from '@/lib/logger';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireRole(['ADMIN']);
  if (error) return error;

  const { id } = await params;
  try {
    const invitation = await prisma.invitation.findUnique({ where: { id } });
    if (!invitation) return apiError('NOT_FOUND', 'Приглашение не найдено');
    if (invitation.usedAt) return apiError('UNPROCESSABLE', 'Нельзя отозвать использованное приглашение');

    await prisma.invitation.delete({ where: { id } });

    await logActivity({
      userId: user.id,
      type: 'INVITE_REVOKED',
      message: `${user.name} отозвал приглашение для ${invitation.email}`,
    });

    return new NextResponse(null, { status: 204 });
  } catch (e) {
    if ((e as { code?: string }).code === 'P2025') {
      return new NextResponse(null, { status: 204 });
    }
    logger.error('DELETE /api/invitations/[id]:', e);
    return apiError('SERVER_ERROR');
  }
}
