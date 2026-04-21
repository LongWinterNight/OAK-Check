'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icons } from '@/components/icons';
import { Badge, Button, ProgressBar, ConfirmDialog } from '@/components/ui';
import { shotStatusBadgeKind } from '@/lib/utils';
import { toast } from '@/components/ui/Toast/toastStore';
import { NewProjectModal } from './NewProjectModal';
import { EditProjectModal } from './EditProjectModal';
import { can, type Role } from '@/lib/roles';
import styles from './ProjectsGrid.module.css';

type ProjectStatus = 'ACTIVE' | 'PAUSED' | 'DONE' | 'ARCHIVED';

interface ShotSummary {
  id: string;
  code: string;
  status: string;
  progress: number;
}

interface Project {
  id: string;
  title: string;
  client: string;
  status: ProjectStatus;
  dueDate: string | null;
  shots: ShotSummary[];
  totalProgress: number;
}

const STATUS_LABELS: Record<ProjectStatus, string> = {
  ACTIVE: 'Активный',
  PAUSED: 'На паузе',
  DONE: 'Завершён',
  ARCHIVED: 'Архив',
};

const PROJECT_COLORS = [
  ['#4F6EBD', '#2A3E7A'],
  ['#8C5E1E', '#4A3616'],
  ['#3F8C4A', '#1F4A26'],
  ['#B87A14', '#6B4600'],
  ['#7B4FBD', '#3E2A6A'],
];

function projectGradient(id: string) {
  const idx = id.charCodeAt(0) % PROJECT_COLORS.length;
  const [a, b] = PROJECT_COLORS[idx];
  return `linear-gradient(135deg, ${a}, ${b})`;
}

function ProjectCard({
  project,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
}: {
  project: Project;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: () => void;
  onDelete: (id: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const doneShots = (project.shots ?? []).filter((s) => s.status === 'DONE').length;

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

  return (
    <>
      <div className={styles.cardWrap}>
        <Link href={`/projects/${project.id}`} className={styles.card}>
          <div className={styles.cardHeader}>
            <div
              className={styles.thumb}
              style={{ background: projectGradient(project.id) }}
              aria-hidden="true"
            />
            <div className={styles.cardMeta}>
              <Badge kind={shotStatusBadgeKind(project.status as any)} size="sm" dot>
                {STATUS_LABELS[project.status]}
              </Badge>
              {project.dueDate && (
                <span className={styles.due}>
                  <Icons.Calendar size={11} />
                  {new Date(project.dueDate).toLocaleDateString('ru', { day: 'numeric', month: 'short' })}
                </span>
              )}
            </div>
          </div>

          <div className={styles.cardBody}>
            <div className={styles.client}>{project.client}</div>
            <div className={styles.title}>{project.title}</div>
            <ProgressBar value={project.totalProgress} height={5} />
            <div className={styles.cardFooter}>
              <span className={styles.shotCount}>
                {doneShots}/{(project.shots ?? []).length} шотов
              </span>
              <span className={styles.progress}>{Math.round(project.totalProgress)}%</span>
            </div>
          </div>
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

const STATUS_FILTERS: { value: ProjectStatus | ''; label: string }[] = [
  { value: '', label: 'Все' },
  { value: 'ACTIVE', label: 'Активные' },
  { value: 'PAUSED', label: 'На паузе' },
  { value: 'DONE', label: 'Завершённые' },
  { value: 'ARCHIVED', label: 'Архив' },
];

export function ProjectsGrid({ initialProjects, userRole }: ProjectsGridProps) {
  const [projects, setProjects] = useState(initialProjects);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Project | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | ''>('');
  const router = useRouter();

  const filtered = projects.filter((p) => {
    const matchSearch = !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.client.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleCreated = (project: Omit<Project, 'shots' | 'totalProgress'> & Partial<Project>) => {
    const full: Project = { shots: [], totalProgress: 0, ...project };
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
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <Icons.Search size={14} />
          <input
            className={styles.search}
            placeholder="Поиск по проектам…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
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

      <div className={styles.statusFilters}>
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            className={[styles.statusBtn, statusFilter === f.value ? styles.statusBtnActive : ''].join(' ')}
            onClick={() => setStatusFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <Icons.Folder size={32} color="var(--fg-subtle)" />
          <span>{search || statusFilter ? 'Проекты не найдены' : 'Нет проектов'}</span>
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map((p) => (
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
