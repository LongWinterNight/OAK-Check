import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get('page') ?? '1');
  const limit = parseInt(url.searchParams.get('limit') ?? '20');
  const shotId = url.searchParams.get('shotId') ?? undefined;

  try {
    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where: shotId ? { shotId } : undefined,
        include: { user: true, shot: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.activity.count({
        where: shotId ? { shotId } : undefined,
      }),
    ]);

    return NextResponse.json({
      data: activities,
      page,
      total,
      hasMore: page * limit < total,
    });
  } catch (e) {
    console.error('GET /api/activity:', e);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
