// middleware.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";

export function middleware(request: NextRequest) {
  const tokenCookie = request.cookies.get("OurSiteJWT"); // Ensure to use the correct cookie name
  const token = tokenCookie ? tokenCookie.value : null;

  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  try {
    const decoded: any = jwtDecode(token);
    const { username, userSector, exp } = decoded;
    console.log(userSector);

    const { pathname } = new URL(request.url);

    // Perform access control based on user's sector
    if (
      (pathname.startsWith("/dashboards/dashboard-textile") &&
        userSector !== "textile") ||
      (pathname.startsWith("/dashboards/dashboard-verre") &&
        userSector !== "verre") ||
      (pathname.startsWith("/dashboards/dashboard-luxe") &&
        userSector !== "luxe")
    ) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    return NextResponse.next();
  } catch (error) {
    console.log(error);
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }
}

export const config = {
  matcher: ["/dashboards/:path*"],
};
