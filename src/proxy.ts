import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: [
    // Match all pathnames except next internals and static files
    '/((?!_next|api|favicon\\.ico|.*\\..*).*)',
  ],
};
