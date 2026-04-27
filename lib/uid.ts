/**
 * Безопасный генератор уникальных идентификаторов для клиентских ключей React,
 * черновиков форм, временных id и т.п.
 *
 * crypto.randomUUID() доступен только в secure context (https/localhost).
 * В http не-localhost окружениях (preview-среды, локальная сеть на IP)
 * вызов падает с TypeError. Поэтому — fallback через Date+Math.random.
 *
 * Не использовать для cuid'ов БД или security-критичных токенов — там нужны
 * настоящие криптостойкие источники (см. crypto.randomBytes в API-роутах).
 */
export function uid(): string {
  if (typeof globalThis.crypto !== 'undefined' && typeof globalThis.crypto.randomUUID === 'function') {
    try {
      return globalThis.crypto.randomUUID();
    } catch {
      // секурный context отказал — падаем на fallback
    }
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;
}
