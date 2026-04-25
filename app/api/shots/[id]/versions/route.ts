import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CreateRenderVersionSchema } from '@/lib/zod-schemas';
import { requireAuth } from '@/lib/auth-guard';
import { apiError } from '@/lib/api-error';
import { logger } from '@/lib/logger';
import { rateLimit } from '@/lib/rate-limit';
import { logActivity } from '@/lib/activity';
import { broadcast } from '@/lib/sse/emitter';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id: shotId } = await params;
  try {
    const versions = await prisma.renderVersion.findMany({
      where: { shotId },
      orderBy: { createdAt: 'asc' },
      take: 50,
    });
    return NextResponse.json(versions);
  } catch (e) {
    logger.error('GET /api/shots/[id]/versions:', e);
    return apiError('SERVER_ERROR');
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAuth();
  if (error) return error;

  if (!rateLimit(`upload:${user.id}`, 20, 60 * 60_000)) {
    return apiError('RATE_LIMIT', 'Лимит загрузок на час исчерпан');
  }

  const { id: shotId } = await params;
  try {
    const body = await req.json();
    const parsed = CreateRenderVersionSchema.safeParse(body);
    if (!parsed.success) {
      return apiError('VALIDATION_ERROR', parsed.error.issues[0].message);
    }

    const shot = await prisma.shot.findUnique({ where: { id: shotId }, select: { id: true, code: true, projectId: true } });
    if (!shot) return apiError('NOT_FOUND', 'Шот не найден');

    const version = await prisma.renderVersion.create({
      data: { shotId, ...parsed.data },
    });

    await logActivity({
      userId: user.id,
      type: 'VERSION_UPLOADED',
      shotId,
      message: `${user.name} загрузил ${version.version} для ${shot.code}`,
    });

    broadcast(shot.projectId, { type: 'version:uploaded', shotId, versionId: version.id, version: version.version });

    return NextResponse.json(version, { status: 201 });
  } catch (e) {
    logger.error('POST /api/shots/[id]/versions:', e);
    return apiError('SERVER_ERROR');
  }
}
