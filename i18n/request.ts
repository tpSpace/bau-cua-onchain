import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';

// Can be imported from a shared config
export const locales = ['en', 'vi'] as const;

export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is valid
  console.log('i18n request config - locale:', locale);
  
  if (!locale || !locales.includes(locale as any)) {
    console.log('Invalid locale, using default: vi');
    locale = 'vi';
  }

  return {
    messages: (await import(`../messages/${locale}.json`)).default,
    locale
  };
});
