import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const role = request.cookies.get('userRole')?.value;

  // Protegemos todas las rutas que comiencen con /dashboard
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!role) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Si ya tiene sesión, no dejarlo entrar a la página de login (raíz)
  if (request.nextUrl.pathname === '/') {
    if (role) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/'],
};
