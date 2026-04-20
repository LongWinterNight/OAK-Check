import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const UpdateUserSchema = z.object({
  role: z.enum(['ARTIST', 'LEAD', 'QA', 'POST', 'PM', 'ADMIN']).optional(),
  online: z.boolean().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });

    const { id } = await params;
    const sessionUser = session.user as { id?: string; role?: string };
    if (sessionUser.role !== 'ADMIN' && sessionUser.id !== id) {
      return NextResponse.json({ error: 'Нет доступа' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = UpdateUserSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Невалидные данные' }, { status: 400 });

    const updated = await prisma.user.update({
      where: { id },
      data: parsed.data,
      select: { id: true, name: true, email: true, role: true, online: true, avatarUrl: true },
    });

    return NextResponse.json(updated);
  } catch (e) {
    console.error('[PATCH /api/users/:id]', e);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const sessionUser = session?.user as { role?: string } | undefined;
    if (sessionUser?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Нет доступа' }, { status: 403 });
    }

    const { id } = await params;

    // Nullify optional FK relations before deleting to avoid constraint errors
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
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
