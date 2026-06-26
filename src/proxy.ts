import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Auth is handled client-side via useAuth() + ClientPage.tsx
// because Supabase JS stores sessions in localStorage, not cookies.
// This proxy only prevents caching issues on the login page.
export function proxy(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}
