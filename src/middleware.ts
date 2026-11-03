import { NextRequest, NextResponse } from "next/server";
import { verifyCustomerToken, CUSTOMER_COOKIE } from "@/lib/auth/tokens/customerToken";
import { verifyAdminToken, ADMIN_COOKIE } from "@/lib/auth/tokens/adminToken";
import { verifyDealerToken, DEALER_COOKIE } from "@/lib/auth/tokens/dealerToken";

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // ============================================================================
  // 1. ADMIN DOMAIN ROUTING (/admin/*, /dashboard/*, /api/admin/*)
  // ============================================================================
  if (
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/api/admin")
  ) {
    const adminToken = request.cookies.get(ADMIN_COOKIE)?.value;
    const adminSession = adminToken ? await verifyAdminToken(adminToken) : null;

    // Security Headers for all Admin responses
    const response = NextResponse.next();
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");

    const isAdminLoginRoute = pathname === "/admin" || pathname === "/admin/login";

    // 1a. If admin visits admin login page
    if (isAdminLoginRoute) {
      if (adminSession) {
        const rawRedirect = request.nextUrl.searchParams.get("redirectTo");
        let safeRedirect = "/dashboard";
        if (
          rawRedirect &&
          (rawRedirect.startsWith("/admin") || rawRedirect.startsWith("/dashboard")) &&
          !rawRedirect.startsWith("//")
        ) {
          safeRedirect = rawRedirect;
        }
        return NextResponse.redirect(new URL(safeRedirect, request.url));
      }
      // If unauthenticated or other roles logged in: SHOW ADMIN LOGIN FORM CLEANLY
      return response;
    }

    // 1b. Protected Admin API Routes
    if (pathname.startsWith("/api/admin")) {
      if (pathname.startsWith("/api/admin/auth/")) {
        return NextResponse.next(); // Public auth endpoints (login)
      }
      if (!adminSession) {
        return NextResponse.json(
          { error: "Unauthorized: Valid administrator session required." },
          { status: 401 }
        );
      }
      return NextResponse.next();
    }

    // 1c. Protected Admin Pages (/dashboard/*, /admin/*)
    if (!adminSession) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirectTo", pathname + search);
      return NextResponse.redirect(loginUrl);
    }

    // Attach verified admin identity headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-admin-id", String(adminSession.adminId));
    requestHeaders.set("x-admin-email", adminSession.email);
    requestHeaders.set("x-admin-name", adminSession.name);
    requestHeaders.set("x-admin-role", adminSession.role);
    requestHeaders.set("x-admin-permissions", JSON.stringify(adminSession.permissions));

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
      headers: response.headers,
    });
  }

  // ============================================================================
  // 2. DEALER DOMAIN ROUTING (/dealer/*, /api/dealer/*)
  // ============================================================================
  if (pathname.startsWith("/dealer") || pathname.startsWith("/api/dealer")) {
    const dealerToken = request.cookies.get(DEALER_COOKIE)?.value;
    const dealerSession = dealerToken ? await verifyDealerToken(dealerToken) : null;

    const response = NextResponse.next();
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");

    const isPublicDealerRoute =
      pathname === "/dealer/login" ||
      pathname === "/dealer/register" ||
      pathname === "/dealer/pending" ||
      pathname === "/dealer/rejected" ||
      pathname === "/dealer/suspended";

    // 2a. If dealer visits dealer login or registration
    if (pathname === "/dealer/login" || pathname === "/dealer/register") {
      if (dealerSession) {
        if (dealerSession.approvalStatus === "APPROVED") {
          return NextResponse.redirect(new URL("/dealer", request.url));
        } else if (dealerSession.approvalStatus === "PENDING") {
          return NextResponse.redirect(new URL("/dealer/pending", request.url));
        } else if (dealerSession.approvalStatus === "REJECTED") {
          return NextResponse.redirect(new URL("/dealer/rejected", request.url));
        } else if (dealerSession.approvalStatus === "SUSPENDED") {
          return NextResponse.redirect(new URL("/dealer/suspended", request.url));
        }
      }
      // If unauthenticated or other roles logged in: SHOW DEALER LOGIN FORM CLEANLY
      return response;
    }

    // 2b. Protected Dealer API Routes
    if (pathname.startsWith("/api/dealer")) {
      if (pathname.startsWith("/api/dealer/auth/")) {
        return NextResponse.next();
      }
      if (!dealerSession || dealerSession.approvalStatus !== "APPROVED") {
        return NextResponse.json(
          { error: "Unauthorized: Approved wholesale trade account required." },
          { status: 401 }
        );
      }
      return NextResponse.next();
    }

    // 2c. Gate verification for non-public dealer portal pages
    if (!isPublicDealerRoute) {
      if (!dealerSession) {
        const loginUrl = new URL("/dealer/login", request.url);
        loginUrl.searchParams.set("redirectTo", pathname + search);
        return NextResponse.redirect(loginUrl);
      }
    }

    if (dealerSession) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-dealer-id", String(dealerSession.dealerId));
      requestHeaders.set("x-dealer-email", dealerSession.email);
      requestHeaders.set("x-dealer-company", dealerSession.companyName);
      requestHeaders.set("x-dealer-status", dealerSession.approvalStatus);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
        headers: response.headers,
      });
    }

    return response;
  }

  // ============================================================================
  // 3. CUSTOMER DOMAIN ROUTING (/login, /register, /profile/*, /account/*, /checkout/*)
  // ============================================================================
  const customerToken = request.cookies.get(CUSTOMER_COOKIE)?.value;
  const customerSession = customerToken ? await verifyCustomerToken(customerToken) : null;

  // 3a. Customer Login & Register Pages
  if (pathname === "/login" || pathname === "/register") {
    if (customerSession) {
      const rawRedirect = request.nextUrl.searchParams.get("redirectTo");
      let safeRedirect = "/profile";

      if (
        rawRedirect &&
        rawRedirect.startsWith("/") &&
        !rawRedirect.startsWith("//") &&
        !rawRedirect.startsWith("/admin") &&
        !rawRedirect.startsWith("/dashboard") &&
        !rawRedirect.startsWith("/dealer")
      ) {
        safeRedirect = rawRedirect;
      }
      return NextResponse.redirect(new URL(safeRedirect, request.url));
    }
    // If not a customer (or admin/dealer logged in on another tab): SHOW CUSTOMER LOGIN
    return NextResponse.next();
  }

  // 3b. Protected Customer Storefront Areas (/profile, /account, /checkout)
  if (
    pathname === "/profile" ||
    pathname.startsWith("/profile/") ||
    pathname === "/account" ||
    pathname.startsWith("/account/") ||
    pathname === "/checkout" ||
    pathname.startsWith("/checkout/")
  ) {
    if (!customerSession) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirectTo", pathname + search);
      return NextResponse.redirect(loginUrl);
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-customer-id", String(customerSession.customerId));
    requestHeaders.set("x-customer-email", customerSession.email);
    requestHeaders.set("x-customer-name", customerSession.name);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/dashboard",
    "/dashboard/:path*",
    "/api/admin/:path*",
    "/dealer",
    "/dealer/:path*",
    "/api/dealer/:path*",
    "/login",
    "/register",
    "/profile",
    "/profile/:path*",
    "/account",
    "/account/:path*",
    "/checkout",
    "/checkout/:path*",
  ],
};
