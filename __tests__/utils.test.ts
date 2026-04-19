import { describe, it, expect } from 'vitest';
import {
  computeProgress,
  computeChapterStats,
  cn,
  formatFileSize,
  truncate,
  dbStateToCheck3,
  check3ToDbState,
} from '@/lib/utils';

describe('computeProgress', () => {
  it('возвращает 0 для пустого списка', () => {
    expect(computeProgress([])).toBe(0);
  });

  it('возвращает 100 когда все done', () => {
    const items = [
      { state: 'DONE' as const },
      { state: 'DONE' as const },
    ];
    expect(computeProgress(items)).toBe(100);
  });

  it('считает правильный процент', () => {
    const items = [
      { state: 'DONE' as const },
      { state: 'TODO' as const },
      { state: 'WIP' as const },
      { state: 'DONE' as const },
    ];
    expect(computeProgress(items)).toBe(50);
  });

  it('игнорирует BLOCKED при подсчёте прогресса', () => {
    const items = [
      { state: 'DONE' as const },
      { state: 'BLOCKED' as const },
    ];
    expect(computeProgress(items)).toBe(50);
  });
});

describe('computeChapterStats', () => {
  it('возвращает нули для пустого списка', () => {
    expect(computeChapterStats([])).toEqual({ progress: 0, doneCount: 0, blockedCount: 0 });
  });

  it('правильно считает doneCount и blockedCount', () => {
    const items = [
      { state: 'DONE' as const },
      { state: 'BLOCKED' as const },
      { state: 'TODO' as const },
      { state: 'DONE' as const },
    ];
    const stats = computeChapterStats(items);
    expect(stats.doneCount).toBe(2);
    expect(stats.blockedCount).toBe(1);
    expect(stats.progress).toBe(50);
  });
});

describe('cn', () => {
  it('объединяет классы', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c');
  });

  it('фильтрует falsy значения', () => {
    expect(cn('a', false, null, undefined, 'b')).toBe('a b');
  });
});

describe('formatFileSize', () => {
  it('форматирует байты', () => {
    expect(formatFileSize(512)).toBe('512 B');
  });

  it('форматирует килобайты', () => {
    expect(formatFileSize(1536)).toBe('1.5 KB');
  });

  it('форматирует мегабайты', () => {
    expect(formatFileSize(10 * 1024 * 1024)).toBe('10.0 MB');
  });
});

describe('truncate', () => {
  it('не обрезает короткие строки', () => {
    expect(truncate('abc', 10)).toBe('abc');
  });

  it('обрезает длинные строки', () => {
    expect(truncate('abcdefghij', 5)).toBe('abcde…');
  });
});

describe('dbStateToCheck3 / check3ToDbState', () => {
  it('DONE → done → DONE', () => {
    expect(dbStateToCheck3('DONE')).toBe('done');
    expect(check3ToDbState('done')).toBe('DONE');
  });

  it('WIP → wip → WIP', () => {
    expect(dbStateToCheck3('WIP')).toBe('wip');
    expect(check3ToDbState('wip')).toBe('WIP');
  });

  it('TODO/BLOCKED → todo → TODO', () => {
    expect(dbStateToCheck3('TODO')).toBe('todo');
    expect(dbStateToCheck3('BLOCKED')).toBe('todo');
    expect(check3ToDbState('todo')).toBe('TODO');
  });
});
