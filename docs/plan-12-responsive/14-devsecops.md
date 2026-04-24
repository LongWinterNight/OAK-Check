# 14 — DevSecOps / Security Engineer

## Цель

Убедиться, что PWA-работы и мобильные сценарии не создают security-регрессий.

## Контекст

Plan 01 уже закрыл: brute-force protection, invite tokens, audit log, session typing. Здесь — не повторяем, а дополняем под мобилу/PWA.

## Задачи

### 1. CSP при подключении manifest и иконок

- [ ] Проверить текущий `Content-Security-Policy` в [middleware proxy.ts](../../proxy.ts) или в Next.js config
- [ ] Убедиться, что `manifest-src 'self'` разрешает `/manifest.webmanifest`
- [ ] `img-src` покрывает новые пути `/icons/*`
- [ ] Если нет CSP — это отдельный багрепорт (не Plan 12, но приоритетный)

### 2. HTTPS / HSTS

PWA работает только на HTTPS (исключение — localhost). Проверить:
- [ ] В prod — HSTS заголовок присутствует (`Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`)
- [ ] Нет mixed-content (http-ресурсов на https-странице)

### 3. Viewport meta и UI-redress

`viewport-fit: cover` пускает контент под safe-area. Убедиться, что никакие sensitive-элементы (кнопка submit платежа и т.п. — у нас нет, но вдруг) не могут быть перекрыты системным UI. У нас — скорее всего OK, просто проверка.

### 4. Session/cookies на мобиле (iOS ITP)

Safari ITP удаляет cookies через 7 дней неактивности. Для session:
- [ ] JWT cookie — `SameSite=Lax`, `Secure`, `HttpOnly`
- [ ] Refresh-token rotation — не зависит от localStorage (не хранить refresh там)
- [ ] Проверить, что повторный логин после 7 дней на iPhone проходит без странных багов (redirect loop, «нет cookie»)

### 5. Capabilities для PWA

Если позже включим Service Worker:
- `self-origin fetches only` — без cross-origin
- Push API требует `user gesture` + permission prompt — нужен UI-flow согласия

Сейчас — **не подключаем SW**, но фиксируем правило на будущее.

### 6. File upload на мобиле

- [ ] Валидация на сервере MIME/size работает одинаково для mobile/desktop (уже должно быть, просто подтвердить)
- [ ] `<input capture>` не обходит серверную проверку (клиентская валидация — не security контроль)

### 7. Dependency audit перед релизом

- [ ] `npm audit --production` чист
- [ ] Если добавим `workbox`/`web-vitals`/DnD библиотеку — прогнать отдельно

## Headers чеклист (финальный, на прод)

```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(self), microphone=(), geolocation=()
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self'; manifest-src 'self'; frame-ancestors 'none';
X-Frame-Options: DENY
```

`camera=(self)` — для UploadSheet camera-capture. Если реально не нужен — убрать.

## Задачи

- [ ] Ревью текущих security headers (выяснить baseline)
- [ ] Обновить CSP под `manifest-src 'self'` и иконки (если добавили PWA Mobile 08)
- [ ] Ревизия cookie-флагов на session JWT
- [ ] Smoke-тест повторного входа на iPhone через 8 дней (симуляция через `expires=+8d`)
- [ ] `npm audit` финальный перед релизом
