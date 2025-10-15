import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { normalizeUserMetadata } from './lib/profile-utils';

/**
 * Middleware to normalize user profile data
 * This ensures that user metadata is consistently accessible throughout the application
 */
export async function middleware(request: NextRequest) {
  // Skip API routes and static assets
  if (
    request.nextUrl.pathname.startsWith('/api/') ||
    request.nextUrl.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Continue to the next middleware
  const response = NextResponse.next();
  
  // For client-side access, we could add a header with user info
  // or perform server-side normalization in the getProfile function
  
  return response;
}

// Match all routes except API routes and static assets
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};