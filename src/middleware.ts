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

      const isStaff =
        session.role === "admin" ||
        session.role === "editor" ||
        session.role === "manager";

      if (isStaff) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }

      if (
        redirectUrl &&
        redirectUrl.startsWith("/") &&
        !redirectUrl.startsWith("//") &&
        !redirectUrl.startsWith("/dashboard")
      ) {
        return NextResponse.redirect(new URL(redirectUrl, request.url));
      }

      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // 1.5. Admin Gateway Route: /admin (Dedicated Admin Login Form)
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
    // Let unauthenticated or non-staff users view /admin directly (renders AdminLoginForm)
    return NextResponse.next();
  }

  // 2. Protected Admin Dashboard Routes - STRICT AUTHORIZATION (NO PUBLIC / CUSTOMER ACCESS)
  if (pathname.startsWith("/dashboard")) {
    if (!session) {
      const adminLoginUrl = new URL("/admin", request.url);
      adminLoginUrl.searchParams.set("redirectTo", pathname + search);
      adminLoginUrl.searchParams.set("reason", "admin_login_required");
      return NextResponse.redirect(adminLoginUrl);
    }

    // Disallow regular customers or unauthorized roles from accessing admin dashboard
    const isStaff =
      session.role === "admin" ||
      session.role === "editor" ||
      session.role === "manager";

    if (!isStaff) {
      const adminLoginUrl = new URL("/admin", request.url);
      adminLoginUrl.searchParams.set("redirectTo", pathname + search);
      adminLoginUrl.searchParams.set("error", "admin_required");
      return NextResponse.redirect(adminLoginUrl);
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

  // 3.5 Protected Dealer Portal Routes
  if (pathname.startsWith("/dealer")) {
    // Prevent search engine indexing of dealer portal
    const response = NextResponse.next();
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");

    const isPublicDealerRoute = 
      pathname === "/dealer/login" || 
      pathname === "/dealer/register" || 
      pathname === "/dealer/pending" || 
      pathname === "/dealer/rejected" || 
      pathname === "/dealer/suspended";

    if (!session) {
      if (!isPublicDealerRoute) {
        const loginUrl = new URL("/dealer/login", request.url);
        loginUrl.searchParams.set("redirectTo", pathname + search);
        return NextResponse.redirect(loginUrl);
      }
      return response;
    }

    // If authenticated user is NOT a dealer (e.g. regular customer)
    if (session.role !== "dealer" && session.role !== "admin") {
      if (!isPublicDealerRoute) {
        const regUrl = new URL("/dealer/register", request.url);
        regUrl.searchParams.set("error", "dealer_account_required");
        return NextResponse.redirect(regUrl);
      }
      return response;
    }

    // If authenticated dealer visits login or register, redirect them
    if (pathname === "/dealer/login" || pathname === "/dealer/register") {
      if (session.dealerStatus === "APPROVED" || session.role === "admin") {
        return NextResponse.redirect(new URL("/dealer", request.url));
      } else if (session.dealerStatus === "PENDING") {
        return NextResponse.redirect(new URL("/dealer/pending", request.url));
      } else if (session.dealerStatus === "REJECTED") {
        return NextResponse.redirect(new URL("/dealer/rejected", request.url));
      } else if (session.dealerStatus === "SUSPENDED") {
        return NextResponse.redirect(new URL("/dealer/suspended", request.url));
      }
    }

    // For protected dealer routes, check dealerStatus
    if (!isPublicDealerRoute && session.role === "dealer") {
      if (session.dealerStatus === "PENDING") {
        return NextResponse.redirect(new URL("/dealer/pending", request.url));
      }
      if (session.dealerStatus === "REJECTED") {
        return NextResponse.redirect(new URL("/dealer/rejected", request.url));
      }
      if (session.dealerStatus === "SUSPENDED") {
        return NextResponse.redirect(new URL("/dealer/suspended", request.url));
      }
    }

    return response;
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
    "/admin",
    "/admin/:path*",
    "/dashboard/:path*",
    "/checkout/:path*",
    "/checkout",
    "/dealer/:path*",
    "/dealer",
    "/login",
    "/register",
    "/api/uploads",
    "/api/admin/:path*",
  ],
};
