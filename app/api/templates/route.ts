import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CreateTemplateSchema } from '@/lib/zod-schemas';
import { requireAuth, requireRole } from '@/lib/auth-guard';
import { logger } from '@/lib/logger';

export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const templates = await prisma.checklistTemplate.findMany({
      include: { items: true },
      orderBy: { usedCount: 'desc' },
    });
    return NextResponse.json(templates);
  } catch (e) {
    logger.error('GET /api/templates:', e);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { error } = await requireRole(['LEAD', 'ADMIN']);
  if (error) return error;

  try {
    const body = await req.json();
    const parsed = CreateTemplateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Невалидные данные' }, { status: 400 });
    }
    const { items, ...templateData } = parsed.data;
    const template = await prisma.checklistTemplate.create({
      data: { ...templateData, items: { create: items } },
      include: { items: true },
    });
    return NextResponse.json(template, { status: 201 });
  } catch (e) {
    logger.error('POST /api/templates:', e);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
