import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-guard';

export async function GET(req: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1'));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') ?? '20')));
  const shotId = url.searchParams.get('shotId') ?? undefined;

  try {
    const where = shotId ? { shotId } : undefined;
    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        include: { user: { select: { id: true, name: true, avatarUrl: true } }, shot: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.activity.count({ where }),
    ]);

    return NextResponse.json({ data: activities, page, total, hasMore: page * limit < total });
  } catch (e) {
    console.error('GET /api/activity:', e);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
