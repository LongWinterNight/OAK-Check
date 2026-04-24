# 08 — Mobile Developer

OAK·Check — web-приложение. Mobile-роль фокусируется на PWA-слое и мобильных UX-паттернах, а не на native.

## PWA-installable

### 1. Web App Manifest

- [ ] Создать `public/manifest.webmanifest`:
  ```json
  {
    "name": "OAK·Check",
    "short_name": "OAK·Check",
    "start_url": "/",
    "scope": "/",
    "display": "standalone",
    "orientation": "any",
    "background_color": "#F7F4EE",
    "theme_color": "#8C5E1E",
    "icons": [
      { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
      { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
      { "src": "/icons/maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
    ]
  }
  ```
- [ ] Иконки 192/512 + maskable в `public/icons/` (брать дубовый логотип из брендинга)
- [ ] Линк в `app/layout.tsx` (или через `metadata.manifest`) на manifest

### 2. Theme color / браузерный UI

- [ ] В `<head>` добавить `<meta name="theme-color" content="#8C5E1E" media="(prefers-color-scheme: light)">`
- [ ] То же для dark: `content="#16140F" media="(prefers-color-scheme: dark)"`

### 3. Viewport meta

- [ ] Проверить, что в `app/layout.tsx` прописан:
  ```tsx
  export const viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    viewportFit: 'cover',
  };
  ```
  `viewport-fit: cover` — обязательно для safe-area на iPhone с вырезом.

### 4. iOS Safari специфика

- [ ] `<meta name="apple-mobile-web-app-capable" content="yes">` для standalone режима
- [ ] `<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">` (180×180)
- [ ] `apple-mobile-web-app-status-bar-style` — `black-translucent` для прозрачного статус-бара под content

## Safe-area

### 5. Глобальные insets

- [ ] В [globals.css](../../app/globals.css) — убедиться что `body` учитывает safe-area, или явно прописать на root `app/(app)/layout.tsx` контейнере
- [ ] `BottomNav` — `padding-bottom: max(var(--spacing-3), env(safe-area-inset-bottom))`
- [ ] Full-screen модалки / sheets — inset-top (для notch) + inset-bottom (для home-indicator)
- [ ] Sticky input в `CommentsPanel` — `padding-bottom: env(safe-area-inset-bottom)`

## Мобильные UX-паттерны

### 6. Touch gestures (minimal viable)

- [ ] `touch-action: manipulation` на всех кликабельных → убирает 300ms delay (уже правило от EM 03, просто проверить применение)
- [ ] Horizontal swipe между колонками Kanban (см. Frontend 06 — через scroll-snap, не custom gestures)
- [ ] `overscroll-behavior: contain` на скрольных контейнерах внутри модалок (чтобы свайп не прокручивал подлежащую страницу)

### 7. Keyboard handling

- [ ] Input в `CommentsPanel` — при фокусе на мобиле scroll-to-view (полифилл для старого iOS)
- [ ] `VirtualKeyboard API` не используем — достаточно `visualViewport` observer если появится кейс
- [ ] Input с `font-size: 16px` на мобиле (правило Frontend 06) чтобы iOS не зумил

### 8. Ориентация

- [ ] Landscape не ломает layout — проверить на 667×375 (iPhone SE landscape). Если ломается — media query `(max-height: 500px)` отдельно.

## Офлайн (вне Plan 12, заметка)

Офлайн-режим требует Service Worker с кешем и sync-queue. Это Plan 13. **Сейчас не делаем**, но manifest должен быть готов к добавлению SW.

## Задачи

- [ ] Manifest + иконки (п.1, 2)
- [ ] Viewport / iOS meta (п.3, 4)
- [ ] Safe-area insets применить системно (п.5)
- [ ] Swipe-colonn в Kanban — стыковка с Frontend (п.6, координация с 06)
- [ ] Landscape smoke-проверка (п.8)
