import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  console.log("[OAUTH CALLBACK] Incoming:", request.url);
  console.log("[OAUTH CALLBACK] Cookies:", request.cookies.getAll());
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  console.log("[OAUTH CALLBACK] code param:", code);

  if (code) {
    // Store cookies that get set during auth exchange
    const cookiesToSet: Array<{
      name: string;
      value: string;
      options: CookieOptions;
    }> = [];

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookiesToSet.push({ name, value, options });
          },
          remove(name: string, options: CookieOptions) {
            cookiesToSet.push({ name, value: "", options });
          },
        },
      }
    );

    // Exchange code for session
    const result = await supabase.auth.exchangeCodeForSession(code);
    console.log("[OAUTH CALLBACK] exchangeCodeForSession result:", result);
    const { error } = result;

    if (!error) {
      // Get user and profile to determine redirect
      const {
        data: { user },
      } = await supabase.auth.getUser();
      console.log("[OAUTH CALLBACK] user:", user);

      if (user) {
        // Check if profile exists
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, full_name")
          .eq("id", user.id)
          .single();
        console.log("[OAUTH CALLBACK] profile:", profile);

        let redirectUrl: string;

        // If profile doesn't exist (new OAuth user)
        if (!profile) {
          const defaultRole = "customer";

          const { error: profileError } = await supabase
            .from("profiles")
            .insert({
              id: user.id,
              email: user.email!,
              full_name:
                user.user_metadata?.full_name ||
                user.user_metadata?.name ||
                user.email?.split("@")[0],
              phone: user.phone || null,
              role: defaultRole,
              is_active: true,
            });
          console.log("[OAUTH CALLBACK] profileError:", profileError);

          if (!profileError) {
            // Create role-specific record
            await supabase.from("customers").insert({ id: user.id });
            redirectUrl = `/dashboard/${defaultRole}`;
          } else {
            redirectUrl = "/login";
          }
        } else if (profile.role) {
          // Existing user - redirect to appropriate dashboard
          redirectUrl = `/dashboard/${profile.role}`;
        } else {
          redirectUrl = "/login";
        }

        // Create redirect response and apply all cookies
        const response = NextResponse.redirect(
          new URL(redirectUrl, requestUrl.origin)
        );

        // Apply all collected cookies to the redirect response
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
        console.log("[OAUTH CALLBACK] redirecting to:", redirectUrl);

        return response;
      }
    }
  }

  // If something went wrong, redirect to login
  console.log("[OAUTH CALLBACK] Something went wrong, redirecting to /login");
  return NextResponse.redirect(new URL("/login", requestUrl.origin));
}
