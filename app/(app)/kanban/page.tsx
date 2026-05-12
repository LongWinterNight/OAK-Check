import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { computeProgress } from '@/lib/utils';
import { can } from '@/lib/roles';
import type { Role } from '@/lib/roles';
import TopBar from '@/components/layout/TopBar/TopBar';
import KanbanBoard, { type KanbanShot } from '@/components/kanban/KanbanBoard';
import styles from './page.module.css';

export default async function KanbanPage() {
  const session = await auth();
  const userRole = (session?.user?.role ?? 'ARTIST') as Role;
  const canChangeStatus = can.changeStatus(userRole);
  const canCreateShot = can.createShot(userRole);

  const shots = await prisma.shot.findMany({
    include: {
      project: { select: { id: true, title: true } },
      owner: { select: { name: true, avatarUrl: true } },
      items: { select: { state: true } },
    },
    orderBy: [{ status: 'asc' }, { order: 'asc' }],
  });

  const kanbanShots: KanbanShot[] = shots.map((s) => ({
    id: s.id,
    code: s.code,
    title: s.title,
    projectId: s.project.id,
    projectTitle: s.project.title,
    ownerName: s.owner?.name ?? null,
    ownerAvatarUrl: s.owner?.avatarUrl ?? null,
    dueDate: s.dueDate?.toISOString() ?? null,
    progress: computeProgress(s.items as { state: 'TODO' | 'WIP' | 'DONE' | 'BLOCKED' }[]),
    status: s.status as KanbanShot['status'],
  }));

  return (
    <>
      <TopBar breadcrumbs={[{ label: 'Канбан' }]} />
      <div className={styles.content}>
        <KanbanBoard
          initialShots={kanbanShots}
          canChangeStatus={canChangeStatus}
          canCreateShot={canCreateShot}
        />
      </div>
    </>
  );
}
