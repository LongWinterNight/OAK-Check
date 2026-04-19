import { z } from 'zod';

// Проекты
export const CreateProjectSchema = z.object({
  title: z.string().min(1).max(100),
  client: z.string().min(1).max(100),
  coverGradient: z.string().optional(),
});

export const UpdateProjectSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  client: z.string().min(1).max(100).optional(),
  status: z.enum(['ACTIVE', 'PAUSED', 'DONE', 'ARCHIVED']).optional(),
  dueDate: z.string().nullable().optional(),
  coverGradient: z.string().optional(),
});

// Шоты
export const CreateShotSchema = z.object({
  title: z.string().min(1).max(200),
  code: z.string().min(1).max(50),
  assigneeId: z.string().cuid().optional(),
  dueDate: z.string().datetime().optional(),
  software: z.string().optional(),
  resolution: z.string().optional(),
});

export const UpdateShotSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  code: z.string().min(1).max(50).optional(),
  status: z.enum(['TODO', 'WIP', 'REVIEW', 'DONE']).optional(),
  assigneeId: z.string().cuid().nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
  software: z.string().optional(),
  resolution: z.string().optional(),
  order: z.number().int().optional(),
});

// Пункты чек-листа
export const CreateCheckItemSchema = z.object({
  chapterId: z.string().cuid(),
  title: z.string().min(1).max(500),
  ownerId: z.string().cuid().optional(),
});

export const UpdateCheckItemSchema = z.object({
  state: z.enum(['TODO', 'WIP', 'DONE', 'BLOCKED']).optional(),
  note: z.string().max(1000).nullable().optional(),
  ownerId: z.string().cuid().nullable().optional(),
});

export const ReorderItemsSchema = z.object({
  items: z.array(z.object({ id: z.string().cuid(), order: z.number().int() })),
});

// Комментарии
export const CreateCommentSchema = z.object({
  body: z.string().min(1).max(5000),
  pinX: z.number().min(0).max(100).optional(),
  pinY: z.number().min(0).max(100).optional(),
  parentId: z.string().cuid().optional(),
});

export const UpdateCommentSchema = z.object({
  body: z.string().min(1).max(5000),
});

// Версии рендеров
export const CreateRenderVersionSchema = z.object({
  url: z.string().url(),
  version: z.string().min(1).max(20),
  format: z.string().default('EXR'),
  resolution: z.string().min(1),
  thumbnailUrl: z.string().url().optional(),
  fileSize: z.number().int().positive().optional(),
});

// Шаблоны
export const CreateTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  category: z.string().default('Общее'),
  description: z.string().max(500).optional(),
  items: z.array(z.object({
    title: z.string().min(1),
    order: z.number().int().default(0),
  })),
});

// Применить шаблон к шоту
export const ApplyTemplateSchema = z.object({
  templateId: z.string().cuid(),
  chapterName: z.string().optional(),
  replace: z.boolean().default(false),
});

// Пользователь
export const UpdateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  avatarUrl: z.string().url().nullable().optional(),
});
