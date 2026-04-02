import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/auth";

export async function middleware(request: NextRequest) {
    const sessionCookie = request.cookies.get("session")?.value;
    const session = sessionCookie ? await decrypt(sessionCookie) : null;

    const { pathname } = request.nextUrl;

    // 1. Protect Admin Routes
    if (pathname.startsWith("/admin")) {
        if (!session || session.role !== "admin") {
            return NextResponse.redirect(new URL("/login", request.url));
        }
    }

    // 2. Protect User Dashboard Routes
    if (pathname.startsWith("/dashboard") || pathname.startsWith("/register-conference")) {
        if (!session) {
            return NextResponse.redirect(new URL("/login", request.url));
        }
    }

    // 3. Protect Reviewer Routes
    if (pathname.startsWith("/reviewer")) {
        if (!session) {
            return NextResponse.redirect(new URL("/login", request.url));
        }
        if (!["reviewer", "admin", "chair"].includes(session.role)) {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }
    }

    // 4. Redirect authenticated users away from login/register
    if ((pathname === "/login" || pathname === "/register") && session) {
        if (session.role === "admin") {
            return NextResponse.redirect(new URL("/admin", request.url));
        }
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/admin/:path*",
        "/dashboard/:path*",
        "/register-conference/:path*",
        "/reviewer/:path*",
        "/login",
        "/register",
    ],
};
