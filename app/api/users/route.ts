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

    const [data, total] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        orderBy: { name: 'asc' },
        select: { id: true, name: true, email: true, role: true, online: true, avatarUrl: true, createdAt: true },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({ data, total, page, limit, hasMore: skip + data.length < total });
  } catch (e) {
    logger.error('GET /api/users:', e);
    return apiError('SERVER_ERROR');
  }
}
