import { describe, it, expect } from 'vitest';
import {
  CreateProjectSchema,
  UpdateProjectSchema,
  CreateShotSchema,
  UpdateShotSchema,
  CreateCheckItemSchema,
  UpdateCheckItemSchema,
  CreateCommentSchema,
  UpdateCommentSchema,
  CreateRenderVersionSchema,
  RegisterSchema,
  CreateInvitationSchema,
  CreateChapterSchema,
  ShotStatusSchema,
  AssignShotSchema,
  UpdateUserRoleSchema,
  UpdateMeSchema,
} from '@/lib/zod-schemas';

describe('CreateProjectSchema', () => {
  it('минимальный валидный набор', () => {
    const r = CreateProjectSchema.safeParse({ title: 'Skolkovo One', client: 'Sberbank' });
    expect(r.success).toBe(true);
  });

  it('принимает status, dueDate, coverGradient, coverImage', () => {
    const r = CreateProjectSchema.safeParse({
      title: 'X', client: 'Y',
      status: 'ACTIVE', dueDate: '2026-12-31',
      coverGradient: 'linear-gradient(...)', coverImage: '/api/files/x.png',
    });
    expect(r.success).toBe(true);
  });

  it('пустой title отклоняется', () => {
    expect(CreateProjectSchema.safeParse({ title: '', client: 'Y' }).success).toBe(false);
  });

  it('title больше 100 символов отклоняется', () => {
    expect(CreateProjectSchema.safeParse({ title: 'a'.repeat(101), client: 'Y' }).success).toBe(false);
  });

  it('неизвестный status отклоняется', () => {
    expect(CreateProjectSchema.safeParse({ title: 'X', client: 'Y', status: 'UNKNOWN' }).success).toBe(false);
  });

  it('coverImage может быть null', () => {
    const r = CreateProjectSchema.safeParse({ title: 'X', client: 'Y', coverImage: null });
    expect(r.success).toBe(true);
  });
});

describe('UpdateProjectSchema', () => {
  it('пустой объект валиден (все поля optional)', () => {
    expect(UpdateProjectSchema.safeParse({}).success).toBe(true);
  });

  it('частичное обновление — только status', () => {
    expect(UpdateProjectSchema.safeParse({ status: 'PAUSED' }).success).toBe(true);
  });

  it('dueDate может быть null (для очистки)', () => {
    expect(UpdateProjectSchema.safeParse({ dueDate: null }).success).toBe(true);
  });
});

describe('CreateShotSchema', () => {
  it('минимальный — code и title', () => {
    expect(CreateShotSchema.safeParse({ code: 'SH_010', title: 'Lobby' }).success).toBe(true);
  });

  it('dueDate — простая строка YYYY-MM-DD (не требует .datetime ISO)', () => {
    expect(CreateShotSchema.safeParse({ code: 'A', title: 'B', dueDate: '2026-04-26' }).success).toBe(true);
  });

  it('status опционален и enum', () => {
    expect(CreateShotSchema.safeParse({ code: 'A', title: 'B', status: 'WIP' }).success).toBe(true);
    expect(CreateShotSchema.safeParse({ code: 'A', title: 'B', status: 'BAD' }).success).toBe(false);
  });

  it('пустой code/title отклоняется', () => {
    expect(CreateShotSchema.safeParse({ code: '', title: 'X' }).success).toBe(false);
    expect(CreateShotSchema.safeParse({ code: 'X', title: '' }).success).toBe(false);
  });
});

describe('UpdateShotSchema', () => {
  it('order может быть числом', () => {
    expect(UpdateShotSchema.safeParse({ order: 5 }).success).toBe(true);
  });
  it('assigneeId может быть null', () => {
    expect(UpdateShotSchema.safeParse({ assigneeId: null }).success).toBe(true);
  });
});

describe('CreateCheckItemSchema', () => {
  it('требует chapterId (cuid) и title', () => {
    const r = CreateCheckItemSchema.safeParse({
      chapterId: 'cmod123abc456def789ghi012',
      title: 'Сделать UVW',
    });
    expect(r.success).toBe(true);
  });

  it('chapterId не cuid → отклоняется', () => {
    expect(
      CreateCheckItemSchema.safeParse({ chapterId: 'not-a-cuid', title: 'X' }).success,
    ).toBe(false);
  });
});

describe('UpdateCheckItemSchema', () => {
  it('частичное — только state', () => {
    expect(UpdateCheckItemSchema.safeParse({ state: 'BLOCKED' }).success).toBe(true);
  });

  it('note может быть null (для очистки)', () => {
    expect(UpdateCheckItemSchema.safeParse({ note: null }).success).toBe(true);
  });

  it('note > 1000 символов отклоняется', () => {
    expect(UpdateCheckItemSchema.safeParse({ note: 'a'.repeat(1001) }).success).toBe(false);
  });
});

