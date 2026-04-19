import { notFound } from 'next/navigation';
import Link from 'next/link';
import TopBar from '@/components/layout/TopBar/TopBar';
import { Badge, ProgressBar } from '@/components/ui';
import { computeProgress, shotStatusBadgeKind } from '@/lib/utils';
import styles from './page.module.css';

const SHOT_STATUS_LABELS: Record<string, string> = {
  TODO: 'Бэклог',
  WIP: 'В работе',
  REVIEW: 'На ревью',
  DONE: 'Сдано',
};

async function getProject(id: string) {
  try {
    const { prisma } = await import('@/lib/prisma');
    return prisma.project.findUnique({
      where: { id },
      include: {
        shots: {
          include: {
            items: { select: { state: true } },
            owner: { select: { name: true } },
          },
          orderBy: { code: 'asc' },
        },
      },
    });
  } catch {
    return null;
  }
}

export default async function ProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const project = await getProject(projectId);

  if (!project) notFound();

  const shots = project.shots.map((s) => ({
    id: s.id,
    code: s.code,
    title: s.title,
    status: s.status,
    owner: s.owner?.name ?? null,
    progress: computeProgress(s.items as { state: string }[]),
  }));

  return (
    <>
      <TopBar
        breadcrumbs={[
          { label: 'Проекты', href: '/projects' },
          { label: project.title },
        ]}
      />
      <div className={styles.content}>
        <div className={styles.header}>
          <div>
            <div className={styles.client}>{project.client}</div>
            <h1 className={styles.title}>{project.title}</h1>
          </div>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Шот</th>
              <th className={styles.th}>Статус</th>
              <th className={styles.th}>Исполнитель</th>
              <th className={styles.th}>Прогресс</th>
              <th className={styles.th}></th>
            </tr>
          </thead>
          <tbody>
            {shots.map((shot) => (
              <tr key={shot.id} className={styles.tr}>
                <td className={styles.td}>
                  <div className={styles.shotCode}>{shot.code}</div>
                  <div className={styles.shotTitle}>{shot.title}</div>
                </td>
                <td className={styles.td}>
                  <Badge kind={shotStatusBadgeKind(shot.status as any)} size="sm" dot>
                    {SHOT_STATUS_LABELS[shot.status] ?? shot.status}
                  </Badge>
                </td>
                <td className={styles.td}>
                  <span className={styles.owner}>{shot.owner ?? '—'}</span>
                </td>
                <td className={styles.tdProgress}>
                  <ProgressBar value={shot.progress} height={5} />
                  <span className={styles.pct}>{Math.round(shot.progress)}%</span>
                </td>
                <td className={styles.tdAction}>
                  <Link
                    href={`/projects/${projectId}/${shot.id}/checklist`}
                    className={styles.link}
                  >
                    Чек-лист →
                  </Link>
                </td>
              </tr>
            ))}
            {shots.length === 0 && (
              <tr>
                <td colSpan={5} className={styles.emptyRow}>Шоты не добавлены</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
