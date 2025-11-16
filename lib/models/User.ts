import { supabase } from "@/lib/supabase/client";
import { Database } from "@/lib/types/database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

/**
 * Abstract base class for all user types
 * Implements common functionality shared across Customer, Retailer, Wholesaler, and DeliveryPerson
 */
export abstract class User {
  protected id: string;
  protected email: string;
  protected phone?: string;
  protected fullName?: string;
  protected role: "customer" | "retailer" | "wholesaler" | "delivery";
  protected avatarUrl?: string;
  protected isActive: boolean;

  constructor(profile: Profile) {
    this.id = profile.id;
    this.email = profile.email;
    this.phone = profile.phone || undefined;
    this.fullName = profile.full_name || undefined;
    this.role = profile.role;
    this.avatarUrl = profile.avatar_url || undefined;
    this.isActive = profile.is_active;
  }

  // Getters
  getId(): string {
    return this.id;
  }

  getEmail(): string {
    return this.email;
  }

  getPhone(): string | undefined {
    return this.phone;
  }

  getFullName(): string | undefined {
    return this.fullName;
  }

  getRole(): "customer" | "retailer" | "wholesaler" | "delivery" {
    return this.role;
  }

  getAvatarUrl(): string | undefined {
    return this.avatarUrl;
  }

  getIsActive(): boolean {
    return this.isActive;
  }

  /**
   * Update user profile information
   */
  async updateProfile(updates: {
    full_name?: string;
    phone?: string;
    avatar_url?: string;
  }): Promise<void> {
    const { error } = await supabase
      .from("profiles")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", this.id);

    if (error) throw error;

    // Update local state
    if (updates.full_name) this.fullName = updates.full_name;
    if (updates.phone) this.phone = updates.phone;
    if (updates.avatar_url) this.avatarUrl = updates.avatar_url;
  }

  /**
   * Get user notifications
   */
  async getNotifications(limit: number = 20) {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", this.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  /**
   * Mark notification as read
   */
  async markNotificationRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from("notifications")
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq("id", notificationId)
      .eq("user_id", this.id);

    if (error) throw error;
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<number> {
    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", this.id)
      .eq("is_read", false);

    if (error) throw error;
    return count || 0;
  }

  /**
   * Abstract method - must be implemented by child classes
   * Returns role-specific dashboard data
   */
  abstract getDashboardData(): Promise<unknown>;
}
