import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UpdateProjectSchema } from '@/lib/zod-schemas';
import { requireAuth, requireRole } from '@/lib/auth-guard';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        shots: {
          include: { items: { select: { state: true } }, owner: { select: { name: true } } },
          orderBy: { code: 'asc' },
        },
      },
    });
    if (!project) return NextResponse.json({ error: 'Проект не найден' }, { status: 404 });
    return NextResponse.json(project);
  } catch (e) {
    console.error('GET /api/projects/[id]:', e);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireRole(['PM', 'ADMIN']);
  if (error) return error;

  const { id } = await params;
  try {
    const body = await req.json();
    const parsed = UpdateProjectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Невалидные данные' }, { status: 400 });
    }
    const { dueDate, ...rest } = parsed.data;
    const data: Record<string, unknown> = { ...rest };
    if (dueDate !== undefined) data.dueDate = dueDate ? new Date(dueDate) : null;

    const project = await prisma.project.update({ where: { id }, data });
    return NextResponse.json(project);
  } catch (e) {
    console.error('PATCH /api/projects/[id]:', e);
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
    await prisma.project.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    console.error('DELETE /api/projects/[id]:', e);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
