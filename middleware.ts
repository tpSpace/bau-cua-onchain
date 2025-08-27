import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'vi'],
  defaultLocale: 'en',
  localePrefix: 'always',
  // Force default to 'en' regardless of the browser's Accept-Language
  localeDetection: false
});

export const config = {
  matcher: ["/((?!_next|api).*)"],
};
