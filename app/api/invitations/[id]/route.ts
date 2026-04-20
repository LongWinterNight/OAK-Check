import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-guard';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireRole(['ADMIN']);
  if (error) return error;

  const { id } = await params;
  try {
    const invitation = await prisma.invitation.findUnique({ where: { id } });
    if (!invitation) {
      return NextResponse.json({ error: 'Приглашение не найдено' }, { status: 404 });
    }
    if (invitation.usedAt) {
      return NextResponse.json({ error: 'Нельзя отозвать использованное приглашение' }, { status: 400 });
    }

    await prisma.invitation.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    console.error('DELETE /api/invitations/[id]:', e);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
