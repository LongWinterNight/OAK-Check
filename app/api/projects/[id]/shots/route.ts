import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CreateShotSchema } from '@/lib/zod-schemas';
import { requireAuth, requireRole } from '@/lib/auth-guard';
import { apiError } from '@/lib/api-error';
import { logger } from '@/lib/logger';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id: projectId } = await params;
  try {
    const shots = await prisma.shot.findMany({
      where: { projectId },
      include: {
        owner: { select: { id: true, name: true, email: true, avatarUrl: true } },
        items: { select: { state: true } },
      },
      orderBy: { order: 'asc' },
    });

    const shotsWithProgress = shots.map((shot) => {
      const { items, ...rest } = shot;
      const progress = items.length === 0
        ? 0
        : Math.round(items.filter((i) => i.state === 'DONE').length / items.length * 100);
      return { ...rest, progress };
    });

    return NextResponse.json(shotsWithProgress);
  } catch (e) {
    logger.error('GET /api/projects/[id]/shots:', e);
    return apiError('SERVER_ERROR');
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireRole(['LEAD', 'PM', 'ADMIN']);
  if (error) return error;

  const { id: projectId } = await params;
  try {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return apiError('NOT_FOUND', 'Проект не найден');

    const body = await req.json();
    const parsed = CreateShotSchema.safeParse(body);
    if (!parsed.success) {
      return apiError('VALIDATION_ERROR', parsed.error.issues[0].message);
    }

    const { dueDate, ...rest } = parsed.data;
    const count = await prisma.shot.count({ where: { projectId } });
    const data: Record<string, unknown> = { projectId, order: count, ...rest };
    if (dueDate) data.dueDate = new Date(dueDate);

    const shot = await prisma.shot.create({
      data,
      include: { owner: true },
    });

    return NextResponse.json(shot, { status: 201 });
  } catch (e) {
    logger.error('POST /api/projects/[id]/shots:', e);
    return apiError('SERVER_ERROR');
  }
}
