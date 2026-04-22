import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-guard';
import { logger } from '@/lib/logger';

export async function GET() {
  const { user, error } = await requireAuth();
  if (error) return error;

  try {
    const shots = await prisma.shot.findMany({
      where: {
        assigneeId: user.id,
        status: { in: ['TODO', 'WIP', 'REVIEW'] },
      },
      select: {
        id: true,
        code: true,
        title: true,
        project: { select: { title: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 30,
    });

    return NextResponse.json(
      shots.map((s) => ({
        id: s.id,
        code: s.code,
        title: s.title,
        projectTitle: s.project.title,
      }))
    );
  } catch (e) {
    logger.error('GET /api/shots/mine:', e);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
