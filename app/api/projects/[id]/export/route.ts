import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-guard';
import { apiError } from '@/lib/api-error';
import { logger } from '@/lib/logger';

function escapeCsv(val: string | null | undefined): string {
  const s = val ?? '';
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireRole(['PM', 'ADMIN']);
  if (error) return error;

  const { id } = await params;
  try {
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) return apiError('NOT_FOUND', 'Проект не найден');

    const shots = await prisma.shot.findMany({
      where: { projectId: id },
      include: {
        owner: { select: { name: true } },
        items: { select: { state: true } },
      },
      orderBy: { code: 'asc' },
    });

    const rows = shots.map((s) => {
      const total = s.items.length;
      const done = s.items.filter((i: { state: string }) => i.state === 'DONE').length;
      const progress = total > 0 ? Math.round((done / total) * 100) : 0;
      const due = s.dueDate
        ? new Date(s.dueDate).toLocaleDateString('ru-RU')
        : '';
      return [
        escapeCsv(s.code),
        escapeCsv(s.title),
        escapeCsv(s.status),
        escapeCsv(s.owner?.name),
        String(progress) + '%',
        String(total),
        escapeCsv(due),
        escapeCsv(s.resolution),
      ].join(',');
    });

    const header = 'Код,Название,Статус,Исполнитель,Прогресс,Пунктов,Дедлайн,Разрешение';
    const bom = '﻿'; // UTF-8 BOM for Excel
    const csv = bom + [header, ...rows].join('\r\n');

    const filename = `${project.title.replace(/[^a-zA-Zа-яА-Я0-9_-]/g, '_')}-export.csv`;

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
      },
    });
  } catch (e) {
    logger.error('GET /api/projects/[id]/export:', e);
    return apiError('SERVER_ERROR');
  }
}
