"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { useAuthStore } from "@/lib/store/authStore";

export function useRoleValidation() {
  const searchParams = useSearchParams();
  const { user } = useAuthStore();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const expectedRole = localStorage.getItem("expected_login_role");

    if (expectedRole && user) {
      const actualRole = user.getRole();

      if (expectedRole !== actualRole) {
        toast.error(
          `This account is registered as ${actualRole}. You've been redirected to the ${actualRole} dashboard.`,
          { duration: 5000 }
        );
      }

      // Clear the expected role
      localStorage.removeItem("expected_login_role");
    }
  }, [user, searchParams]);
}
