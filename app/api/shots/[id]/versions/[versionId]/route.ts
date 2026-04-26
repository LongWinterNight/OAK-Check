import { NextRequest, NextResponse } from 'next/server';
import { join, basename } from 'path';
import { unlink } from 'fs/promises';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-guard';
import { apiError } from '@/lib/api-error';
import { logger } from '@/lib/logger';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; versionId: string }> }
) {
  // PM управляет проектом (вкл. правом удалять шот) — логично разрешить
  // удалить и версию рендера. Сужать до LEAD/ADMIN не нужно.
  const { error } = await requireRole(['LEAD', 'PM', 'ADMIN']);
  if (error) return error;

  const { versionId } = await params;
  try {
    const version = await prisma.renderVersion.findUnique({ where: { id: versionId } });
    if (!version) return apiError('NOT_FOUND', 'Версия не найдена');

    // Попытаться удалить файл с диска (игнорировать если уже нет)
    const uploadDir = process.env.UPLOAD_DIR ?? join(process.cwd(), 'public', 'uploads');
    const filename = basename(version.url.split('/').pop() ?? '');
    if (filename) {
      await unlink(join(uploadDir, filename)).catch(() => {});
    }

    await prisma.renderVersion.delete({ where: { id: versionId } });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    logger.error('DELETE /api/shots/[id]/versions/[versionId]:', e);
    return apiError('SERVER_ERROR');
  }
}
