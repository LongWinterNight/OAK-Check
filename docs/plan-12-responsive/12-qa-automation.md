# 12 — QA Automation Engineer

## Цель

Автоматизировать проверку адаптивности, чтобы после Plan 12 никакие новые изменения не ломали mobile/tablet.

## Инфраструктура

Текущее состояние тестов в проекте — проверить наличие Playwright/Jest/Cypress:

- [ ] Проверить [package.json](../../package.json) — есть ли `playwright`, `@playwright/test`?
  - Если нет → установить: `npm i -D @playwright/test` + `npx playwright install`
  - Если есть — смотрим существующие конфиги

## Responsive test suite

### 1. Viewports matrix

В `playwright.config.ts` определить projects:

```ts
{ name: 'mobile',  use: { ...devices['iPhone 13'] } },          // ~390×844
{ name: 'mobile-small', use: { viewport: { width: 360, height: 640 }, isMobile: true, hasTouch: true } },
{ name: 'tablet', use: { ...devices['iPad (gen 7)'] } },        // ~810×1080
{ name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
```

### 2. Smoke тесты на все ключевые страницы

Для каждого viewport прогнать один тест `no-horizontal-scroll.spec.ts`:

```ts
test.describe('no horizontal scroll', () => {
  const urls = ['/dashboard', '/projects', '/kanban', '/library', '/activity', '/settings', '/tasks'];
  for (const url of urls) {
    test(`${url} fits viewport`, async ({ page }) => {
      await page.goto(url);
      const hasHScroll = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
      expect(hasHScroll).toBe(false);
    });
  }
});
```

### 3. Interaction тесты (критические flows)

**ARTIST-flow на мобиле:**
- [ ] Логин → dashboard → открыть шот → отметить пункт чеклиста → оставить комментарий → выйти
- Тест: `e2e/artist-mobile.spec.ts`, viewport mobile

**LEAD-flow на планшете:**
- [ ] Логин → kanban → перетащить шот в другую колонку (touch DnD) → назначить исполнителя
- Тест: `e2e/lead-tablet.spec.ts`, viewport tablet

**QA-flow на планшете:**
- [ ] Ревью → открыть шот → изменить статус → комментарий с пином на рендере
- Тест: `e2e/qa-tablet.spec.ts`, viewport tablet

### 4. Visual regression

Вариант А — встроенный `toHaveScreenshot`:
- [ ] `screenshot` для каждого key-URL на каждом viewport → коммитить baseline в репо
- Недостаток — шумит на антиалиасинге шрифтов

Вариант Б — Percy / Chromatic (внешний сервис):
- Не берём — лишняя зависимость для текущего этапа

**Решение:** встроенный, но прогоняем только на CI Linux (чтобы baseline стабильный). `maxDiffPixelRatio: 0.02`.

- [ ] `e2e/visual/*.spec.ts` для `/dashboard`, `/projects`, `/kanban`, `/library` × 3 viewport

### 5. Touch target audit

Один тест, который по всем кнопкам/линкам на странице проверяет `getBoundingClientRect().width >= 44 && .height >= 44` на mobile viewport.

- [ ] `e2e/accessibility/touch-targets.spec.ts`

## CI интеграция

- [ ] Добавить в GitHub Actions шаг `npx playwright test` с прогоном всех viewport projects
- [ ] Отдельный шаг для visual regression (чтобы сбои визуалки не блокировали основные тесты)
- [ ] Upload `test-results/` как artifact при фейлах

## Задачи

- [ ] Проверить наличие Playwright, установить если нет
- [ ] Написать `no-horizontal-scroll.spec.ts` (самый быстрый win, ловит большую часть регрессий адаптива)
- [ ] `artist-mobile.spec.ts` — критический happy path
- [ ] `lead-tablet.spec.ts` — touch DnD на канбане
- [ ] Touch-targets audit тест
- [ ] Visual regression baseline (после того как Frontend 06 закроет Milestone B)
- [ ] CI-интеграция
