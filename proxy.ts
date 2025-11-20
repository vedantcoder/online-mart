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

  const path = request.nextUrl.pathname;

  // Allow home page explicitly
  if (path === "/") {
    return response;
  }

  // Define public and auth routes
  const authRoutes = ["/login", "/register"];
  const publicRoutes = [
    "/auth/callback",
    "/auth/complete-profile",
    ...authRoutes,
  ];

  const isAuthRoute = authRoutes.some((route) => path.startsWith(route));
  const isPublicRoute = publicRoutes.some((route) => path.startsWith(route));

  // 1. Protect all routes: If no user and not a public route, redirect to login
  if (!user && !isPublicRoute) {
    console.log("[PROXY] Protected route, no user. Redirecting to /login");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 2. Redirect authenticated users away from auth pages (login/register)
  if (user && isAuthRoute) {
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
    } else {
      // Fallback if no role found (e.g. new user not fully set up)
      // Maybe redirect to complete-profile or just let them be?
      // For now, let's redirect to a generic dashboard or home if role is missing,
      // or just allow them to proceed (which might be weird if they are on /login).
      // If they are on /login and have no role, maybe they need to complete profile.
      // But let's stick to the existing logic which redirects if role exists.
    }
  }

  console.log("[PROXY] Allowing request to proceed:", path);
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
