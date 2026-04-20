import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-guard';
import { logActivity } from '@/lib/activity';
import { apiError } from '@/lib/api-error';
import { AssignShotSchema } from '@/lib/zod-schemas';
import { logger } from '@/lib/logger';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireRole(['LEAD', 'ADMIN']);
  if (error) return error;

  const { id } = await params;

  try {
    const body = await req.json();
    const parsed = AssignShotSchema.safeParse(body);
    if (!parsed.success) return apiError('VALIDATION_ERROR', parsed.error.issues[0].message);

    const { assigneeId } = parsed.data;

    const shot = await prisma.shot.findUnique({ where: { id } });
    if (!shot) return apiError('NOT_FOUND', 'Шот не найден');

    if (assigneeId) {
      const assignee = await prisma.user.findUnique({ where: { id: assigneeId } });
      if (!assignee) return apiError('NOT_FOUND', 'Пользователь не найден');
    }

    const updated = await prisma.shot.update({ where: { id }, data: { assigneeId } });

    const assigneeName = assigneeId
      ? (await prisma.user.findUnique({ where: { id: assigneeId }, select: { name: true } }))?.name ?? assigneeId
      : 'никому';

    await logActivity({
      userId: user.id,
      type: 'SHOT_STATUS_CHANGED',
      shotId: id,
      message: `${user.name} назначил ${shot.code} → ${assigneeName}`,
    });

    return NextResponse.json(updated);
  } catch (e) {
    logger.error('PATCH /api/shots/[id]/assign:', e);
    return apiError('SERVER_ERROR');
  }
}
