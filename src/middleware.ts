import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";

export function middleware(request: NextRequest) {
  const tokenCookie = request.cookies.get("OurSiteJWT");
  const token = tokenCookie ? tokenCookie.value : null;

  if (!token) {
    console.log("No token found, redirecting to login");
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  try {
    const decoded: any = jwtDecode(token);
    console.log("Decoded JWT:", decoded); // ✅ Log decoded token

    const { username, userSector } = decoded;
    console.log("User Sector from token:", userSector); // ✅ Ensure userSector is correct

    const { pathname } = new URL(request.url);

    const sectorPaths: Record<string, string> = {
      textile: "/dashboards/dashboard-textile",
      verre: "/dashboards/dashboard-verre",
      luxe: "/dashboards/dashboard-luxe",
      coutellerie: "/dashboards/dashboard-coutellerie",
    };

    // ✅ Log path and expected sector
    console.log("Requested Path:", pathname);
    console.log("Expected Sector for this path:", Object.entries(sectorPaths).find(([_, path]) => pathname.startsWith(path)));

    for (const [sector, path] of Object.entries(sectorPaths)) {
      if (pathname.startsWith(path) && userSector !== sector) {
        console.log(`Unauthorized: User with sector "${userSector}" tried to access "${pathname}"`);
        return new NextResponse("Unauthorized", { status: 401 });
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error("JWT decoding error:", error);
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }
}

export const config = {
  matcher: ["/dashboards/:path*"],
};
