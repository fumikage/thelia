import getLocale from '@utils/getLocale';
let fn: Intl.NumberFormat | null = null;

export default function priceFormat(price: any, options: any = {}) {
  const locale = options.locale || getLocale();
  const currency = options.currency || (global as any).DEFAULT_CURRENCY_CODE;
  if (typeof price !== 'number' || !locale || !currency) return '0 €';

  if (isNaN(price)) return '0 €';

  if (!fn) {
    fn = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    });
  }

  return fn.format(price) as any;
}