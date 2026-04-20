'use client';

import { useState } from 'react';
import Link from 'next/link';
import TopBar from '@/components/layout/TopBar/TopBar';
import { Badge, Button, ProgressBar } from '@/components/ui';
import { Icons } from '@/components/icons';
import { NewShotModal } from '@/components/projects/NewShotModal';
import { shotStatusBadgeKind } from '@/lib/utils';
import { can, type Role } from '@/lib/roles';
import styles from './page.module.css';

const SHOT_STATUS_LABELS: Record<string, string> = {
  TODO: 'Бэклог', WIP: 'В работе', REVIEW: 'На ревью', DONE: 'Сдано',
};

interface ShotRow {
  id: string;
  code: string;
  title: string;
  status: string;
  owner: string | null;
  progress: number;
}

interface ProjectDetailClientProps {
  projectId: string;
  projectTitle: string;
  projectClient: string;
  shots: ShotRow[];
  userRole: Role;
}

export default function ProjectDetailClient({
  projectId,
  projectTitle,
  projectClient,
  shots: initialShots,
  userRole,
}: ProjectDetailClientProps) {
  const [shots, setShots] = useState(initialShots);
  const [showNew, setShowNew] = useState(false);

  const handleCreated = (shot: { id: string; code: string; title: string; status: string; owner: null; progress: number }) => {
    setShots((prev) => [...prev, { ...shot, owner: null }]);
  };

  return (
    <>
      <TopBar
        breadcrumbs={[
          { label: 'Проекты', href: '/projects' },
          { label: projectTitle },
        ]}
        action={
          can.manageChecklist(userRole) ? (
            <Button
              variant="primary"
              size="sm"
              icon={<Icons.Plus size={14} />}
              onClick={() => setShowNew(true)}
            >
              Новый шот
            </Button>
          ) : undefined
        }
      />

      <div className={styles.content}>
        <div className={styles.header}>
          <div>
            <div className={styles.client}>{projectClient}</div>
            <h1 className={styles.title}>{projectTitle}</h1>
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
                  <Badge kind={shotStatusBadgeKind(shot.status as 'TODO' | 'WIP' | 'REVIEW' | 'DONE')} size="sm" dot>
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
                  <Link href={`/projects/${projectId}/${shot.id}/checklist`} className={styles.link}>
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

      {showNew && (
        <NewShotModal
          projectId={projectId}
          onClose={() => setShowNew(false)}
          onCreated={handleCreated}
        />
      )}
    </>
  );
}
