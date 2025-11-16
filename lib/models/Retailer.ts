import { User, Location } from './User';
import { supabase } from '@/lib/supabase/client';
import { Database } from '@/lib/types/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type RetailerData = Database['public']['Tables']['retailers']['Row'];

/**
 * Retailer class - represents shop owners who sell to customers
 * Can manage inventory, handle orders, and connect with wholesalers
 */
export class Retailer extends User {
  private shopName: string;
  private shopAddress?: string;
  private shopCity?: string;
  private shopState?: string;
  private shopPincode?: string;
  private shopLocation?: Location;
  private wholesalerId?: string;
  private isVerified: boolean;

  constructor(profile: Profile, retailerData: RetailerData) {
    super(profile);
    this.shopName = retailerData.shop_name;
    this.shopAddress = retailerData.shop_address || undefined;
    this.shopCity = retailerData.shop_city || undefined;
    this.shopState = retailerData.shop_state || undefined;
    this.shopPincode = retailerData.shop_pincode || undefined;
    this.wholesalerId = retailerData.wholesaler_id || undefined;
    this.isVerified = retailerData.is_verified;

    if (retailerData.shop_latitude && retailerData.shop_longitude) {
      this.shopLocation = {
        latitude: Number(retailerData.shop_latitude),
        longitude: Number(retailerData.shop_longitude),
        address: retailerData.shop_address || undefined,
        city: retailerData.shop_city || undefined,
        state: retailerData.shop_state || undefined,
        pincode: retailerData.shop_pincode || undefined,
      };
    }
  }

  // Getters
  getShopName(): string {
    return this.shopName;
  }

  getShopLocation(): Location | undefined {
    return this.shopLocation;
  }

  getWholesalerId(): string | undefined {
    return this.wholesalerId;
  }

  /**
   * Get retailer's inventory
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
      .eq('owner_type', 'retailer')
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
        owner_type: 'retailer',
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
   * Get low stock items
   */
  async getLowStockItems() {
    const { data, error } = await supabase
      .from('inventory')
      .select(`
        *,
        product:products(*)
      `)
      .eq('owner_id', this.id)
      .eq('owner_type', 'retailer')
      .filter('quantity', 'lte', 'low_stock_threshold');

    if (error) throw error;
    return data;
  }

  /**
   * Get proxy products (from connected wholesaler)
   */
  async getProxyProducts() {
    if (!this.wholesalerId) {
      return [];
    }

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
      .eq('owner_id', this.wholesalerId)
      .eq('owner_type', 'wholesaler')
      .eq('is_available', true);

    if (error) throw error;
    return data;
  }

  /**
   * Get incoming customer orders
   */
  async getCustomerOrders(status?: string) {
    let query = supabase
      .from('orders')
      .select(`
        *,
        items:order_items(*),
        customer:profiles!orders_customer_id_fkey(*),
        delivery_person:profiles!orders_delivery_person_id_fkey(*)
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
   * Assign delivery person to order
   */
  async assignDeliveryPerson(orderId: string, deliveryPersonId: string) {
    const { error } = await supabase
      .from('orders')
      .update({
        delivery_person_id: deliveryPersonId,
        assigned_at: new Date().toISOString(),
        status: 'confirmed',
      })
      .eq('id', orderId)
      .eq('seller_id', this.id);

    if (error) throw error;
  }

  /**
   * Find nearby wholesalers
   */
  async findNearbyWholesalers(radiusKm: number = 50) {
    if (!this.shopLocation) {
      throw new Error('Shop location not set');
    }

    // Get all wholesalers with location
    const { data, error } = await supabase
      .from('wholesalers')
      .select(`
        *,
        profile:profiles(*)
      `)
      .eq('is_verified', true)
      .not('business_latitude', 'is', null)
      .not('business_longitude', 'is', null);

    if (error) throw error;

    // Calculate distances and filter
    const wholesalersWithDistance = data
      ?.map((w) => {
        const distance = this.calculateDistance(
          this.shopLocation!.latitude,
          this.shopLocation!.longitude,
          Number(w.business_latitude),
          Number(w.business_longitude)
        );
        return { ...w, distance };
      })
      .filter((w) => w.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);

    return wholesalersWithDistance || [];
  }

  /**
   * Calculate distance between two points (Haversine formula)
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Get dashboard data
   */
  async getDashboardData() {
    const [orders, inventory, lowStock, notifications] = await Promise.all([
      this.getCustomerOrders(),
      this.getInventory(),
      this.getLowStockItems(),
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
      lowStockCount: lowStock?.length || 0,
      recentOrders: orders?.slice(0, 5),
      unreadNotifications: notifications?.filter((n) => !n.is_read).length || 0,
    };
  }
}
