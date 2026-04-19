import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UpdateCheckItemSchema } from '@/lib/zod-schemas';
import { broadcast } from '@/lib/sse/emitter';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const { id: shotId, itemId } = await params;

  try {
    const body = await req.json();
    const parsed = UpdateCheckItemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Невалидные данные', details: parsed.error.flatten() }, { status: 400 });
    }

    const item = await prisma.checkItem.findFirst({
      where: { id: itemId, shotId },
    });

    if (!item) {
      return NextResponse.json({ error: 'Пункт не найден' }, { status: 404 });
    }

    const updated = await prisma.checkItem.update({
      where: { id: itemId },
      data: parsed.data,
      include: { owner: true, shot: { select: { projectId: true } } },
    });

    // Рассылаем real-time событие всем в проекте
    broadcast(updated.shot.projectId, {
      type: 'checklist:updated',
      shotId,
      itemId,
      state: updated.state,
      userId: updated.ownerId ?? '',
    });

    return NextResponse.json(updated);
  } catch (e) {
    console.error('PATCH /api/shots/[id]/checklist/[itemId]:', e);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const { id: shotId, itemId } = await params;

  try {
    const item = await prisma.checkItem.findFirst({ where: { id: itemId, shotId } });

    if (!item) {
      return NextResponse.json({ error: 'Пункт не найден' }, { status: 404 });
    }

    await prisma.checkItem.delete({ where: { id: itemId } });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    console.error('DELETE /api/shots/[id]/checklist/[itemId]:', e);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
