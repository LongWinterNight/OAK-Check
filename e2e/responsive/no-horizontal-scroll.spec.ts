import { test, expect } from '@playwright/test';

/**
 * Проверка — на каждом ключевом URL не появляется горизонтальный скролл.
 * Это основное измерение успешности адаптива из cross-device-audit.md.
 *
 * Логика: после загрузки страницы и небольшой паузы (для гидратации
 * клиентских компонентов) сравниваем documentElement.scrollWidth и
 * clientWidth. Если scrollWidth превышает clientWidth даже на 1px —
 * значит что-то выезжает за viewport.
 *
 * Допускается погрешность 1px (subpixel rendering на macOS).
 */

const URLS = [
  { path: '/dashboard', name: 'Dashboard' },
  { path: '/projects', name: 'Projects list' },
  { path: '/tasks', name: 'Tasks (мобильный экран ARTIST)' },
  { path: '/review', name: 'Review queue' },
  { path: '/library', name: 'Library' },
  { path: '/activity', name: 'Activity feed' },
  { path: '/kanban', name: 'Kanban' },
  { path: '/settings', name: 'Settings' },
  { path: '/admin', name: 'Admin' },
];

test.describe('No horizontal scroll on key pages', () => {
  for (const { path, name } of URLS) {
    test(`${name} (${path}) — viewport fits content`, async ({ page }) => {
      await page.goto(path);
      // Ждём гидратацию + любые async-данные
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(300);

      const overflow = await page.evaluate(() => {
        const html = document.documentElement;
        const body = document.body;
        return {
          htmlScrollWidth: html.scrollWidth,
          htmlClientWidth: html.clientWidth,
          bodyScrollWidth: body.scrollWidth,
          bodyClientWidth: body.clientWidth,
        };
      });

      // 1px tolerance for subpixel rendering
      expect(
        overflow.htmlScrollWidth,
        `${name}: html.scrollWidth ${overflow.htmlScrollWidth} > clientWidth ${overflow.htmlClientWidth}`,
      ).toBeLessThanOrEqual(overflow.htmlClientWidth + 1);

      expect(
        overflow.bodyScrollWidth,
        `${name}: body.scrollWidth ${overflow.bodyScrollWidth} > clientWidth ${overflow.bodyClientWidth}`,
      ).toBeLessThanOrEqual(overflow.bodyClientWidth + 1);
    });
  }
});
