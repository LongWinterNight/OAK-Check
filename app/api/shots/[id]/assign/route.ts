import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-guard';
import { logActivity } from '@/lib/activity';
import { z } from 'zod';

const AssignSchema = z.object({
  assigneeId: z.string().nullable(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireRole(['LEAD', 'ADMIN']);
  if (error) return error;

  const { id } = await params;

  try {
    const body = await req.json();
    const parsed = AssignSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { assigneeId } = parsed.data;

    const shot = await prisma.shot.findUnique({
      where: { id },
      include: { owner: { select: { name: true } } },
    });
    if (!shot) return NextResponse.json({ error: 'Шот не найден' }, { status: 404 });

    if (assigneeId) {
      const assignee = await prisma.user.findUnique({ where: { id: assigneeId } });
      if (!assignee) return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
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
    console.error('PATCH /api/shots/[id]/assign:', e);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
