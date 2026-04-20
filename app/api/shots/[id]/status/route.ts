import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-guard';
import { apiError } from '@/lib/api-error';
import { logActivity } from '@/lib/activity';
import { broadcast } from '@/lib/sse/emitter';
import { ShotStatusSchema } from '@/lib/zod-schemas';

const STATUS_LABELS: Record<string, string> = {
  TODO: 'Бэклог', WIP: 'В работе', REVIEW: 'На ревью', DONE: 'Сдано',
};

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireRole(['LEAD', 'QA', 'PM', 'ADMIN']);
  if (error) return error;

  const { id } = await params;

  try {
    const body = await req.json();
    const parsed = ShotStatusSchema.safeParse(body);
    if (!parsed.success) {
      return apiError('VALIDATION_ERROR', parsed.error.issues[0].message);
    }

    const { status } = parsed.data;

    const shot = await prisma.shot.findUnique({ where: { id } });
    if (!shot) return apiError('NOT_FOUND', 'Шот не найден');

    const updated = await prisma.shot.update({ where: { id }, data: { status } });

    await logActivity({
      userId: user.id,
      type: 'SHOT_STATUS_CHANGED',
      shotId: id,
      message: `${user.name} перевёл ${shot.code} → ${STATUS_LABELS[status]}`,
    });

    broadcast(shot.projectId, { type: 'shot:status', shotId: id, status });

    return NextResponse.json(updated);
  } catch (e) {
    console.error('PATCH /api/shots/[id]/status:', e);
    return apiError('SERVER_ERROR');
  }
}