describe('CreateCommentSchema (refinement: pinX и pinY вместе)', () => {
  it('обычный коммент без пина', () => {
    expect(CreateCommentSchema.safeParse({ body: 'hello' }).success).toBe(true);
  });

  it('коммент с пином — pinX + pinY вместе', () => {
    expect(CreateCommentSchema.safeParse({ body: 'see here', pinX: 50, pinY: 30 }).success).toBe(true);
  });

  it('только pinX без pinY → отклоняется (refinement)', () => {
    expect(CreateCommentSchema.safeParse({ body: 'x', pinX: 10 }).success).toBe(false);
  });

  it('только pinY без pinX → отклоняется (refinement)', () => {
    expect(CreateCommentSchema.safeParse({ body: 'x', pinY: 10 }).success).toBe(false);
  });

  it('pinX > 100 → отклоняется', () => {
    expect(CreateCommentSchema.safeParse({ body: 'x', pinX: 101, pinY: 50 }).success).toBe(false);
  });

  it('пустой body отклоняется', () => {
    expect(CreateCommentSchema.safeParse({ body: '' }).success).toBe(false);
  });

  it('parentId должен быть cuid', () => {
    expect(
      CreateCommentSchema.safeParse({ body: 'reply', parentId: 'not-cuid' }).success,
    ).toBe(false);
  });
});

describe('UpdateCommentSchema', () => {
  it('требует body min(1)', () => {
    expect(UpdateCommentSchema.safeParse({ body: '' }).success).toBe(false);
    expect(UpdateCommentSchema.safeParse({ body: 'x' }).success).toBe(true);
  });
});

describe('CreateRenderVersionSchema', () => {
  it('url относительный путь работает (не требует .url())', () => {
    const r = CreateRenderVersionSchema.safeParse({
      url: '/api/files/abc.jpg',
      version: 'v001',
      resolution: '3840×2160',
    });
    expect(r.success).toBe(true);
  });

  it('format имеет default = "EXR"', () => {
    const r = CreateRenderVersionSchema.safeParse({
      url: '/x.exr',
      version: 'v1',
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.format).toBe('EXR');
  });

  it('пустой url отклоняется', () => {
    expect(
      CreateRenderVersionSchema.safeParse({ url: '', version: 'v1' }).success,
    ).toBe(false);
  });

  it('fileSize отрицательный отклоняется', () => {
    expect(
      CreateRenderVersionSchema.safeParse({ url: '/x', version: 'v1', fileSize: -1 }).success,
    ).toBe(false);
  });
});

describe('RegisterSchema', () => {
  it('валидные данные', () => {
    expect(
      RegisterSchema.safeParse({ token: 'abc', name: 'Иван', password: 'pwd12345' }).success,
    ).toBe(true);
  });

  it('короткое имя (< 2) → отклоняется', () => {
    expect(
      RegisterSchema.safeParse({ token: 'abc', name: 'И', password: 'pwd12345' }).success,
    ).toBe(false);
  });

  it('короткий пароль (< 8) → отклоняется', () => {
    expect(
      RegisterSchema.safeParse({ token: 'abc', name: 'Иван', password: '1234567' }).success,
    ).toBe(false);
  });
});

describe('CreateInvitationSchema', () => {
  it('требует email и role', () => {
    expect(
      CreateInvitationSchema.safeParse({ email: 'a@b.co', role: 'ARTIST' }).success,
    ).toBe(true);
  });

  it('default role = ARTIST', () => {
    const r = CreateInvitationSchema.safeParse({ email: 'a@b.co' });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.role).toBe('ARTIST');
  });

  it('некорректный email → отклоняется', () => {
    expect(CreateInvitationSchema.safeParse({ email: 'not-email' }).success).toBe(false);
  });
});

describe('CreateChapterSchema', () => {
  it('требует shotId и title', () => {
    expect(
      CreateChapterSchema.safeParse({ shotId: 'abc', title: 'Стандартный интерьер' }).success,
    ).toBe(true);
  });

  it('пустой title → 400 с понятным сообщением', () => {
    const r = CreateChapterSchema.safeParse({ shotId: 'x', title: '' });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues[0].message).toMatch(/Название обязательно|обязательно/i);
    }
  });
});

describe('ShotStatusSchema / AssignShotSchema', () => {
  it('ShotStatusSchema принимает только TODO|WIP|REVIEW|DONE', () => {
    expect(ShotStatusSchema.safeParse({ status: 'WIP' }).success).toBe(true);
    expect(ShotStatusSchema.safeParse({ status: 'BLOCKED' }).success).toBe(false); // BLOCKED — статус CheckItem, не Shot
  });

  it('AssignShotSchema разрешает null (снять исполнителя)', () => {
    expect(AssignShotSchema.safeParse({ assigneeId: null }).success).toBe(true);
    expect(AssignShotSchema.safeParse({ assigneeId: 'user-id' }).success).toBe(true);
  });
});

describe('UpdateUserRoleSchema', () => {
  it('частичное — только role', () => {
    expect(UpdateUserRoleSchema.safeParse({ role: 'PM' }).success).toBe(true);
  });

  it('частичное — только online', () => {
    expect(UpdateUserRoleSchema.safeParse({ online: true }).success).toBe(true);
  });

  it('пустой объект тоже валиден', () => {
    expect(UpdateUserRoleSchema.safeParse({}).success).toBe(true);
  });
});

describe('UpdateMeSchema', () => {
  it('минимум одно поле', () => {
    expect(UpdateMeSchema.safeParse({ name: 'Новое имя' }).success).toBe(true);
  });

  it('newPassword короче 6 → отклоняется', () => {
    expect(UpdateMeSchema.safeParse({ newPassword: '12345' }).success).toBe(false);
  });

  it('avatarUrl может быть null', () => {
    expect(UpdateMeSchema.safeParse({ avatarUrl: null }).success).toBe(true);
  });

  it('avatarUrl не URL — отклоняется', () => {
    expect(UpdateMeSchema.safeParse({ avatarUrl: 'just-a-string' }).success).toBe(false);
  });
});
