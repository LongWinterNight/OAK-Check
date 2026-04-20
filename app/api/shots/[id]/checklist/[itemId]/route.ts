import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UpdateCheckItemSchema } from '@/lib/zod-schemas';
import { broadcast } from '@/lib/sse/emitter';
import { requireAuth, requireRole } from '@/lib/auth-guard';
import { apiError } from '@/lib/api-error';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id: shotId, itemId } = await params;
  try {
    const body = await req.json();
    const parsed = UpdateCheckItemSchema.safeParse(body);
    if (!parsed.success) {
      return apiError('VALIDATION_ERROR', parsed.error.errors[0].message);
    }

    const item = await prisma.checkItem.findFirst({ where: { id: itemId, shotId } });
    if (!item) return apiError('NOT_FOUND', 'Пункт не найден');

    const updated = await prisma.checkItem.update({
      where: { id: itemId },
      data: parsed.data,
      include: { owner: true, shot: { select: { projectId: true } } },
    });

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
    return apiError('SERVER_ERROR');
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const { error } = await requireRole(['LEAD', 'ADMIN']);
  if (error) return error;

  const { id: shotId, itemId } = await params;
  try {
    const item = await prisma.checkItem.findFirst({ where: { id: itemId, shotId } });
    if (!item) return apiError('NOT_FOUND', 'Пункт не найден');

    await prisma.checkItem.delete({ where: { id: itemId } });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    console.error('DELETE /api/shots/[id]/checklist/[itemId]:', e);
    return apiError('SERVER_ERROR');
  }
}
