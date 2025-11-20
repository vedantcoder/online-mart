"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/store/authStore";
import { AuthService } from "@/lib/services/AuthService";
import toast from "react-hot-toast";

export default function AuthCallback() {
  const router = useRouter();
  const { initialize } = useAuthStore();

  useEffect(() => {
    async function handleAuthCallback() {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        toast.error("Authentication failed. Please try again.");
        router.replace("/login");
        return;
      }

      try {
        // Attempt to get the full user profile
        const user = await AuthService.getCurrentUser();

        // If successful, the profile exists. Initialize the store and redirect to dashboard.
        await initialize();
        toast.success(`Welcome back, ${user.fullName}!`);

        router.replace(`/${user.getRole()}/dashboard`);
      } catch (error: any) {
        // If getting the user fails, it's likely a new user without a profile.
        // The most common error here is "Profile not found".
        console.log("Callback error, assuming new user:", error.message);
        if (error.message.includes("Profile not found")) {
          // This is a new registration via OAuth
          router.replace("/auth/complete-profile");
        } else {
          // Another unexpected error occurred
          toast.error("An error occurred. Please try logging in again.");
          router.replace("/login");
        }
      }
    }

    handleAuthCallback();
  }, [router, initialize]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="ml-4 text-gray-600">Finalizing login, please wait...</p>
    </div>
  );
}
