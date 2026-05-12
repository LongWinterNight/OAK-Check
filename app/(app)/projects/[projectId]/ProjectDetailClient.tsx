'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import TopBar from '@/components/layout/TopBar/TopBar';
import { Badge, Button, ConfirmDialog, Avatar, OakRing, ProgressBar } from '@/components/ui';
import { Icons } from '@/components/icons';
import { NewShotModal } from '@/components/projects/NewShotModal';
import { EditShotModal } from '@/components/projects/EditShotModal';
import { toast } from '@/components/ui/Toast/toastStore';
import { coverStyle } from '@/components/projects/projectCovers';
import { can, type Role } from '@/lib/roles';
import styles from './page.module.css';

type ShotStatus = 'TODO' | 'WIP' | 'REVIEW' | 'DONE';

const SHOT_STATUS_LABELS: Record<string, string> = {
  TODO: 'Не начат', WIP: 'В работе', REVIEW: 'На ревью', DONE: 'Готово',
};

const STATUS_BADGE_KIND: Record<string, 'neutral' | 'info' | 'wip' | 'done'> = {
  TODO: 'neutral', WIP: 'info', REVIEW: 'wip', DONE: 'done',
};

interface ShotOwner {
  id: string;
  name: string;
  avatarUrl: string | null;
}

interface ShotRow {
  id: string;
  code: string;
  title: string;
  status: string;
  owner: ShotOwner | null;
  progress: number;
  stage: string | null;
  blockedItemsCount: number;
  commentsCount: number;
  latestVersion: string | null;
  thumbnail: string | null;
  dueDate: string | null;
}

interface ProjectMeta {
  id: string;
  title: string;
  client: string;
  coverGradient: string | null;
  coverImage: string | null;
  dueDate: string | null;
}

interface ProjectStats {
  total: number;
  todo: number;
  wip: number;
  review: number;
  done: number;
  blocked: number;
  progress: number;
}

interface ProjectDetailClientProps {
  projectId: string;
  project: ProjectMeta;
  shots: ShotRow[];
  stats: ProjectStats;
  userRole: Role;
}

type FilterKey = 'all' | 'TODO' | 'WIP' | 'REVIEW' | 'DONE' | 'BLOCKED';

const FILTER_LABELS: Record<FilterKey, string> = {
  all:    'Все',
  TODO:   'Не начаты',
  WIP:    'В работе',
  REVIEW: 'На ревью',
  DONE:   'Готово',
  BLOCKED: 'На стопе',
};

