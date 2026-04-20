import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-guard';
import { apiError } from '@/lib/api-error';
import { logger } from '@/lib/logger';

export async function GET() {
  const { error } = await requireRole(['ADMIN']);
  if (error) return error;

  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      usersByRole,
      totalProjects,
      activeProjects,
      totalShots,
      shotsByStatus,
      recentLogins,
      pendingInvitations,
      storageResult,
    ] = await prisma.$transaction([
      prisma.user.count(),
      prisma.user.groupBy({ by: ['role'], _count: true, orderBy: { role: 'asc' } }),
      prisma.project.count(),
      prisma.project.count({ where: { status: 'ACTIVE' } }),
      prisma.shot.count(),
      prisma.shot.groupBy({ by: ['status'], _count: true, orderBy: { status: 'asc' } }),
      prisma.user.count({ where: { lastLoginAt: { gte: sevenDaysAgo } } }),
      prisma.invitation.count({ where: { usedAt: null, expiresAt: { gte: new Date() } } }),
      prisma.renderVersion.aggregate({ _sum: { fileSize: true } }),
    ]);

    return NextResponse.json({
      totalUsers,
      usersByRole: Object.fromEntries(usersByRole.map((r) => [r.role, r._count])),
      totalProjects,
      activeProjects,
      totalShots,
      shotsByStatus: Object.fromEntries(shotsByStatus.map((s) => [s.status, s._count])),
      recentLogins,
      pendingInvitations,
      storageUsedBytes: storageResult._sum.fileSize ?? 0,
    });
  } catch (e) {
    logger.error('GET /api/admin/stats:', e);
    return apiError('SERVER_ERROR');
  }
}
