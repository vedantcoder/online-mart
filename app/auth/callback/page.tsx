"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

type UserRole = "customer" | "retailer" | "wholesaler" | "delivery";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the auth session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;
        if (!session) {
          toast.error("Authentication failed");
          router.push("/login");
          return;
        }

        // Check if user already has a complete profile with role
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, phone")
          .eq("id", session.user.id)
          .single();

        // If profile exists with role and phone, user is fully registered
        if (profile?.role && profile?.phone) {
          // Verify role-specific data exists
          let roleDataExists = false;

          switch (profile.role) {
            case "customer":
              const { data: customer } = await supabase
                .from("customers")
                .select("id")
                .eq("id", session.user.id)
                .single();
              roleDataExists = !!customer;
              break;
            case "retailer":
              const { data: retailer } = await supabase
                .from("retailers")
                .select("id")
                .eq("id", session.user.id)
                .single();
              roleDataExists = !!retailer;
              break;
            case "wholesaler":
              const { data: wholesaler } = await supabase
                .from("wholesalers")
                .select("id")
                .eq("id", session.user.id)
                .single();
              roleDataExists = !!wholesaler;
              break;
            case "delivery":
              const { data: delivery } = await supabase
                .from("delivery_persons")
                .select("id")
                .eq("id", session.user.id)
                .single();
              roleDataExists = !!delivery;
              break;
          }

          if (roleDataExists) {
            // User is fully registered, redirect to their dashboard
            toast.success("Welcome back!");
            router.push(`/${profile.role}/dashboard`);
            return;
          }
        }

        // User needs to complete profile
        // Check if there's a pending role from registration flow
        const pendingRole = localStorage.getItem(
          "pending_role"
        ) as UserRole | null;

        if (pendingRole) {
          // Redirect to complete profile page with role
          localStorage.removeItem("pending_role");
          router.push(`/auth/complete-profile?role=${pendingRole}`);
        } else {
          // No role info, redirect to role selection
          router.push("/auth/complete-profile");
        }
      } catch (error) {
        console.error("Callback error:", error);
        toast.error("Authentication failed. Please try again.");
        router.push("/login");
      } finally {
        setIsProcessing(false);
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {isProcessing ? "Completing sign in..." : "Redirecting..."}
        </h2>
        <p className="text-gray-600">
          Please wait while we set up your account
        </p>
      </div>
    </div>
  );
}
