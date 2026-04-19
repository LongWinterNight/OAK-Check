// Все TypeScript интерфейсы приложения OAK·Check

export type Role = 'ARTIST' | 'LEAD' | 'QA' | 'POST' | 'PM' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatarUrl: string | null;
  online: boolean;
  createdAt: string;
}

export type ProjectStatus = 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';

export interface Project {
  id: string;
  title: string;
  client: string;
  coverGradient: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  shots?: Shot[];
  _count?: { shots: number };
  progress?: number;
}

export type ShotStatus = 'TODO' | 'WIP' | 'REVIEW' | 'APPROVED' | 'BLOCKED' | 'DONE';

export interface Shot {
  id: string;
  projectId: string;
  code: string;
  title: string;
  software: string;
  resolution: string;
  status: ShotStatus;
  assigneeId: string | null;
  dueDate: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
  project?: Project;
  assignee?: User | null;
  progress?: number;
}

export type ItemState = 'TODO' | 'WIP' | 'DONE' | 'BLOCKED';

export interface Chapter {
  id: string;
  title: string;
  description: string;
  order: number;
  templateId: string | null;
}

export interface CheckItem {
  id: string;
  shotId: string;
  chapterId: string;
  title: string;
  state: ItemState;
  ownerId: string | null;
  note: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
  owner?: User | null;
}

export interface ChapterWithItems extends Chapter {
  items: CheckItem[];
  progress: number;
  blockedCount: number;
  doneCount: number;
}

export interface Comment {
  id: string;
  shotId: string;
  userId: string;
  body: string;
  pinX: number | null;
  pinY: number | null;
  parentId: string | null;
  createdAt: string;
  user: User;
  replies?: Comment[];
}

export interface RenderVersion {
  id: string;
  shotId: string;
  version: string;
  url: string;
  thumbnailUrl: string | null;
  format: string;
  resolution: string;
  fileSize: number | null;
  createdAt: string;
}

export interface ChecklistTemplate {
  id: string;
  title: string;
  description: string | null;
  tags: string[];
  usedCount: number;
  createdAt: string;
  chapters?: Chapter[];
  items?: TemplateItem[];
}

export interface TemplateItem {
  id: string;
  templateId: string;
  chapterKey: string;
  title: string;
  order: number;
}

export type ActivityType =
  | 'CHECKLIST_ITEM_UPDATED'
  | 'COMMENT_ADDED'
  | 'RENDER_UPLOADED'
  | 'SHOT_STATUS_CHANGED'
  | 'SHOT_CREATED'
  | 'TEMPLATE_APPLIED';

export interface ActivityEntry {
  id: string;
  userId: string;
  shotId: string | null;
  type: ActivityType;
  payload: Record<string, unknown>;
  createdAt: string;
  user: User;
  shot?: Shot | null;
}

export interface DashboardStats {
  totalShots: number;
  inProgress: number;
  doneToday: number;
  blockers: number;
}

// API response types
export interface ApiError {
  error: string;
  code?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  nextCursor?: string;
  hasMore: boolean;
}
