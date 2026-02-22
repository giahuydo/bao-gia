export const DEFAULT_CURRENCY_CODE = 'VND';

export const CURRENCY_CODES = {
  VND: 'VND',
  USD: 'USD',
  EUR: 'EUR',
  JPY: 'JPY',
} as const;

export type CurrencyCode = (typeof CURRENCY_CODES)[keyof typeof CURRENCY_CODES];
