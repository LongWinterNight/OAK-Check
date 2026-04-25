import type { CheckItem, ItemState, ChapterWithItems } from '@/types';

// Объединяет CSS классы, фильтруя пустые строки
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Форматирует дату в человеко-читаемый вид (ru-RU)
export function formatDate(date: string | Date, opts?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('ru-RU', opts ?? { day: '2-digit', month: 'short', year: 'numeric' });
}

// Форматирует время в HH:MM
export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

// Вычисляет прогресс чек-листа (доля done пунктов)
export function computeProgress(items: Pick<CheckItem, 'state'>[]): number {
  if (items.length === 0) return 0;
  const done = items.filter((i) => i.state === 'DONE').length;
  return Math.round((done / items.length) * 100);
}

// Вычисляет данные по главе для ChaptersPanel
export function computeChapterStats(items: Pick<CheckItem, 'state'>[]): {
  progress: number;
  doneCount: number;
  blockedCount: number;
} {
  const total = items.length;
  const doneCount = items.filter((i) => i.state === 'DONE').length;
  const blockedCount = items.filter((i) => i.state === 'BLOCKED').length;
  const progress = total === 0 ? 0 : Math.round((doneCount / total) * 100);
  return { progress, doneCount, blockedCount };
}

// Маппинг статуса из БД → ItemState для Check3
export function dbStateToCheck3(state: ItemState): 'todo' | 'wip' | 'done' {
  switch (state) {
    case 'DONE': return 'done';
    case 'WIP': return 'wip';
    default: return 'todo';
  }
}

// Маппинг из Check3 → ItemState для БД
export function check3ToDbState(state: 'todo' | 'wip' | 'done'): ItemState {
  switch (state) {
    case 'done': return 'DONE';
    case 'wip': return 'WIP';
    default: return 'TODO';
  }
}

// Читаемое название статуса шота
export function shotStatusLabel(status: string): string {
  const map: Record<string, string> = {
    TODO: 'Бэклог',
    WIP: 'В работе',
    REVIEW: 'На ревью',
    APPROVED: 'Одобрено',
    BLOCKED: 'Стоп',
    DONE: 'Сдано',
  };
  return map[status] ?? status;
}

// Вариант Badge по статусу шота
export function shotStatusBadgeKind(status: string) {
  const map: Record<string, string> = {
    TODO: 'neutral',
    WIP: 'info',
    REVIEW: 'wip',
    APPROVED: 'done',
    BLOCKED: 'blocked',
    DONE: 'done',
  };
  return (map[status] ?? 'neutral') as import('@/components/ui').BadgeKind;
}

// Форматирует размер файла
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Truncates строку до max символов
export function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) + '…' : str;
}
