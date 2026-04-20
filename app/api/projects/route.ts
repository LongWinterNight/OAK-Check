import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CreateProjectSchema } from '@/lib/zod-schemas';
import { requireAuth, requireRole } from '@/lib/auth-guard';
import { apiError } from '@/lib/api-error';

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
          { title:  { contains: search, mode: 'insensitive' as const } },
          { client: { contains: search, mode: 'insensitive' as const } },
        ] }
      : {};

    const [data, total] = await prisma.$transaction([
      prisma.project.findMany({
        where,
        include: {
          _count:    { select: { shots: true } },
          createdBy: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.project.count({ where }),
    ]);

    return NextResponse.json({ data, total, page, limit, hasMore: skip + data.length < total });
  } catch (e) {
    console.error('GET /api/projects:', e);
    return apiError('SERVER_ERROR');
  }
}

export async function POST(req: NextRequest) {
  const { user, error } = await requireRole(['LEAD', 'PM', 'ADMIN']);
  if (error) return error;

  try {
    const body = await req.json();
    const parsed = CreateProjectSchema.safeParse(body);
    if (!parsed.success) {
      return apiError('VALIDATION_ERROR', parsed.error.issues[0].message);
    }
    const project = await prisma.project.create({
      data: { ...parsed.data, createdById: user.id },
    });
    return NextResponse.json(project, { status: 201 });
  } catch (e) {
    console.error('POST /api/projects:', e);
    return apiError('SERVER_ERROR');
  }
}
