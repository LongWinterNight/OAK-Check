import { test, expect } from '@playwright/test';

/**
 * WCAG 2.5.5 — touch-targets ≥ 44×44 px на мобиле.
 * Запускаем только в проектах с isMobile (mobile-xs, mobile).
 * На десктопе hover-targets могут быть мельче (28×28 OK).
 *
 * Чек-листим только видимые в viewport интерактивные элементы:
 * <button>, <a>, [role="button"], <select>, <input[type=checkbox]>.
 *
 * Допускаем элементы с pseudo-расширением hit-area через ::before
 * (этот ::before не виден через DOM API — поэтому тест может ругаться
 * на корректные элементы с расширенной touch-зоной). В этом случае
 * элемент помечаем data-touch-ok="true" в коде.
 */

const PAGES = ['/dashboard', '/projects', '/tasks', '/library'];

test.describe('Touch targets ≥ 44px on mobile', () => {
  test.skip(({ isMobile }) => !isMobile, 'Mobile-only test');

  for (const path of PAGES) {
    test(`${path} — interactive elements`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(300);

      const tooSmall = await page.evaluate(() => {
        const selectors = [
          'button:not([disabled])',
          'a[href]',
          '[role="button"]',
          'select',
          'input[type="checkbox"]',
          'input[type="radio"]',
        ].join(',');

        const elements = Array.from(document.querySelectorAll<HTMLElement>(selectors));
        const violations: { tag: string; text: string; w: number; h: number }[] = [];

        for (const el of elements) {
          // Игнорировать невидимые
          const rect = el.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) continue;
          if (rect.bottom < 0 || rect.top > window.innerHeight) continue;

          // Помеченные руками — считаем что hit-area расширена через ::before
          if (el.dataset.touchOk === 'true') continue;
          // Внутри элемента-с-touchOk
          if (el.closest('[data-touch-ok="true"]')) continue;

          if (rect.width < 44 || rect.height < 44) {
            violations.push({
              tag: el.tagName,
              text: (el.textContent ?? '').trim().slice(0, 40),
              w: Math.round(rect.width),
              h: Math.round(rect.height),
            });
          }
        }

        return violations;
      });

      expect(
        tooSmall,
        `${path}: ${tooSmall.length} элементов меньше 44×44.\n` +
          tooSmall
            .slice(0, 10)
            .map((v) => `  ${v.tag} "${v.text}" — ${v.w}×${v.h}`)
            .join('\n'),
      ).toEqual([]);
    });
  }
});
