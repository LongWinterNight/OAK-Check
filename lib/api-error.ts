import { NextResponse } from 'next/server';

export type ApiErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'CONFLICT'
  | 'GONE'
  | 'SERVER_ERROR'
  | 'LOCKED'
  | 'RATE_LIMIT'
  | 'UNPROCESSABLE';

const STATUS: Record<ApiErrorCode, number> = {
  UNAUTHORIZED:     401,
  FORBIDDEN:        403,
  NOT_FOUND:        404,
  VALIDATION_ERROR: 400,
  CONFLICT:         409,
  GONE:             410,
  SERVER_ERROR:     500,
  LOCKED:           423,
  RATE_LIMIT:       429,
  UNPROCESSABLE:    422,
};

const MESSAGES: Record<ApiErrorCode, string> = {
  UNAUTHORIZED:     'Не авторизован',
  FORBIDDEN:        'Нет доступа',
  NOT_FOUND:        'Не найдено',
  VALIDATION_ERROR: 'Ошибка валидации',
  CONFLICT:         'Конфликт данных',
  GONE:             'Ресурс недоступен',
  SERVER_ERROR:     'Ошибка сервера',
  LOCKED:           'Аккаунт заблокирован',
  RATE_LIMIT:       'Слишком много запросов',
  UNPROCESSABLE:    'Невозможно обработать запрос',
};

export function apiError(code: ApiErrorCode, detail?: string): NextResponse {
  return NextResponse.json(
    { error: code, message: MESSAGES[code], ...(detail ? { detail } : {}) },
    { status: STATUS[code] }
  );
}
