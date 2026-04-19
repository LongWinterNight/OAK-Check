import { prisma } from '@/lib/prisma';
import { computeProgress } from '@/lib/utils';
import TopBar from '@/components/layout/TopBar/TopBar';
import KanbanBoard, { type KanbanShot } from '@/components/kanban/KanbanBoard';
import styles from './page.module.css';

export default async function KanbanPage() {
  const shots = await prisma.shot.findMany({
    include: {
      project: { select: { title: true } },
      owner: { select: { name: true } },
      items: { select: { state: true } },
    },
    orderBy: [{ status: 'asc' }, { order: 'asc' }],
  });

  const kanbanShots: KanbanShot[] = shots.map((s) => ({
    id: s.id,
    code: s.code,
    title: s.title,
    projectTitle: s.project.title,
    ownerName: s.owner?.name ?? null,
    dueDate: s.dueDate?.toISOString() ?? null,
    progress: computeProgress(s.items as { state: 'TODO' | 'WIP' | 'DONE' | 'BLOCKED' }[]),
    status: s.status as KanbanShot['status'],
  }));

  return (
    <>
      <TopBar breadcrumbs={[{ label: 'Канбан' }]} />
      <div className={styles.content}>
        <KanbanBoard initialShots={kanbanShots} />
      </div>
    </>
  );
}
