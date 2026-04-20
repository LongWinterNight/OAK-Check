import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UpdateShotSchema } from '@/lib/zod-schemas';
import { requireAuth, requireRole } from '@/lib/auth-guard';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  try {
    const shot = await prisma.shot.findUnique({
      where: { id },
      include: { project: true, owner: true },
    });
    if (!shot) return NextResponse.json({ error: 'Шот не найден' }, { status: 404 });

    const items = await prisma.checkItem.findMany({
      where: { shotId: id },
      select: { state: true },
    });
    const progress = items.length === 0
      ? 0
      : Math.round(items.filter((i) => i.state === 'DONE').length / items.length * 100);

    return NextResponse.json({ ...shot, progress });
  } catch (e) {
    console.error('GET /api/shots/[id]:', e);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireRole(['LEAD', 'ADMIN']);
  if (error) return error;

  const { id } = await params;
  try {
    const body = await req.json();
    const parsed = UpdateShotSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Невалидные данные' }, { status: 400 });
    }

    const { assigneeId, dueDate, ...rest } = parsed.data;
    const shot = await prisma.shot.update({
      where: { id },
      data: {
        ...rest,
        ...(assigneeId !== undefined ? { assigneeId } : {}),
        ...(dueDate !== undefined ? { dueDate: dueDate ? new Date(dueDate) : null } : {}),
      },
      include: { project: true, owner: true },
    });

    return NextResponse.json(shot);
  } catch (e) {
    console.error('PATCH /api/shots/[id]:', e);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireRole(['ADMIN']);
  if (error) return error;

  const { id } = await params;
  try {
    await prisma.shot.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    console.error('DELETE /api/shots/[id]:', e);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
