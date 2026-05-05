export type Role = 'ARTIST' | 'LEAD' | 'QA' | 'POST' | 'PM' | 'ADMIN';

export const can = {
  createProject:   (r: Role) => ['LEAD', 'PM', 'ADMIN'].includes(r),
  editProject:     (r: Role) => ['PM', 'ADMIN'].includes(r),
  deleteProject:   (r: Role) => ['PM', 'ADMIN'].includes(r),
  createShot:      (r: Role) => ['LEAD', 'PM', 'ADMIN'].includes(r),
  editShot:        (r: Role) => ['LEAD', 'PM', 'ADMIN'].includes(r),
  deleteShot:      (r: Role) => ['LEAD', 'PM', 'ADMIN'].includes(r),
  manageChecklist: (r: Role) => ['LEAD', 'ADMIN'].includes(r),
  changeStatus:    (r: Role) => ['LEAD', 'QA', 'PM', 'ADMIN'].includes(r),
  exportProject:   (r: Role) => ['PM', 'ADMIN'].includes(r),
  uploadRender:    (_r: Role) => true,
  assign:          (r: Role) => ['LEAD', 'ADMIN'].includes(r),
  pinComment:      (r: Role) => ['QA', 'LEAD', 'POST', 'PM', 'ADMIN'].includes(r),
  // Поставить пункт на стоп может любой авторизованный пользователь —
  // ставит тот, кто столкнулся с препятствием. Серверная проверка требует
  // обязательную причину (note).
  flagItem:        (_r: Role) => true,
};
