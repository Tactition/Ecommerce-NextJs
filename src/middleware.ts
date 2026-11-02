import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, COOKIE_NAME } from "@/lib/token";
import { hasPermission, RBAC_MODULE_IDS } from "@/types/rbac";

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  // 1. If user is already authenticated and visits /login or /register
  if (pathname === "/login" || pathname === "/register") {
    if (session) {
      const redirectUrl = request.nextUrl.searchParams.get("redirectTo");
      const hasAdminIntent =
        request.nextUrl.searchParams.get("error") === "admin_required" ||
        redirectUrl?.startsWith("/dashboard");

      const isStaff =
        session.role === "admin" ||
        session.role === "editor" ||
        session.role === "manager";

      // If user is a customer wanting to sign in as admin, let them access /login
      if (!isStaff && hasAdminIntent) {
        return NextResponse.next();
      }

      if (
        redirectUrl &&
        redirectUrl.startsWith("/") &&
        !redirectUrl.startsWith("//") &&
        (!redirectUrl.startsWith("/dashboard") || isStaff)
      ) {
        return NextResponse.redirect(new URL(redirectUrl, request.url));
      }

      return NextResponse.redirect(
        new URL(isStaff ? "/dashboard" : "/", request.url)
      );
    }
    return NextResponse.next();
  }

  // 1.5. Convenience Admin Gateway Route
  if (pathname === "/admin" || pathname === "/admin/") {
    if (session) {
      const isStaff =
        session.role === "admin" ||
        session.role === "editor" ||
        session.role === "manager";
      if (isStaff) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("tab", "admin");
    loginUrl.searchParams.set("redirectTo", "/dashboard");
    return NextResponse.redirect(loginUrl);
  }

  // 2. Protected Admin Dashboard Routes - STRICT AUTHORIZATION (NO PUBLIC / CUSTOMER ACCESS)
  if (pathname.startsWith("/dashboard")) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("tab", "admin");
      loginUrl.searchParams.set("redirectTo", pathname + search);
      loginUrl.searchParams.set("reason", "admin_login_required");
      return NextResponse.redirect(loginUrl);
    }

    // Disallow regular customers or unauthorized roles from accessing admin dashboard
    const isStaff =
      session.role === "admin" ||
      session.role === "editor" ||
      session.role === "manager";

    if (!isStaff) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("tab", "admin");
      loginUrl.searchParams.set("redirectTo", pathname + search);
      loginUrl.searchParams.set("error", "admin_required");
      return NextResponse.redirect(loginUrl);
    }

    // Dynamic RBAC module access check:
    const pathParts = pathname.split("/").filter(Boolean);
    const requestedModule = pathParts[1]; // e.g. "products", "settings", "roles", "users"

    if (requestedModule && RBAC_MODULE_IDS.includes(requestedModule)) {
      const isSuperAdmin = session.role === "admin";
      const canAccessModule =
        isSuperAdmin || hasPermission(session.permissions, requestedModule, "view");

      if (!canAccessModule) {
        const deniedUrl = new URL("/dashboard", request.url);
        deniedUrl.searchParams.set("unauthorized", requestedModule);
        return NextResponse.redirect(deniedUrl);
      }
    }

    // Attach verified user identity headers for downstream server components
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", String(session.userId));
    requestHeaders.set("x-user-email", session.email);
    requestHeaders.set("x-user-name", session.name);
    requestHeaders.set("x-user-role", session.role);
    if (session.permissions) {
      requestHeaders.set("x-user-permissions", JSON.stringify(session.permissions));
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // 3. Protected Customer Checkout Flow (Must be logged in to purchase products)
  if (pathname === "/checkout" || pathname.startsWith("/checkout/")) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirectTo", "/checkout");
      loginUrl.searchParams.set("reason", "checkout_login_required");
      return NextResponse.redirect(loginUrl);
    }
  }

  // 4. Protected API Routes
  if (pathname.startsWith("/api/uploads") || pathname.startsWith("/api/admin")) {
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized: Please sign in to access this API." },
        { status: 401 }
      );
    }

    if (pathname.startsWith("/api/admin") && session.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Administrator role required." },
        { status: 403 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/checkout/:path*",
    "/checkout",
    "/login",
    "/register",
    "/api/uploads",
    "/api/admin/:path*",
  ],
};
