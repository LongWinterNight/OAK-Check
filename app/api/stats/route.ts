import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [totalShots, inProgress, blockedItems] = await Promise.all([
      prisma.shot.count(),
      prisma.shot.count({ where: { status: 'WIP' } }),
      prisma.checkItem.count({ where: { state: 'BLOCKED' } }),
    ]);

    // Готово сегодня: шоты с updatedAt сегодня и статусом DONE
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const doneToday = await prisma.shot.count({
      where: {
        status: 'DONE',
        updatedAt: { gte: startOfDay },
      },
    });

    return NextResponse.json({
      totalShots,
      inProgress,
      doneToday,
      blockers: blockedItems,
    });
  } catch (e) {
    console.error('GET /api/stats:', e);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
