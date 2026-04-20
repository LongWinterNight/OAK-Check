import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-guard';
import { apiError } from '@/lib/api-error';
import { z } from 'zod';

const CreateChapterSchema = z.object({
  shotId: z.string().min(1),
  title: z.string().min(1, 'Название обязательно').max(100),
});

export async function POST(req: NextRequest) {
  const { error } = await requireRole(['LEAD', 'ADMIN']);
  if (error) return error;

  try {
    const body = await req.json();
    const parsed = CreateChapterSchema.safeParse(body);
    if (!parsed.success) {
      return apiError('VALIDATION_ERROR', parsed.error.errors[0].message);
    }

    const { shotId, title } = parsed.data;

    const last = await prisma.chapter.findFirst({
      where: { shotId },
      orderBy: { order: 'desc' },
    });

    const chapter = await prisma.chapter.create({
      data: { shotId, title, order: (last?.order ?? 0) + 1 },
    });

    return NextResponse.json(chapter, { status: 201 });
  } catch (e) {
    console.error('POST /api/chapters:', e);
    return apiError('SERVER_ERROR');
  }
}
