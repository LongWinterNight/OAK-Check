// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { useThemeStore } from '@/store/useThemeStore';

/**
 * Zustand store с persist + applyToDOM. В jsdom есть document, applyToDOM
 * выставляет атрибуты на html и инлайновую CSS-переменную.
 */
describe('useThemeStore', () => {
  beforeEach(() => {
    // Сбрасываем store к начальному состоянию (имитация чистой сессии)
    useThemeStore.setState({ dark: false, accent: 'oak', radius: 8 });
    // Чистим html-атрибуты которые могут остаться от прошлого теста
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.removeAttribute('data-accent');
    document.documentElement.style.removeProperty('--radius');
  });

  it('начальное состояние: light, oak, radius=8', () => {
    const { dark, accent, radius } = useThemeStore.getState();
    expect(dark).toBe(false);
    expect(accent).toBe('oak');
    expect(radius).toBe(8);
  });

  it('toggle переключает dark и применяет data-theme="dark"', () => {
    useThemeStore.getState().toggle();
    expect(useThemeStore.getState().dark).toBe(true);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('toggle второй раз возвращает в light и убирает data-theme', () => {
    useThemeStore.getState().toggle(); // → dark
    useThemeStore.getState().toggle(); // → light
    expect(useThemeStore.getState().dark).toBe(false);
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
  });

  it('setAccent сохраняет акцент и пишет data-accent (для не-oak)', () => {
    useThemeStore.getState().setAccent('blue');
    expect(useThemeStore.getState().accent).toBe('blue');
    expect(document.documentElement.getAttribute('data-accent')).toBe('blue');
  });

  it('setAccent("oak") убирает data-accent (oak — дефолт через :root)', () => {
    useThemeStore.getState().setAccent('blue');
    useThemeStore.getState().setAccent('oak');
    expect(useThemeStore.getState().accent).toBe('oak');
    expect(document.documentElement.hasAttribute('data-accent')).toBe(false);
  });

  it('setRadius пишет --radius CSS-переменную', () => {
    useThemeStore.getState().setRadius(12);
    expect(useThemeStore.getState().radius).toBe(12);
    expect(document.documentElement.style.getPropertyValue('--radius')).toBe('12px');
  });

  it('setRadius=0 — плоский режим, поддерживается', () => {
    useThemeStore.getState().setRadius(0);
    expect(useThemeStore.getState().radius).toBe(0);
    expect(document.documentElement.style.getPropertyValue('--radius')).toBe('0px');
  });

  it('applyToDOM комбо: dark + custom accent', () => {
    useThemeStore.setState({ dark: true, accent: 'green', radius: 4 });
    useThemeStore.getState().applyToDOM();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(document.documentElement.getAttribute('data-accent')).toBe('green');
  });

  it('AccentColor типы — все 5 варианта работают', () => {
    const accents = ['blue', 'oak', 'amber', 'green', 'lime'] as const;
    for (const a of accents) {
      useThemeStore.getState().setAccent(a);
      expect(useThemeStore.getState().accent).toBe(a);
    }
  });
});
