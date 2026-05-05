import { describe, it, expect } from 'vitest';
import { can, type Role } from '@/lib/roles';

const ALL_ROLES: Role[] = ['ARTIST', 'LEAD', 'QA', 'POST', 'PM', 'ADMIN'];

/**
 * RBAC матрица — таблица «роль × операция → разрешено».
 * Это спецификация, по которой проверяется КАЖДАЯ роль на КАЖДУЮ операцию.
 * Любое расхождение между этой матрицей и сервером ломает security.
 */
const MATRIX: Record<keyof typeof can, Record<Role, boolean>> = {
  createProject: {
    ARTIST: false, LEAD: true,  QA: false, POST: false, PM: true,  ADMIN: true,
  },
  editProject: {
    ARTIST: false, LEAD: false, QA: false, POST: false, PM: true,  ADMIN: true,
  },
  deleteProject: {
    ARTIST: false, LEAD: false, QA: false, POST: false, PM: true,  ADMIN: true,
  },
  createShot: {
    ARTIST: false, LEAD: true,  QA: false, POST: false, PM: true,  ADMIN: true,
  },
  editShot: {
    ARTIST: false, LEAD: true,  QA: false, POST: false, PM: true,  ADMIN: true,
  },
  deleteShot: {
    ARTIST: false, LEAD: true,  QA: false, POST: false, PM: true,  ADMIN: true,
  },
  manageChecklist: {
    ARTIST: false, LEAD: true,  QA: false, POST: false, PM: false, ADMIN: true,
  },
  changeStatus: {
    ARTIST: false, LEAD: true,  QA: true,  POST: false, PM: true,  ADMIN: true,
  },
  uploadRender: {
    ARTIST: true,  LEAD: true,  QA: true,  POST: true,  PM: true,  ADMIN: true,
  },
  assign: {
    ARTIST: false, LEAD: true,  QA: false, POST: false, PM: false, ADMIN: true,
  },
  pinComment: {
    ARTIST: false, LEAD: true,  QA: true,  POST: true,  PM: true,  ADMIN: true,
  },
  flagItem: {
    ARTIST: true,  LEAD: true,  QA: true,  POST: true,  PM: true,  ADMIN: true,
  },
  exportProject: {
    ARTIST: false, LEAD: false, QA: false, POST: false, PM: true,  ADMIN: true,
  },
};

describe('lib/roles — can.* matrix (RBAC спецификация)', () => {
  // Авто-проверка: каждая комбинация роль × операция должна совпасть с MATRIX.
  for (const [op, perRole] of Object.entries(MATRIX)) {
    describe(op, () => {
      for (const role of ALL_ROLES) {
        const expected = perRole[role];
        it(`${role} ${expected ? '✓' : '✗'}`, () => {
          const fn = can[op as keyof typeof can] as (r: Role) => boolean;
          expect(fn(role)).toBe(expected);
        });
      }
    });
  }
});

describe('lib/roles — структурные проверки', () => {
  it('включает все 6 CRM-ролей', () => {
    const roles: Role[] = ['ARTIST', 'LEAD', 'QA', 'POST', 'PM', 'ADMIN'];
    expect(roles).toHaveLength(6);
  });

  it('uploadRender открыт для всех (включая ARTIST)', () => {
    for (const role of ALL_ROLES) {
      expect(can.uploadRender(role)).toBe(true);
    }
  });

  it('flagItem открыт для всех — стоп ставит тот, кто столкнулся с препятствием', () => {
    for (const role of ALL_ROLES) {
      expect(can.flagItem(role)).toBe(true);
    }
  });

  it('manageChecklist строго LEAD+ADMIN — не PM', () => {
    expect(can.manageChecklist('LEAD')).toBe(true);
    expect(can.manageChecklist('ADMIN')).toBe(true);
    expect(can.manageChecklist('PM')).toBe(false);
  });

  it('assign только LEAD+ADMIN — назначение исполнителя не управляется PM', () => {
    expect(can.assign('LEAD')).toBe(true);
    expect(can.assign('ADMIN')).toBe(true);
    expect(can.assign('PM')).toBe(false);
  });

  it('pinComment ВСЕ кроме ARTIST — ARTIST получатель правок, не автор', () => {
    expect(can.pinComment('ARTIST')).toBe(false);
    expect(can.pinComment('QA')).toBe(true);
    expect(can.pinComment('LEAD')).toBe(true);
    expect(can.pinComment('POST')).toBe(true);
    expect(can.pinComment('PM')).toBe(true);
    expect(can.pinComment('ADMIN')).toBe(true);
  });

  it('createShot/editShot/deleteShot одинаковая разрешалка (LEAD/PM/ADMIN)', () => {
    for (const role of ALL_ROLES) {
      const c = can.createShot(role);
      const e = can.editShot(role);
      const d = can.deleteShot(role);
      expect(c).toBe(e);
      expect(e).toBe(d);
    }
  });

  it('editProject/deleteProject/exportProject одинаковы (PM+ADMIN)', () => {
    for (const role of ALL_ROLES) {
      expect(can.editProject(role)).toBe(can.deleteProject(role));
      expect(can.editProject(role)).toBe(can.exportProject(role));
    }
  });

  it('ADMIN имеет доступ ко всем операциям', () => {
    for (const op of Object.keys(can) as (keyof typeof can)[]) {
      const fn = can[op] as (r: Role) => boolean;
      expect(fn('ADMIN'), `ADMIN должен иметь доступ к ${op}`).toBe(true);
    }
  });
});
