"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/store/authStore";
import toast from "react-hot-toast";
import { Loader2, ArrowLeft, Phone } from "lucide-react";

export default function PhoneLoginPage() {
  const router = useRouter();
  const { initialize } = useAuthStore();

  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone) {
      toast.error("Please enter your phone number");
      return;
    }

    // Validate phone format (basic validation)
    const phoneRegex = /^\+?[1-9]\d{9,14}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ""))) {
      toast.error(
        "Please enter a valid phone number with country code (e.g., +91 9876543210)"
      );
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phone.replace(/\s/g, ""),
      });

      if (error) throw error;

      toast.success("OTP sent to your phone!");
      setStep("otp");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to send OTP";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      toast.error("Please enter the 6-digit OTP");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: phone.replace(/\s/g, ""),
        token: otp,
        type: "sms",
      });

      if (error) throw error;
      if (!data.user) throw new Error("Verification failed");

      // Check if user has complete profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, phone")
        .eq("id", data.user.id)
        .single();

      if (profile?.role) {
        // User exists, reinitialize and redirect to dashboard
        await initialize();
        toast.success("Login successful!");
        router.push(`/${profile.role}/dashboard`);
      } else {
        // New user, needs to complete profile
        toast.success("Phone verified! Please complete your profile.");
        router.push("/auth/complete-profile");
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Invalid OTP";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phone.replace(/\s/g, ""),
      });

      if (error) throw error;
      toast.success("OTP resent to your phone!");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to resend OTP";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="text-3xl font-bold text-gray-900">Online-MART</h1>
          </Link>
          <p className="text-gray-600 mt-2">Login with Phone</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {step === "phone" ? (
            <>
              <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-6">
                <Phone className="w-8 h-8 text-blue-600" />
              </div>

              <h2 className="text-2xl font-semibold text-gray-900 mb-2 text-center">
                Enter Your Phone
              </h2>
              <p className="text-gray-600 text-center mb-6">
                We&apos;ll send you a code to verify your number
              </p>

              <form onSubmit={handleSendOTP} className="space-y-4">
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Phone Number*
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-lg"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Include country code (e.g., +91 for India)
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={20} />
                      Sending OTP...
                    </>
                  ) : (
                    "Send OTP"
                  )}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-6">
                <Phone className="w-8 h-8 text-green-600" />
              </div>

              <h2 className="text-2xl font-semibold text-gray-900 mb-2 text-center">
                Enter OTP
              </h2>
              <p className="text-gray-600 text-center mb-6">
                We sent a code to <span className="font-medium">{phone}</span>
              </p>

              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div>
                  <label
                    htmlFor="otp"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    6-Digit Code*
                  </label>
                  <input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    placeholder="000000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-2xl text-center tracking-widest font-mono"
                    disabled={isLoading}
                    maxLength={6}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={20} />
                      Verifying...
                    </>
                  ) : (
                    "Verify OTP"
                  )}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={isLoading}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Resend OTP
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setStep("phone")}
                  className="w-full flex items-center justify-center text-gray-600 hover:text-gray-900 mt-4"
                >
                  <ArrowLeft size={16} className="mr-2" />
                  Change phone number
                </button>
              </form>
            </>
          )}
        </div>

        {/* Back to Login Link */}
        <p className="text-center mt-6 text-sm text-gray-600">
          <Link
            href="/login"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Back to login options
          </Link>
        </p>
      </div>
    </div>
  );
}
