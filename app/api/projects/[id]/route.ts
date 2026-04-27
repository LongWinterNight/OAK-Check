import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UpdateProjectSchema } from '@/lib/zod-schemas';
import { requireAuth, requireRole } from '@/lib/auth-guard';
import { apiError } from '@/lib/api-error';
import { logger } from '@/lib/logger';

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
        createdBy: { select: { id: true, name: true } },
      },
    });
    if (!project) return apiError('NOT_FOUND', 'Проект не найден');
    return NextResponse.json(project);
  } catch (e) {
    logger.error('GET /api/projects/[id]:', e);
    return apiError('SERVER_ERROR');
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireRole(['PM', 'ADMIN']);
  if (error) return error;

  const { id } = await params;
  try {
    const body = await req.json();
    const parsed = UpdateProjectSchema.safeParse(body);
    if (!parsed.success) {
      return apiError('VALIDATION_ERROR', parsed.error.issues[0].message);
    }
    const { dueDate, ...rest } = parsed.data;
    const data: Record<string, unknown> = { ...rest, updatedById: user.id };
    if (dueDate !== undefined) data.dueDate = dueDate ? new Date(dueDate) : null;

    const project = await prisma.project.update({ where: { id }, data });
    return NextResponse.json(project);
  } catch (e) {
    logger.error('PATCH /api/projects/[id]:', e);
    return apiError('SERVER_ERROR');
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireRole(['PM', 'ADMIN']);
  if (error) return error;

  const { id } = await params;
  try {
    await prisma.project.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    if ((e as { code?: string }).code === 'P2025') {
      return new NextResponse(null, { status: 204 });
    }
    logger.error('DELETE /api/projects/[id]:', e);
    return apiError('SERVER_ERROR');
  }
}
