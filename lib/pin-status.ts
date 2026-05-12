import type { Comment } from '@/types';

export type ThreadStatus = 'open' | 'blocker' | 'resolved';

// Маркер блокера в теле комментария — пользователь явно отмечает
// проблему как критическую.
export const BLOCKER_RE = /(^|\s)(🚨|\[блок(ер)?\]|\[blocker\]|блокер[!:.]|critical[!:.])/i;

// Статус треда-пина (только для top-level комментариев с пином):
//   blocker  = тело содержит маркер 🚨/[блокер]/[blocker]
//   resolved = у пина есть хотя бы один ответ
//   open     = пин без ответов и без маркера
// Возвращает null если комментарий не является top-level пином.
export function threadStatus(c: Comment, allComments: Comment[]): ThreadStatus | null {
  if (c.parentId) return null;
  if (c.pinX === null) return null;
  if (BLOCKER_RE.test(c.body)) return 'blocker';
  const hasReplies = allComments.some((x) => x.parentId === c.id);
  return hasReplies ? 'resolved' : 'open';
}

// CSS-цвет (через token) по статусу — для пинов и бейджей.
export const STATUS_COLOR: Record<ThreadStatus, string> = {
  open: 'var(--wip, #f59e0b)',
  blocker: 'var(--blocked, #ef4444)',
  resolved: 'var(--done, #10b981)',
};
