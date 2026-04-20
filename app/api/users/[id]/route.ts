import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logActivity } from '@/lib/activity';
import { requireRole, requireSelfOrAdmin } from '@/lib/auth-guard';
import { apiError } from '@/lib/api-error';
import { z } from 'zod';

const UpdateUserSchema = z.object({
  role:   z.enum(['ARTIST', 'LEAD', 'QA', 'POST', 'PM', 'ADMIN']).optional(),
  online: z.boolean().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { user, error } = await requireSelfOrAdmin(id);
  if (error) return error;

  try {
    const body = await req.json();
    const parsed = UpdateUserSchema.safeParse(body);
    if (!parsed.success) return apiError('VALIDATION_ERROR', parsed.error.errors[0].message);

    const updated = await prisma.user.update({
      where: { id },
      data: parsed.data,
      select: { id: true, name: true, email: true, role: true, online: true, avatarUrl: true },
    });

    if (parsed.data.role && user.role === 'ADMIN' && user.id !== id) {
      await logActivity({
        userId: user.id,
        type: 'USER_ROLE_CHANGED',
        message: `${user.name} изменил роль ${updated.name} → ${parsed.data.role}`,
      });
    }

    return NextResponse.json(updated);
  } catch (e) {
    console.error('[PATCH /api/users/:id]', e);
    return apiError('SERVER_ERROR');
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireRole(['ADMIN']);
  if (error) return error;

  const { id } = await params;
  try {
    const target = await prisma.user.findUnique({ where: { id }, select: { name: true } });
    if (!target) return apiError('NOT_FOUND', 'Пользователь не найден');

    await logActivity({
      userId: user.id,
      type: 'USER_DELETED',
      message: `${user.name} удалил пользователя ${target.name}`,
    });

    await prisma.$transaction([
      prisma.shot.updateMany({ where: { assigneeId: id }, data: { assigneeId: null } }),
      prisma.checkItem.updateMany({ where: { ownerId: id }, data: { ownerId: null } }),
      prisma.comment.deleteMany({ where: { userId: id } }),
      prisma.activity.deleteMany({ where: { userId: id } }),
      prisma.user.delete({ where: { id } }),
    ]);

    return new NextResponse(null, { status: 204 });
  } catch (e) {
    console.error('[DELETE /api/users/:id]', e);
    return apiError('SERVER_ERROR');
  }
}
