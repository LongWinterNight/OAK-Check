import { test, expect } from '@playwright/test';

/**
 * Smoke-проверки — что страницы вообще открываются без ошибок:
 * нет 500, нет «Failed to compile», заголовок страницы корректный.
 */

const URLS = [
  { path: '/dashboard', titleContains: 'OAK' },
  { path: '/projects', titleContains: 'OAK' },
  { path: '/tasks', titleContains: 'OAK' },
  { path: '/library', titleContains: 'OAK' },
  { path: '/activity', titleContains: 'OAK' },
  { path: '/kanban', titleContains: 'OAK' },
  { path: '/settings', titleContains: 'OAK' },
];

test.describe('Smoke: pages render without errors', () => {
  for (const { path, titleContains } of URLS) {
    test(`${path} loads with no console errors`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
      page.on('console', (msg) => {
        // Игнорируем info/log/debug — нас интересуют error/warning
        if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`);
      });

      const response = await page.goto(path);
      expect(response?.status(), `HTTP status ${response?.status()}`).toBeLessThan(500);

      await page.waitForLoadState('networkidle');

      const title = await page.title();
      expect(title.toLowerCase()).toContain(titleContains.toLowerCase());

      // Допустимы внешние сетевые ошибки и React HMR-предупреждения
      const fatalErrors = errors.filter(
        (e) =>
          !e.toLowerCase().includes('hot') &&
          !e.toLowerCase().includes('hmr') &&
          !e.toLowerCase().includes('warning') &&
          !e.toLowerCase().includes('hydrat') && // гидратационные предупреждения отдельно
          !e.toLowerCase().includes('failed to fetch'),
      );

      expect(fatalErrors, `Console errors:\n${fatalErrors.join('\n')}`).toEqual([]);
    });
  }
});