// Порядок групп в выводе (сверху вниз)
const GROUP_ORDER: ShotStatus[] = ['TODO', 'WIP', 'REVIEW', 'DONE'];

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
  if (!canEdit && !canDelete) return null;
  return (
    <div className={styles.menuWrap}>
      <button
        className={styles.menuBtn}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen((v) => !v); }}
        aria-label="Действия"
      >
        <Icons.More size={14} />
      </button>
      {open && (
        <>
          <div className={styles.menuBackdrop} onClick={() => setOpen(false)} />
          <div className={styles.menu}>
            {canEdit && (
              <button className={styles.menuItem} onClick={(e) => { e.preventDefault(); setOpen(false); onEdit(); }}>
                <Icons.Pen size={13} /> Редактировать
              </button>
            )}
            {canDelete && (
              <button className={[styles.menuItem, styles.menuDanger].join(' ')} onClick={(e) => { e.preventDefault(); setOpen(false); onDelete(); }}>
                <Icons.X size={13} /> Удалить
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function ShotRowItem({
  shot,
  projectId,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
}: {
  shot: ShotRow;
  projectId: string;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (s: ShotRow) => void;
  onDelete: (s: ShotRow) => void;
}) {
  const due = shot.dueDate
    ? new Date(shot.dueDate).toLocaleDateString('ru', { day: 'numeric', month: 'short' })
    : null;

  return (
    <Link href={`/projects/${projectId}/${shot.id}/checklist`} className={styles.shotRow}>
      {/* Thumbnail */}
      <div className={styles.shotThumb}>
        {shot.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={shot.thumbnail} alt={shot.code} className={styles.shotThumbImg} />
        ) : (
          <div
            className={styles.shotThumbPlaceholder}
            style={{ background: `linear-gradient(135deg, hsl(${(shot.code.charCodeAt(0) * 17) % 360}, 25%, 28%), hsl(${(shot.code.charCodeAt(0) * 17 + 60) % 360}, 30%, 18%))` }}
          />
        )}
      </div>

      {/* Title + code + badges */}
      <div className={styles.shotTitleCol}>
        <div className={styles.shotTitle}>{shot.title}</div>
        <div className={styles.shotSub}>
          <span className={styles.shotCode}>{shot.code}</span>
          {shot.blockedItemsCount > 0 && (
            <span className={styles.shotBlocker}>● {shot.blockedItemsCount} блок.</span>
          )}
          {shot.commentsCount > 0 && (
            <span className={styles.shotComments}>
              <Icons.Msg size={11} /> {shot.commentsCount}
            </span>
          )}
        </div>
      </div>

      {/* Stage */}
      <div className={styles.shotStage}>{shot.stage ?? '—'}</div>

      {/* Progress */}
      <div className={styles.shotProgress}>
        <ProgressBar value={shot.progress} height={4} />
        <span className={styles.shotProgressPct}>{Math.round(shot.progress)}%</span>
      </div>

      {/* Version */}
      <div className={styles.shotVersion}>{shot.latestVersion ?? '—'}</div>

      {/* Status badge */}
      <div className={styles.shotStatus}>
        <Badge kind={STATUS_BADGE_KIND[shot.status] ?? 'neutral'} size="sm" dot>
          {SHOT_STATUS_LABELS[shot.status] ?? shot.status}
        </Badge>
      </div>

      {/* Due date */}
      <div className={styles.shotDue}>{due ?? '—'}</div>

      {/* Avatar */}
      <div className={styles.shotOwner}>
        {shot.owner ? (
          <Avatar name={shot.owner.name} src={shot.owner.avatarUrl} size={26} />
        ) : (
          <div className={styles.shotOwnerEmpty} title="Не назначен">
            <Icons.User size={12} />
          </div>
        )}
      </div>

      {/* Menu */}
      <ShotMenu
        shot={shot}
        canEdit={canEdit}
        canDelete={canDelete}
        onEdit={() => onEdit(shot)}
        onDelete={() => onDelete(shot)}
      />
    </Link>
  );
}

export default function ProjectDetailClient({
  projectId,
  project,
  shots: initialShots,
  stats,
  userRole,
}: ProjectDetailClientProps) {
  const [shots, setShots] = useState(initialShots);
  const [showNew, setShowNew] = useState(false);
  const [editTarget, setEditTarget] = useState<ShotRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ShotRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');

  const handleCreated = (shot: { id: string; code: string; title: string; status: string; owner: null; progress: number }) => {
    setShots((prev) => [...prev, {
      ...shot,
      stage: null,
      blockedItemsCount: 0,
      commentsCount: 0,
      latestVersion: null,
      thumbnail: null,
      dueDate: null,
    }]);
  };

  const handleUpdated = (updated: { id: string; code?: string; title?: string; status?: string }) => {
    setShots((prev) => prev.map((s) => s.id === updated.id ? { ...s, ...updated } as ShotRow : s));
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

  // Фильтрация + поиск
  const filtered = useMemo(() => {
    return shots.filter((s) => {
      // фильтр по статусу или BLOCKED-пунктам
      if (filter === 'BLOCKED') {
        if (s.blockedItemsCount === 0) return false;
      } else if (filter !== 'all') {
        if (s.status !== filter) return false;
      }
      if (search) {
        const q = search.toLowerCase();
        if (!s.title.toLowerCase().includes(q) && !s.code.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [shots, filter, search]);

  // Группировка по статусу (TODO / WIP / REVIEW / DONE)
  const groups = useMemo(() => {
    const map = new Map<ShotStatus, ShotRow[]>();
    for (const status of GROUP_ORDER) map.set(status, []);
    for (const s of filtered) {
      const list = map.get(s.status as ShotStatus);
      if (list) list.push(s);
    }
    return GROUP_ORDER.map((status) => ({ status, shots: map.get(status) ?? [] }));
  }, [filtered]);

  const dueLabel = project.dueDate
    ? new Date(project.dueDate).toLocaleDateString('ru', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  return (
    <>
      <TopBar
        breadcrumbs={[
          { label: 'Проекты', href: '/projects' },
          { label: project.title },
        ]}
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            {canExport && (
              <Button
                variant="ghost"
                size="sm"
                icon={<Icons.Paper size={14} />}
                onClick={() => window.open(`/api/projects/${project.id}/export`, '_blank')}
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
        {/* ── Hero ──────────────────────────────────────── */}
        <div className={styles.hero}>
          <div className={styles.heroCover} style={coverStyle(project.coverImage, project.coverGradient)} />
          <div className={styles.heroBody}>
            <div className={styles.heroBreadcrumb}>
              <Link href="/projects" className={styles.heroBreadLink}>
                <Icons.ChevL size={12} /> Проекты
              </Link>
            </div>
            <h1 className={styles.heroTitle}>{project.title}</h1>
            <div className={styles.heroClient}>{project.client}</div>

            <div className={styles.heroStats}>
              <div className={styles.heroStat}>
                <div className={styles.heroStatValue}>{stats.total}</div>
                <div className={styles.heroStatLabel}>Всего</div>
              </div>
              <div className={[styles.heroStat, styles.heroStatWip].join(' ')}>
                <div className={styles.heroStatValue}>{stats.wip}</div>
                <div className={styles.heroStatLabel}>В работе</div>
              </div>
              <div className={[styles.heroStat, styles.heroStatReview].join(' ')}>
                <div className={styles.heroStatValue}>{stats.review}</div>
                <div className={styles.heroStatLabel}>На ревью</div>
              </div>
              <div className={[styles.heroStat, styles.heroStatBlocked].join(' ')}>
                <div className={styles.heroStatValue}>{stats.blocked}</div>
                <div className={styles.heroStatLabel}>На стопе</div>
              </div>
              <div className={[styles.heroStat, styles.heroStatDone].join(' ')}>
                <div className={styles.heroStatValue}>{stats.done}</div>
                <div className={styles.heroStatLabel}>Готово</div>
              </div>
            </div>

            {dueLabel && (
              <div className={styles.heroDue}>
                <Icons.Calendar size={12} /> Дедлайн проекта: {dueLabel}
              </div>
            )}
          </div>
          <div className={styles.heroRing}>
            <OakRing value={stats.progress} size={88} stroke={5} segments={2} />
          </div>
        </div>

        {/* ── Toolbar ───────────────────────────────────── */}
        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <Icons.Search size={14} />
            <input
              className={styles.search}
              placeholder="Поиск по шоту…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className={styles.searchClear} onClick={() => setSearch('')} title="Очистить">
                <Icons.X size={11} />
              </button>
            )}
          </div>

          <div className={styles.filterTabs}>
            {(['all', 'WIP', 'REVIEW', 'BLOCKED', 'DONE', 'TODO'] as FilterKey[]).map((f) => (
              <button
                key={f}
                className={[styles.filterBtn, filter === f ? styles.filterActive : ''].join(' ')}
                onClick={() => setFilter(f)}
              >
                {FILTER_LABELS[f]}
              </button>
            ))}
          </div>
        </div>

        {/* ── Shots groups ──────────────────────────────── */}
        {filtered.length === 0 ? (
          <div className={styles.empty}>
            <Icons.Oak size={32} color="var(--fg-subtle)" />
            <div className={styles.emptyTitle}>
              {search || filter !== 'all' ? 'По фильтру ничего' : 'Шоты не добавлены'}
            </div>
            <div className={styles.emptyText}>
              {search || filter !== 'all'
                ? 'Попробуйте сбросить фильтр или поиск.'
                : 'Добавьте первый шот через кнопку «Новый шот» сверху.'}
            </div>
          </div>
        ) : (
          <div className={styles.groups}>
            {groups.map((g) => {
              if (g.shots.length === 0) return null;
              return (
                <div key={g.status} className={styles.group}>
                  <div className={styles.groupHeader}>
                    <Badge kind={STATUS_BADGE_KIND[g.status]} size="sm" dot>
                      {SHOT_STATUS_LABELS[g.status]}
                    </Badge>
                    <span className={styles.groupCount}>{g.shots.length}</span>
                  </div>
                  <div className={styles.groupItems}>
                    {g.shots.map((shot) => (
                      <ShotRowItem
                        key={shot.id}
                        shot={shot}
                        projectId={projectId}
                        canEdit={canEdit}
                        canDelete={canDelete}
                        onEdit={setEditTarget}
                        onDelete={setDeleteTarget}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
