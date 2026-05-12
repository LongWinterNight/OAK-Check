'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icons } from '@/components/icons';
import { Badge, Button, ProgressBar, ConfirmDialog, Avatar } from '@/components/ui';
import { toast } from '@/components/ui/Toast/toastStore';
import { NewProjectModal } from './NewProjectModal';
import { EditProjectModal } from './EditProjectModal';
import { coverStyle } from './projectCovers';
import { can, type Role } from '@/lib/roles';
import styles from './ProjectsGrid.module.css';

type ProjectStatus = 'ACTIVE' | 'PAUSED' | 'DONE' | 'ARCHIVED';

interface ShotSummary {
  id: string;
  code: string;
  status: string;
  progress: number;
}

interface ProjectMember {
  id: string;
  name: string;
  avatarUrl: string | null;
}

interface Project {
  id: string;
  title: string;
  client: string;
  status: ProjectStatus;
  dueDate: string | null;
  coverGradient?: string | null;
  coverImage?: string | null;
  shots: ShotSummary[];
  doneShots: number;
  totalProgress: number;
  reviewCount: number;
  blockedItemsCount: number;
  activeStage: string | null;
  members: ProjectMember[];
}

const STATUS_LABELS: Record<ProjectStatus, string> = {
  ACTIVE: 'Активный',
  PAUSED: 'На паузе',
  DONE: 'Завершён',
  ARCHIVED: 'Архив',
};

// 3 кнопки фильтра вместо 5 (как в дизайне)
type Filter = 'all' | 'active' | 'done';

const FILTER_LABELS: Record<Filter, string> = {
  all: 'Все',
  active: 'Активные',
  done: 'Завершённые',
};

function isDoneStatus(s: ProjectStatus) {
  return s === 'DONE' || s === 'ARCHIVED';
}

