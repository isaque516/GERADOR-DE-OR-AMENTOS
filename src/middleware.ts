import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Middleware para proteção de rotas (conceitual para SPA)
export function middleware(request: NextRequest) {
  // Em uma SPA, a proteção é feita no cliente
  // Este middleware serve como documentação da arquitetura
  
  const { pathname } = request.nextUrl;
  
  // Rotas públicas
  const publicRoutes = ['/login', '/api/auth/login'];
  
  // Se for rota pública, permitir acesso
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }
  
  // Para SPA, sempre permitir acesso (proteção é no cliente)
  return NextResponse.next();
}

// Configurar quais rotas o middleware deve processar
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - icon.svg (icon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|icon.svg).*)',
  ],
};