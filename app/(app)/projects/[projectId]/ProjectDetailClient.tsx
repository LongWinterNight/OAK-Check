'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import TopBar from '@/components/layout/TopBar/TopBar';
import { Badge, Button, ProgressBar, ConfirmDialog } from '@/components/ui';
import { Icons } from '@/components/icons';
import { NewShotModal } from '@/components/projects/NewShotModal';
import { EditShotModal } from '@/components/projects/EditShotModal';
import { toast } from '@/components/ui/Toast/toastStore';
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
  software?: string;
  resolution?: string;
  dueDate?: string | null;
}

function ShotMenu({
  shot,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
}: {
  shot: ShotRow;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  if (!canEdit && !canDelete) return null;

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        className={styles.menuBtn}
        onClick={(e) => { e.preventDefault(); setOpen((v) => !v); }}
        aria-label="Действия"
      >
        <Icons.More size={14} />
      </button>
      {open && (
        <div className={styles.menu}>
          {canEdit && (
            <button className={styles.menuItem} onClick={() => { setOpen(false); onEdit(); }}>
              <Icons.Pen size={13} /> Редактировать
            </button>
          )}
          {canDelete && (
            <button className={[styles.menuItem, styles.menuDanger].join(' ')} onClick={() => { setOpen(false); onDelete(); }}>
              <Icons.X size={13} /> Удалить
            </button>
          )}
        </div>
      )}
    </div>
  );
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
  const [editTarget, setEditTarget] = useState<ShotRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ShotRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleCreated = (shot: ShotRow) => {
    setShots((prev) => [...prev, shot]);
  };

  const handleUpdated = (updated: ShotRow) => {
    setShots((prev) => prev.map((s) => s.id === updated.id ? { ...s, ...updated } : s));
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/shots/${deleteTarget.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setShots((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      toast.success(`Шот «${deleteTarget.code}» удалён`);
    } catch {
      toast.error('Не удалось удалить шот');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const canEdit = can.editShot(userRole);
  const canDelete = can.deleteShot(userRole);
  const canCreate = can.createShot(userRole);
  const canExport = can.deleteProject(userRole); // PM + ADMIN

  return (
    <>
      <TopBar
        breadcrumbs={[
          { label: 'Проекты', href: '/projects' },
          { label: projectTitle },
        ]}
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            {canExport && (
              <Button
                variant="ghost"
                size="sm"
                icon={<Icons.Paper size={14} />}
                onClick={() => window.open(`/api/projects/${projectId}/export`, '_blank')}
              >
                Экспорт CSV
              </Button>
            )}
            {canCreate && (
              <Button
                variant="primary"
                size="sm"
                icon={<Icons.Plus size={14} />}
                onClick={() => setShowNew(true)}
              >
                Новый шот
              </Button>
            )}
          </div>
        }
      />

      <div className={styles.content}>
        <div className={styles.header}>
          <div>
            <div className={styles.client}>{projectClient}</div>
            <h1 className={styles.title}>{projectTitle}</h1>
          </div>
        </div>

        {/* Desktop table */}
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-end' }}>
                    <Link href={`/projects/${projectId}/${shot.id}/checklist`} className={styles.link}>
                      Чек-лист →
                    </Link>
                    <ShotMenu
                      shot={shot}
                      canEdit={canEdit}
                      canDelete={canDelete}
                      onEdit={() => setEditTarget(shot)}
                      onDelete={() => setDeleteTarget(shot)}
                    />
                  </div>
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

        {/* Mobile card list */}
        <div className={styles.cardList}>
          {shots.length === 0 && (
            <div className={styles.emptyRow}>Шоты не добавлены</div>
          )}
          {shots.map((shot) => (
            <Link
              key={shot.id}
              href={`/projects/${projectId}/${shot.id}/checklist`}
              className={styles.shotCard}
            >
              <div className={styles.shotCardTop}>
                <span className={styles.shotCardCode}>{shot.code}</span>
                <span className={styles.shotCardTitle}>{shot.title}</span>
                <Badge kind={shotStatusBadgeKind(shot.status as 'TODO' | 'WIP' | 'REVIEW' | 'DONE')} size="sm" dot>
                  {SHOT_STATUS_LABELS[shot.status] ?? shot.status}
                </Badge>
              </div>
              <div className={styles.shotCardBottom}>
                <div className={styles.shotCardBar}>
                  <div className={styles.shotCardBarFill} style={{ width: `${Math.round(shot.progress)}%` }} />
                </div>
                <span className={styles.shotCardPct}>{Math.round(shot.progress)}%</span>
                {shot.owner && <span className={styles.shotCardOwner}>{shot.owner}</span>}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {showNew && (
        <NewShotModal
          projectId={projectId}
          onClose={() => setShowNew(false)}
          onCreated={handleCreated}
        />
      )}

      {editTarget && (
        <EditShotModal
          shot={editTarget}
          onClose={() => setEditTarget(null)}
          onUpdated={(u) => handleUpdated({ ...editTarget, ...u })}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Удалить шот?"
          message={`Шот «${deleteTarget.code} — ${deleteTarget.title}» и все его данные (чеклист, комментарии, рендеры) будут удалены безвозвратно.`}
          confirmLabel="Удалить"
          danger
          loading={deleting}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
    </>
  );
}