function ProjectCard({
  project,
  canEdit,
  canDelete,
  compact = false,
  onEdit,
  onDelete,
}: {
  project: Project;
  canEdit: boolean;
  canDelete: boolean;
  compact?: boolean;
  onEdit: () => void;
  onDelete: (id: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/projects/${project.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      onDelete(project.id);
      toast.success(`Проект «${project.title}» удалён`);
    } catch {
      toast.error('Не удалось удалить проект');
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const showMenu = canEdit || canDelete;
  const dueLabel = project.dueDate
    ? new Date(project.dueDate).toLocaleDateString('ru', { day: 'numeric', month: 'short' })
    : null;

  const hasBlockers = project.blockedItemsCount > 0;
  const hasReview = project.reviewCount > 0;

  return (
    <>
      <div className={[styles.cardWrap, compact ? styles.cardCompact : ''].join(' ')}>
        <Link href={`/projects/${project.id}`} className={styles.card}>
          {/* Hero (cover) */}
          <div
            className={styles.cover}
            style={coverStyle(project.coverImage, project.coverGradient)}
            aria-hidden="true"
          >
            <div className={styles.coverTitle}>{project.title}</div>
            {hasBlockers && !compact && (
              <span className={styles.blockerBadge}>
                <span className={styles.blockerDot} />
                {project.blockedItemsCount} блок.
              </span>
            )}
          </div>

          {!compact && (
            <div className={styles.cardBody}>
              <div className={styles.metaRow}>
                <span className={styles.client}>{project.client}</span>
                <div className={styles.metaBadges}>
                  {hasReview && (
                    <span className={styles.reviewBadge}>
                      <span className={styles.reviewDot} />
                      {project.reviewCount} на ревью
                    </span>
                  )}
                  {project.activeStage && (
                    <span className={styles.stageBadge}>{project.activeStage}</span>
                  )}
                </div>
              </div>

              <ProgressBar value={project.totalProgress} height={4} />
              <div className={styles.cardFooter}>
                <div className={styles.members}>
                  {project.members.length > 0
                    ? project.members.map((m) => (
                        <Avatar key={m.id} name={m.name} src={m.avatarUrl} size={22} />
                      ))
                    : (
                      <span className={styles.noMembers}>Команда не назначена</span>
                    )}
                </div>
                <div className={styles.footerStats}>
                  <span className={styles.shotsCount}>
                    {project.doneShots}/{project.shots.length} шотов
                  </span>
                  {dueLabel && <span className={styles.due}>до {dueLabel}</span>}
                </div>
              </div>
            </div>
          )}

          {compact && (
            <div className={styles.cardBodyCompact}>
              <div className={styles.metaRow}>
                <span className={styles.client}>{project.client}</span>
                <Badge kind={project.status === 'DONE' ? 'done' : 'neutral'} size="sm">
                  {STATUS_LABELS[project.status]}
                </Badge>
              </div>
              <ProgressBar value={project.totalProgress} height={3} />
              <div className={styles.cardFooterCompact}>
                <span className={styles.shotsCount}>
                  {project.doneShots}/{project.shots.length} шотов
                </span>
              </div>
            </div>
          )}
        </Link>

        {showMenu && (
          <div className={styles.menuWrap}>
            <button
              className={styles.menuBtn}
              onClick={(e) => { e.preventDefault(); setMenuOpen((v) => !v); }}
              aria-label="Действия"
            >
              <Icons.More size={14} />
            </button>
            {menuOpen && (
              <>
                <div className={styles.menuBackdrop} onClick={() => setMenuOpen(false)} />
                <div className={styles.menu}>
                  {canEdit && (
                    <button
                      className={styles.menuItem}
                      onClick={() => { setMenuOpen(false); onEdit(); }}
                    >
                      <Icons.Pen size={13} />
                      Редактировать
                    </button>
                  )}
                  {canDelete && (
                    <button
                      className={[styles.menuItem, styles.menuDanger].join(' ')}
                      onClick={() => { setMenuOpen(false); setConfirmDelete(true); }}
                    >
                      <Icons.X size={13} />
                      Удалить
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {confirmDelete && (
        <ConfirmDialog
          title="Удалить проект?"
          message={`Проект «${project.title}» и все его данные будут удалены безвозвратно.`}
          confirmLabel="Удалить"
          danger
          loading={deleting}
          onClose={() => setConfirmDelete(false)}
          onConfirm={handleDelete}
        />
      )}
    </>
  );
}

interface ProjectsGridProps {
  initialProjects: Project[];
  userRole: Role;
}

export function ProjectsGrid({ initialProjects, userRole }: ProjectsGridProps) {
  const [projects, setProjects] = useState(initialProjects);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Project | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const router = useRouter();

  const { active, done } = useMemo(() => {
    const list = projects.filter((p) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.client.toLowerCase().includes(q);
    });
    return {
      active: list.filter((p) => !isDoneStatus(p.status)),
      done: list.filter((p) => isDoneStatus(p.status)),
    };
  }, [projects, search]);

  const visibleActive = filter === 'done' ? [] : active;
  const visibleDone = filter === 'active' ? [] : done;

  const totalShots = projects.reduce((sum, p) => sum + p.shots.length, 0);
  const totalDoneShots = projects.reduce((sum, p) => sum + p.doneShots, 0);
  const totalDonePct = totalShots > 0 ? Math.round((totalDoneShots / totalShots) * 100) : 0;
  const activeCount = active.length;
  const doneCount = done.length;

  const handleCreated = (project: Omit<Project, 'shots' | 'totalProgress'> & Partial<Project>) => {
    const full: Project = {
      shots: [], totalProgress: 0, doneShots: 0, reviewCount: 0,
      blockedItemsCount: 0, activeStage: null, members: [],
      ...project,
    } as Project;
    setProjects((prev) => [full, ...prev]);
    toast.success(`Проект «${project.title}» создан`);
    router.refresh();
  };

  const handleUpdated = (updated: Project) => {
    setProjects((prev) => prev.map((p) => p.id === updated.id ? { ...p, ...updated } : p));
    toast.success(`Проект «${updated.title}» обновлён`);
  };

  const handleDelete = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const canEdit = can.editProject(userRole);
  const canDelete = can.deleteProject(userRole);

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerKicker}>OAK3D Studio</div>
          <h1 className={styles.headerTitle}>Проекты</h1>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.searchWrap}>
            <Icons.Search size={14} />
            <input
              className={styles.search}
              placeholder="Поиск по названию или клиенту…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className={styles.filterTabs}>
            {(['all', 'active', 'done'] as Filter[]).map((f) => (
              <button
                key={f}
                className={[styles.filterBtn, filter === f ? styles.filterActive : ''].join(' ')}
                onClick={() => setFilter(f)}
              >
                {FILTER_LABELS[f]}
              </button>
            ))}
          </div>
          {can.createProject(userRole) && (
            <Button
              variant="primary"
              size="sm"
              icon={<Icons.Plus size={13} />}
              onClick={() => setShowModal(true)}
            >
              Новый проект
            </Button>
          )}
        </div>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Активных</div>
          <div className={styles.statValue}>{activeCount}</div>
          <Badge kind="info" size="sm" dot>в работе</Badge>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Завершённых</div>
          <div className={styles.statValue}>{doneCount}</div>
          <Badge kind="neutral" size="sm">архив</Badge>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Всего шотов</div>
          <div className={styles.statValue}>{totalShots}</div>
          <Badge kind="neutral" size="sm">по всем проектам</Badge>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Сдано шотов</div>
          <div className={styles.statValue}>{totalDoneShots}</div>
          <Badge kind="done" size="sm">{totalDonePct}% завершено</Badge>
        </div>
      </div>

      {visibleActive.length > 0 && (
        <>
          <div className={styles.sectionTitle}>Активные проекты</div>
          <div className={styles.grid}>
            {visibleActive.map((p) => (
              <ProjectCard
                key={p.id}
                project={p}
                canEdit={canEdit}
                canDelete={canDelete}
                onEdit={() => setEditTarget(p)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </>
      )}

      {visibleDone.length > 0 && (
        <>
          <div className={[styles.sectionTitle, styles.sectionTitleDone].join(' ')}>Завершённые</div>
          <div className={styles.gridCompact}>
            {visibleDone.map((p) => (
              <ProjectCard
                key={p.id}
                project={p}
                canEdit={canEdit}
                canDelete={canDelete}
                compact
                onEdit={() => setEditTarget(p)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </>
      )}

      {visibleActive.length === 0 && visibleDone.length === 0 && (
        <div className={styles.empty}>
          <Icons.Folder size={32} color="var(--fg-subtle)" />
          <span>{search || filter !== 'all' ? 'Проекты не найдены' : 'Нет проектов'}</span>
        </div>
      )}

      {showModal && (
        <NewProjectModal
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
        />
      )}

      {editTarget && (
        <EditProjectModal
          project={editTarget}
          onClose={() => setEditTarget(null)}
          onUpdated={(u) => { handleUpdated({ ...editTarget, ...u }); setEditTarget(null); }}
        />
      )}
    </div>
  );
}
