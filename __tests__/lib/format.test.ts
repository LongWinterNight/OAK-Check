import { describe, it, expect } from 'vitest';
import { formatBytes } from '@/lib/format';

describe('lib/format — formatBytes', () => {
  it('возвращает «—» для null/undefined', () => {
    expect(formatBytes(null)).toBe('—');
    expect(formatBytes(undefined)).toBe('—');
  });

  it('обрабатывает 0 как "0 Б"', () => {
    expect(formatBytes(0)).toBe('0 Б');
  });

  it('форматирует байты без десятичной части', () => {
    expect(formatBytes(512)).toBe('512 Б');
    expect(formatBytes(1023)).toBe('1023 Б');
  });

  it('переключается на КБ при >= 1024 без десятичной части', () => {
    expect(formatBytes(1024)).toBe('1 КБ');
    expect(formatBytes(1536)).toBe('2 КБ'); // округление
    expect(formatBytes(1024 * 999)).toBe('999 КБ');
  });

  it('переключается на МБ с одним знаком после точки', () => {
    expect(formatBytes(1024 * 1024)).toBe('1.0 МБ');
    expect(formatBytes(1024 * 1024 * 1.5)).toBe('1.5 МБ');
    expect(formatBytes(1024 * 1024 * 100)).toBe('100.0 МБ');
  });

  it('переключается на ГБ с одним знаком', () => {
    expect(formatBytes(1024 ** 3)).toBe('1.0 ГБ');
    expect(formatBytes(1024 ** 3 * 2.7)).toBe('2.7 ГБ');
  });

  it('переключается на ТБ с одним знаком', () => {
    expect(formatBytes(1024 ** 4)).toBe('1.0 ТБ');
    expect(formatBytes(1024 ** 4 * 5)).toBe('5.0 ТБ');
  });

  it('не выходит за пределы ТБ (тысячи ТБ остаются в ТБ)', () => {
    const result = formatBytes(1024 ** 5);
    expect(result).toMatch(/ТБ$/);
  });
});
