import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-guard';

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
      prisma.user.groupBy({ by: ['role'], _count: { _all: true } }),
      prisma.project.count(),
      prisma.project.count({ where: { status: 'ACTIVE' } }),
      prisma.shot.count(),
      prisma.shot.groupBy({ by: ['status'], _count: { _all: true } }),
      prisma.user.count({ where: { lastLoginAt: { gte: sevenDaysAgo } } }),
      prisma.invitation.count({ where: { usedAt: null, expiresAt: { gte: new Date() } } }),
      prisma.renderVersion.aggregate({ _sum: { fileSize: true } }),
    ]);

    return NextResponse.json({
      totalUsers,
      usersByRole: Object.fromEntries(usersByRole.map((r) => [r.role, r._count._all])),
      totalProjects,
      activeProjects,
      totalShots,
      shotsByStatus: Object.fromEntries(shotsByStatus.map((s) => [s.status, s._count._all])),
      recentLogins,
      pendingInvitations,
      storageUsedBytes: storageResult._sum.fileSize ?? 0,
    });
  } catch (e) {
    console.error('GET /api/admin/stats:', e);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
