export type Role = 'ARTIST' | 'LEAD' | 'QA' | 'POST' | 'PM' | 'ADMIN';

export const can = {
  createProject: (r: Role) => ['LEAD', 'PM', 'ADMIN'].includes(r),
  editProject:   (r: Role) => ['PM', 'ADMIN'].includes(r),
  deleteProject: (r: Role) => ['PM', 'ADMIN'].includes(r),
  manageChecklist: (r: Role) => ['LEAD', 'ADMIN'].includes(r),
  changeStatus:   (r: Role) => ['LEAD', 'QA', 'PM', 'ADMIN'].includes(r),
  uploadRender:   (_r: Role) => true,
  assign:         (r: Role) => ['LEAD', 'ADMIN'].includes(r),
};
