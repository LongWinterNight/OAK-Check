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
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });

  const sessionUser = session.user as { id?: string; role?: string };
  if (sessionUser.role !== 'ADMIN' && sessionUser.id !== (await params).id) {
    return NextResponse.json({ error: 'Нет доступа' }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = UpdateUserSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Невалидные данные' }, { status: 400 });

  const updated = await prisma.user.update({
    where: { id },
    data: parsed.data,
    select: { id: true, name: true, email: true, role: true, online: true, avatarUrl: true },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const sessionUser = session?.user as { role?: string } | undefined;
  if (sessionUser?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Нет доступа' }, { status: 403 });
  }

  const { id } = await params;
  await prisma.user.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
