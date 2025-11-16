import { supabase } from '@/lib/supabase/client';
import { Customer } from '@/lib/models/Customer';
import { Retailer } from '@/lib/models/Retailer';
import { Wholesaler } from '@/lib/models/Wholesaler';
import { DeliveryPerson } from '@/lib/models/DeliveryPerson';
import { User } from '@/lib/models/User';

export type UserRole = 'customer' | 'retailer' | 'wholesaler' | 'delivery';

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
    vehicle_type?: 'bike' | 'scooter' | 'van' | 'truck';
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
   * Register a new user
   */
  static async register(data: RegisterData): Promise<User> {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.full_name,
          phone: data.phone,
          role: data.role,
        },
      },
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('User creation failed');

    const userId = authData.user.id;

    try {
      // Create profile
      const { error: profileError } = await supabase.from('profiles').insert({
        id: userId,
        email: data.email,
        phone: data.phone,
        full_name: data.full_name,
        role: data.role,
      });

      if (profileError) throw profileError;

      // Create role-specific record
      switch (data.role) {
        case 'customer':
          await supabase.from('customers').insert({
            id: userId,
            ...data.customer,
          });
          break;

        case 'retailer':
          if (!data.retailer?.shop_name) {
            throw new Error('Shop name is required for retailers');
          }
          await supabase.from('retailers').insert({
            id: userId,
            shop_name: data.retailer.shop_name,
            shop_address: data.retailer.shop_address,
            shop_city: data.retailer.shop_city,
            shop_state: data.retailer.shop_state,
            shop_pincode: data.retailer.shop_pincode,
            shop_latitude: data.retailer.shop_latitude,
            shop_longitude: data.retailer.shop_longitude,
          });
          break;

        case 'wholesaler':
          if (!data.wholesaler?.business_name) {
            throw new Error('Business name is required for wholesalers');
          }
          await supabase.from('wholesalers').insert({
            id: userId,
            business_name: data.wholesaler.business_name,
            business_address: data.wholesaler.business_address,
            business_city: data.wholesaler.business_city,
            business_state: data.wholesaler.business_state,
            business_pincode: data.wholesaler.business_pincode,
            business_latitude: data.wholesaler.business_latitude,
            business_longitude: data.wholesaler.business_longitude,
            gst_number: data.wholesaler.gst_number,
          });
          break;

        case 'delivery':
          await supabase.from('delivery_persons').insert({
            id: userId,
            vehicle_type: data.delivery?.vehicle_type,
            vehicle_number: data.delivery?.vehicle_number,
            license_number: data.delivery?.license_number,
          });
          break;
      }

      // Fetch complete user data
      return await this.getCurrentUser();
    } catch (error) {
      // Rollback: delete auth user if profile creation fails
      await supabase.auth.admin.deleteUser(userId);
      throw error;
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
    if (!data.user) throw new Error('Login failed');

    return await this.getCurrentUser();
  }

  /**
   * Login with Google OAuth
   */
  static async loginWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
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
  static async loginWithFacebook() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;
    return data;
  }

  /**
   * Send OTP to phone number
   */
  static async sendOTP(phone: string) {
    const { data, error } = await supabase.auth.signInWithOtp({
      phone,
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
      type: 'sms',
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
    if (!user) throw new Error('No authenticated user');

    // Get profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) throw profileError;
    if (!profile) throw new Error('Profile not found');

    // Get role-specific data and create appropriate user instance
    switch (profile.role) {
      case 'customer': {
        const { data: customerData, error } = await supabase
          .from('customers')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        return new Customer(profile, customerData);
      }

      case 'retailer': {
        const { data: retailerData, error } = await supabase
          .from('retailers')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        return new Retailer(profile, retailerData);
      }

      case 'wholesaler': {
        const { data: wholesalerData, error } = await supabase
          .from('wholesalers')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        return new Wholesaler(profile, wholesalerData);
      }

      case 'delivery': {
        const { data: deliveryData, error } = await supabase
          .from('delivery_persons')
          .select('*')
          .eq('id', user.id)
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
