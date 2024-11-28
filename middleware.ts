import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // If user is not logged in, redirect to login
    if (!req.nextauth.token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    '/CommonDashboard/:path*',
    '/TeachersDashboard/:path*',
    // Add other protected routes here
  ],
}; 