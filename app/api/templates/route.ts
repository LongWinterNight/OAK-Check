import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CreateTemplateSchema } from '@/lib/zod-schemas';

export async function GET() {
  try {
    const templates = await prisma.checklistTemplate.findMany({
      include: { items: true },
      orderBy: { usedCount: 'desc' },
    });
    return NextResponse.json(templates);
  } catch (e) {
    console.error('GET /api/templates:', e);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CreateTemplateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Невалидные данные' }, { status: 400 });
    }

    const { items, ...templateData } = parsed.data;

    const template = await prisma.checklistTemplate.create({
      data: {
        ...templateData,
        items: { create: items },
      },
      include: { items: true },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (e) {
    console.error('POST /api/templates:', e);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
