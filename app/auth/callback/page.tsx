"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/store/authStore";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    async function finish() {

      // Finalize OAuth session
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login");
        return;
      }

      // Fetch user role
      const user = useAuthStore.getState().user;

      if (user) {
        router.replace(`/${user.getRole()}/dashboard`);
      } else {
        router.replace("/auth/complete-profile");
      }
    }

    finish();
  }, []);

  return <p className="text-center mt-10">Finalizing login...</p>;
}
