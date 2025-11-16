import { User, Location } from './User';
import { supabase } from '@/lib/supabase/client';
import { Database } from '@/lib/types/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type WholesalerData = Database['public']['Tables']['wholesalers']['Row'];

/**
 * Wholesaler class - represents bulk suppliers who sell to retailers
 */
export class Wholesaler extends User {
  private businessName: string;
  private businessAddress?: string;
  private businessCity?: string;
  private businessState?: string;
  private businessPincode?: string;
  private businessLocation?: Location;
  private gstNumber?: string;
  private isVerified: boolean;

  constructor(profile: Profile, wholesalerData: WholesalerData) {
    super(profile);
    this.businessName = wholesalerData.business_name;
    this.businessAddress = wholesalerData.business_address || undefined;
    this.businessCity = wholesalerData.business_city || undefined;
    this.businessState = wholesalerData.business_state || undefined;
    this.businessPincode = wholesalerData.business_pincode || undefined;
    this.gstNumber = wholesalerData.gst_number || undefined;
    this.isVerified = wholesalerData.is_verified;

    if (wholesalerData.business_latitude && wholesalerData.business_longitude) {
      this.businessLocation = {
        latitude: Number(wholesalerData.business_latitude),
        longitude: Number(wholesalerData.business_longitude),
        address: wholesalerData.business_address || undefined,
        city: wholesalerData.business_city || undefined,
        state: wholesalerData.business_state || undefined,
        pincode: wholesalerData.business_pincode || undefined,
      };
    }
  }

  // Getters
  getBusinessName(): string {
    return this.businessName;
  }

  getBusinessLocation(): Location | undefined {
    return this.businessLocation;
  }

  getGstNumber(): string | undefined {
    return this.gstNumber;
  }

  /**
   * Get wholesaler's inventory
   */
  async getInventory() {
    const { data, error } = await supabase
      .from('inventory')
      .select(`
        *,
        product:products(
          *,
          category:categories(*),
          images:product_images(*)
        )
      `)
      .eq('owner_id', this.id)
      .eq('owner_type', 'wholesaler')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Add product to inventory
   */
  async addToInventory(
    productId: string,
    quantity: number,
    price: number,
    mrp?: number
  ) {
    const { error } = await supabase
      .from('inventory')
      .insert({
        product_id: productId,
        owner_id: this.id,
        owner_type: 'wholesaler',
        quantity,
        price,
        mrp,
        is_available: quantity > 0,
      });

    if (error) throw error;
  }

  /**
   * Update inventory stock
   */
  async updateStock(inventoryId: string, quantity: number) {
    const { error } = await supabase
      .from('inventory')
      .update({
        quantity,
        is_available: quantity > 0,
        updated_at: new Date().toISOString(),
      })
      .eq('id', inventoryId)
      .eq('owner_id', this.id);

    if (error) throw error;
  }

  /**
   * Update product price
   */
  async updatePrice(inventoryId: string, price: number, mrp?: number) {
    const { error } = await supabase
      .from('inventory')
      .update({
        price,
        mrp,
        updated_at: new Date().toISOString(),
      })
      .eq('id', inventoryId)
      .eq('owner_id', this.id);

    if (error) throw error;
  }

  /**
   * Get orders from retailers
   */
  async getRetailerOrders(status?: string) {
    let query = supabase
      .from('orders')
      .select(`
        *,
        items:order_items(*),
        customer:profiles!orders_customer_id_fkey(*)
      `)
      .eq('seller_id', this.id)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  }

  /**
   * Get connected retailers
   */
  async getConnectedRetailers() {
    const { data, error } = await supabase
      .from('retailer_wholesaler_relationships')
      .select(`
        *,
        retailer:retailers(
          *,
          profile:profiles(*)
        )
      `)
      .eq('wholesaler_id', this.id)
      .eq('status', 'approved');

    if (error) throw error;
    return data;
  }

  /**
   * Approve retailer connection
   */
  async approveRetailer(retailerId: string) {
    const { error } = await supabase
      .from('retailer_wholesaler_relationships')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
      })
      .eq('retailer_id', retailerId)
      .eq('wholesaler_id', this.id);

    if (error) throw error;
  }

  /**
   * Update order status
   */
  async updateOrderStatus(orderId: string, status: string, notes?: string) {
    const { error } = await supabase
      .from('orders')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .eq('seller_id', this.id);

    if (error) throw error;

    // Add to tracking
    await supabase.from('order_tracking').insert({
      order_id: orderId,
      status,
      notes,
      created_by: this.id,
    });
  }

  /**
   * Get dashboard data
   */
  async getDashboardData() {
    const [orders, inventory, retailers, notifications] = await Promise.all([
      this.getRetailerOrders(),
      this.getInventory(),
      this.getConnectedRetailers(),
      this.getNotifications(5),
    ]);

    const pendingOrders = orders?.filter((o) => o.status === 'pending').length || 0;
    const todayOrders = orders?.filter((o) => {
      const orderDate = new Date(o.created_at);
      const today = new Date();
      return orderDate.toDateString() === today.toDateString();
    }).length || 0;

    return {
      totalOrders: orders?.length || 0,
      pendingOrders,
      todayOrders,
      inventoryCount: inventory?.length || 0,
      connectedRetailers: retailers?.length || 0,
      recentOrders: orders?.slice(0, 5),
      unreadNotifications: notifications?.filter((n) => !n.is_read).length || 0,
    };
  }
}
