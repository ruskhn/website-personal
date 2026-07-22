import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if pathname is not all lowercase
  if (pathname !== pathname.toLowerCase()) {
    const url = request.nextUrl.clone()
    url.pathname = pathname.toLowerCase() // Convert to lowercase
    return NextResponse.redirect(url)
  }

  // Continue with the request if it's already lowercase
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api, Next internals, favicon
     * - static file extensions (pdf, images, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:pdf|svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
}
