import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  console.log("[PROXY] Incoming:", request.nextUrl.pathname);
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  console.log("[PROXY] user:", user?.id, "role:", user?.role);

  // Protected routes
  const protectedRoutes = [
    "/customer/dashboard",
    "/retailer/dashboard",
    "/wholesaler/dashboard",
    "/delivery/dashboard",
  ];
  const authRoutes = ["/login", "/register"];
  const publicAuthRoutes = ["/auth/callback", "/auth/complete-profile"];

  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );
  const isPublicAuthRoute = publicAuthRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  // Allow public auth routes without redirection
  if (isPublicAuthRoute) {
    console.log(
      "[PROXY] Public auth route, allowing:",
      request.nextUrl.pathname
    );
    return response;
  }

  // Redirect to login if accessing protected route without auth
  // TEMPORARILY DISABLED FOR DEBUGGING
  // if (isProtectedRoute && !user) {
  //   console.log("[PROXY] Protected route, no user. Redirecting to /login");
  //   return NextResponse.redirect(new URL("/login", request.url));
  // }

  // Redirect to dashboard if accessing auth routes while logged in
  if (isAuthRoute && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    console.log("[PROXY] Auth route, user present. Profile:", profile);

    if (profile?.role) {
      console.log(
        "[PROXY] Redirecting to dashboard:",
        `/${profile.role}/dashboard`
      );
      return NextResponse.redirect(
        new URL(`/${profile.role}/dashboard`, request.url)
      );
    }
  }

  console.log("[PROXY] Allowing request to proceed:", request.nextUrl.pathname);
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
