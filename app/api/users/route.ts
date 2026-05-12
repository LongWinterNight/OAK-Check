import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-guard';
import { apiError } from '@/lib/api-error';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  const url = new URL(req.url);
  const page   = Math.max(1, parseInt(url.searchParams.get('page')   ?? '1'));
  const limit  = Math.min(100, parseInt(url.searchParams.get('limit')  ?? '50'));
  const skip   = (page - 1) * limit;
  const search = url.searchParams.get('search')?.trim() ?? '';

  try {
    const where = search
      ? { OR: [
          { name:  { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
        ] }
      : {};

    const [rawData, total] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        orderBy: { name: 'asc' },
        select: { id: true, name: true, email: true, role: true, online: true, avatarUrl: true, createdAt: true, lastSeenAt: true },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    // Считаем «онлайн» как «heartbeat за последние 2 минуты».
    // Поле online в БД может быть устаревшим (вкладка закрылась без logout) —
    // lastSeenAt надёжнее.
    const TWO_MIN_AGO = Date.now() - 2 * 60_000;
    const data = rawData.map((u) => ({
      ...u,
      online: u.lastSeenAt ? u.lastSeenAt.getTime() >= TWO_MIN_AGO : false,
    }));

    return NextResponse.json({ data, total, page, limit, hasMore: skip + data.length < total });
  } catch (e) {
    logger.error('GET /api/users:', e);
    return apiError('SERVER_ERROR');
  }
}
