import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UpdateCheckItemSchema } from '@/lib/zod-schemas';
import { broadcast } from '@/lib/sse/emitter';
import { requireAuth, requireRole } from '@/lib/auth-guard';
import { apiError } from '@/lib/api-error';
import { logger } from '@/lib/logger';
import { logActivity } from '@/lib/activity';

const STATE_LABELS: Record<string, string> = {
  TODO: 'в бэклог', WIP: 'в работу', DONE: 'в готово', BLOCKED: 'на стоп',
};

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { id: shotId, itemId } = await params;
  try {
    const body = await req.json();
    const parsed = UpdateCheckItemSchema.safeParse(body);
    if (!parsed.success) {
      return apiError('VALIDATION_ERROR', parsed.error.issues[0].message);
    }

    const item = await prisma.checkItem.findFirst({ where: { id: itemId, shotId } });
    if (!item) return apiError('NOT_FOUND', 'Пункт не найден');

    // BLOCKED требует причину — либо в БД, либо пришла в этом же запросе.
    if (parsed.data.state === 'BLOCKED') {
      const noteIncoming = parsed.data.note;
      const noteFinal = noteIncoming !== undefined ? noteIncoming : item.note;
      if (!noteFinal || !noteFinal.trim()) {
        return apiError('VALIDATION_ERROR', 'Укажите причину стопа в заметке');
      }
    }

    const updated = await prisma.checkItem.update({
      where: { id: itemId },
      data: parsed.data,
      include: { owner: true, shot: { select: { projectId: true, code: true } } },
    });

    // Логируем смену состояния (важно для ленты активности)
    if (parsed.data.state && parsed.data.state !== item.state) {
      const stateLabel = STATE_LABELS[parsed.data.state] ?? parsed.data.state;
      const reason = parsed.data.state === 'BLOCKED' && updated.note
        ? ` — «${updated.note}»`
        : '';
      await logActivity({
        userId: user.id,
        type: 'ITEM_STATE_CHANGED',
        shotId,
        message: `${user.name} перевёл «${updated.title}» ${stateLabel}${reason}`,
      });
    }

    broadcast(updated.shot.projectId, {
      type: 'checklist:updated',
      shotId,
      itemId,
      state: updated.state,
      userId: updated.ownerId ?? '',
    });

    return NextResponse.json(updated);
  } catch (e) {
    logger.error('PATCH /api/shots/[id]/checklist/[itemId]:', e);
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
    logger.error('DELETE /api/shots/[id]/checklist/[itemId]:', e);
    return apiError('SERVER_ERROR');
  }
}
