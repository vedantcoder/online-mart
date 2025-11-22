import { supabase } from "@/lib/supabase/client";
import { Customer } from "@/lib/models/Customer";
import { Retailer } from "@/lib/models/Retailer";
import { Wholesaler } from "@/lib/models/Wholesaler";
import { DeliveryPerson } from "@/lib/models/DeliveryPerson";
import { User } from "@/lib/models/User";

export type UserRole = "customer" | "retailer" | "wholesaler" | "delivery";

export interface RegisterData {
  email: string;
  password: string;
  phone: string;
  full_name: string;
  role: UserRole;
  // Role-specific fields
  customer?: {
    street_address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    latitude?: number;
    longitude?: number;
  };
  retailer?: {
    shop_name: string;
    shop_address?: string;
    shop_city?: string;
    shop_state?: string;
    shop_pincode?: string;
    shop_latitude?: number;
    shop_longitude?: number;
  };
  wholesaler?: {
    business_name: string;
    business_address?: string;
    business_city?: string;
    business_state?: string;
    business_pincode?: string;
    business_latitude?: number;
    business_longitude?: number;
    gst_number?: string;
  };
  delivery?: {
    vehicle_type?: "bike" | "scooter" | "van" | "truck";
    vehicle_number?: string;
    license_number?: string;
  };
}

/**
 * Authentication Service
 * Handles user registration, login, OTP verification, and session management
 */
export class AuthService {
  /**
   * Register a new user (does not auto-login)
   */
  static async register(
    data: RegisterData
  ): Promise<{ success: boolean; role: UserRole }> {
    try {
      const { email, password, full_name, phone, role } = data;

      const { data: signUpData, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name,
            phone,
            role,
            shop_name: data.retailer?.shop_name,
            business_name: data.wholesaler?.business_name,
          },
        },
      });

      if (error) {
        throw error;
      }

      if (!signUpData.user) {
        throw new Error("Registration failed");
      }

      return { success: true, role: data.role };
    } catch (e) {
      if (e instanceof Error) {
        throw e;
      }
      throw new Error("Registration failed: " + String(e));
    }
  }

  /**
   * Login with email and password
   */
  static async login(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user) throw new Error("Login failed");

    return await this.getCurrentUser();
  }

  /**
   * Login with Google OAuth
   */
  static async loginWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;
    return data;
  }

  /**
   * Login with Facebook OAuth
   */
  // --- Facebook OAuth FIXED (added scopes) ---
  static async loginWithFacebook() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "facebook",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: "email", // required so user email is returned
      },
    });

    if (error) throw error;
    return data;
  }

  /**
   * Send OTP to phone number
   */
  // --- Phone OTP FIXED (added channel: "sms") ---
  static async sendOTP(phone: string) {
    const { data, error } = await supabase.auth.signInWithOtp({
      phone,
      options: {
        channel: "sms", // supabase requires this for phone OTP
      },
    });

    if (error) throw error;
    return data;
  }

  /**
   * Verify OTP
   */
  static async verifyOTP(phone: string, token: string) {
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: "sms",
    });

    if (error) throw error;
    return data;
  }

  /**
   * Send password reset email
   */
  static async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) throw error;
  }

  /**
   * Update password
   */
  static async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
  }

  /**
   * Logout
   */
  static async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  /**
   * Get current authenticated user with role-specific data
   */
  static async getCurrentUser(): Promise<User> {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) throw authError;
    if (!user) throw new Error("No authenticated user");

    // Get profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError) throw profileError;
    if (!profile) throw new Error("Profile not found");

    // Get role-specific data and create appropriate user instance
    switch (profile.role) {
      case "customer": {
        const { data: customerData, error } = await supabase
          .from("customers")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;
        return new Customer(profile, customerData);
      }

      case "retailer": {
        const { data: retailerData, error } = await supabase
          .from("retailers")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;
        return new Retailer(profile, retailerData);
      }

      case "wholesaler": {
        const { data: wholesalerData, error } = await supabase
          .from("wholesalers")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;
        return new Wholesaler(profile, wholesalerData);
      }

      case "delivery": {
        const { data: deliveryData, error } = await supabase
          .from("delivery_persons")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;
        return new DeliveryPerson(profile, deliveryData);
      }

      default:
        throw new Error(`Unknown user role: ${profile.role}`);
    }
  }

  /**
   * Check if user is authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return !!session;
  }

  /**
   * Get current session
   */
  static async getSession() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session;
  }
}

// Export OAuth methods separately for easier imports
export const { loginWithGoogle, loginWithFacebook } = AuthService;
