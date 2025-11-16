import { User, Location } from "./User";
import { supabase } from "@/lib/supabase/client";
import { Database } from "@/lib/types/database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type DeliveryPersonData =
  Database["public"]["Tables"]["delivery_persons"]["Row"];

/**
 * DeliveryPerson class - represents delivery partners who deliver orders
 */
export class DeliveryPerson extends User {
  private vehicleType?: "bike" | "scooter" | "van" | "truck";
  private vehicleNumber?: string;
  private licenseNumber?: string;
  private currentLocation?: Location;
  private isAvailable: boolean;
  private rating: number;
  private totalDeliveries: number;

  constructor(profile: Profile, deliveryData: DeliveryPersonData) {
    super(profile);
    this.vehicleType = deliveryData.vehicle_type || undefined;
    this.vehicleNumber = deliveryData.vehicle_number || undefined;
    this.licenseNumber = deliveryData.license_number || undefined;
    this.isAvailable = deliveryData.is_available;
    this.rating = Number(deliveryData.rating);
    this.totalDeliveries = deliveryData.total_deliveries;

    if (deliveryData.current_latitude && deliveryData.current_longitude) {
      this.currentLocation = {
        latitude: Number(deliveryData.current_latitude),
        longitude: Number(deliveryData.current_longitude),
      };
    }
  }

  // Getters
  getVehicleType(): string | undefined {
    return this.vehicleType;
  }

  getCurrentLocation(): Location | undefined {
    return this.currentLocation;
  }

  getIsAvailable(): boolean {
    return this.isAvailable;
  }

  getRating(): number {
    return this.rating;
  }

  getTotalDeliveries(): number {
    return this.totalDeliveries;
  }

  /**
   * Update current location
   */
  async updateLocation(latitude: number, longitude: number) {
    const { error } = await supabase
      .from("delivery_persons")
      .update({
        current_latitude: latitude,
        current_longitude: longitude,
      })
      .eq("id", this.id);

    if (error) throw error;

    this.currentLocation = { latitude, longitude };
  }

  /**
   * Toggle availability status
   */
  async toggleAvailability() {
    const newStatus = !this.isAvailable;

    const { error } = await supabase
      .from("delivery_persons")
      .update({
        is_available: newStatus,
      })
      .eq("id", this.id);

    if (error) throw error;

    this.isAvailable = newStatus;
    return newStatus;
  }

  /**
   * Get pending delivery assignments
   */
  async getPendingDeliveries() {
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        items:order_items(*),
        customer:profiles!orders_customer_id_fkey(*),
        seller:profiles!orders_seller_id_fkey(*)
      `
      )
      .eq("delivery_person_id", this.id)
      .in("status", [
        "confirmed",
        "processing",
        "packed",
        "shipped",
        "out_for_delivery",
      ])
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data;
  }

  /**
   * Get active delivery
   */
  async getActiveDelivery() {
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        items:order_items(*),
        customer:profiles!orders_customer_id_fkey(*),
        seller:profiles!orders_seller_id_fkey(*),
        tracking:order_tracking(*)
      `
      )
      .eq("delivery_person_id", this.id)
      .eq("status", "out_for_delivery")
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data || null;
  }

  /**
   * Accept delivery assignment
   */
  async acceptDelivery(orderId: string) {
    const { error } = await supabase
      .from("orders")
      .update({
        status: "processing",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .eq("delivery_person_id", this.id);

    if (error) throw error;

    // Add tracking
    await supabase.from("order_tracking").insert({
      order_id: orderId,
      status: "processing",
      notes: "Delivery person accepted the order",
      created_by: this.id,
    });
  }

  /**
   * Reject delivery assignment
   */
  async rejectDelivery(orderId: string) {
    const { error } = await supabase
      .from("orders")
      .update({
        delivery_person_id: null,
        assigned_at: null,
      })
      .eq("id", orderId)
      .eq("delivery_person_id", this.id);

    if (error) throw error;
  }

  /**
   * Update delivery status
   */
  async updateDeliveryStatus(
    orderId: string,
    status: "picked_up" | "in_transit" | "delivered",
    notes?: string
  ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updates: any = {
      updated_at: new Date().toISOString(),
    };

    if (status === "picked_up") {
      updates.status = "shipped";
      updates.picked_up_at = new Date().toISOString();
    } else if (status === "in_transit") {
      updates.status = "out_for_delivery";
    } else if (status === "delivered") {
      updates.status = "delivered";
      updates.actual_delivery = new Date().toISOString();
    }

    const { error } = await supabase
      .from("orders")
      .update(updates)
      .eq("id", orderId)
      .eq("delivery_person_id", this.id);

    if (error) throw error;

    // Add tracking
    await supabase.from("order_tracking").insert({
      order_id: orderId,
      status: updates.status,
      notes,
      latitude: this.currentLocation?.latitude,
      longitude: this.currentLocation?.longitude,
      created_by: this.id,
    });

    // If delivered, increment total deliveries
    if (status === "delivered") {
      await supabase
        .from("delivery_persons")
        .update({
          total_deliveries: this.totalDeliveries + 1,
        })
        .eq("id", this.id);

      this.totalDeliveries += 1;
    }
  }

  /**
   * Get delivery history
   */
  async getDeliveryHistory(limit: number = 20) {
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        items:order_items(*),
        customer:profiles!orders_customer_id_fkey(*),
        seller:profiles!orders_seller_id_fkey(*)
      `
      )
      .eq("delivery_person_id", this.id)
      .eq("status", "delivered")
      .order("actual_delivery", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  /**
   * Get dashboard data
   */
  async getDashboardData() {
    const [pendingDeliveries, activeDelivery, history, notifications] =
      await Promise.all([
        this.getPendingDeliveries(),
        this.getActiveDelivery(),
        this.getDeliveryHistory(5),
        this.getNotifications(5),
      ]);

    const todayDeliveries =
      history?.filter((d) => {
        const deliveryDate = new Date(d.actual_delivery!);
        const today = new Date();
        return deliveryDate.toDateString() === today.toDateString();
      }).length || 0;

    return {
      pendingCount: pendingDeliveries?.length || 0,
      activeDelivery,
      todayDeliveries,
      totalDeliveries: this.totalDeliveries,
      rating: this.rating,
      isAvailable: this.isAvailable,
      recentDeliveries: history,
      unreadNotifications: notifications?.filter((n) => !n.is_read).length || 0,
    };
  }
}
