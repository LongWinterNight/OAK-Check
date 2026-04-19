import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CreateRenderVersionSchema } from '@/lib/zod-schemas';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: shotId } = await params;

  try {
    const versions = await prisma.renderVersion.findMany({
      where: { shotId },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(versions);
  } catch (e) {
    console.error('GET /api/shots/[id]/versions:', e);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: shotId } = await params;

  try {
    const body = await req.json();
    const parsed = CreateRenderVersionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Невалидные данные' }, { status: 400 });
    }

    const version = await prisma.renderVersion.create({
      data: { shotId, ...parsed.data },
    });

    return NextResponse.json(version, { status: 201 });
  } catch (e) {
    console.error('POST /api/shots/[id]/versions:', e);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
