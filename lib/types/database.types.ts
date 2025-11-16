export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "customer" | "retailer" | "wholesaler" | "delivery";
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "packed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "refunded"
  | "failed";
export type PaymentStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "refunded";
export type OrderType = "online" | "offline";
export type PaymentMethod = "card" | "upi" | "netbanking" | "wallet" | "cod";
export type OwnerType = "retailer" | "wholesaler";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          phone: string | null;
          full_name: string | null;
          role: UserRole;
          avatar_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          phone?: string | null;
          full_name?: string | null;
          role: UserRole;
          avatar_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          phone?: string | null;
          full_name?: string | null;
          role?: UserRole;
          avatar_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      customers: {
        Row: {
          id: string;
          street_address: string | null;
          city: string | null;
          state: string | null;
          pincode: string | null;
          latitude: number | null;
          longitude: number | null;
          preferences: Json;
          created_at: string;
        };
        Insert: {
          id: string;
          street_address?: string | null;
          city?: string | null;
          state?: string | null;
          pincode?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          preferences?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          street_address?: string | null;
          city?: string | null;
          state?: string | null;
          pincode?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          preferences?: Json;
          created_at?: string;
        };
      };
      retailers: {
        Row: {
          id: string;
          shop_name: string;
          shop_address: string | null;
          shop_city: string | null;
          shop_state: string | null;
          shop_pincode: string | null;
          shop_latitude: number | null;
          shop_longitude: number | null;
          wholesaler_id: string | null;
          business_license: string | null;
          is_verified: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          shop_name: string;
          shop_address?: string | null;
          shop_city?: string | null;
          shop_state?: string | null;
          shop_pincode?: string | null;
          shop_latitude?: number | null;
          shop_longitude?: number | null;
          wholesaler_id?: string | null;
          business_license?: string | null;
          is_verified?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          shop_name?: string;
          shop_address?: string | null;
          shop_city?: string | null;
          shop_state?: string | null;
          shop_pincode?: string | null;
          shop_latitude?: number | null;
          shop_longitude?: number | null;
          wholesaler_id?: string | null;
          business_license?: string | null;
          is_verified?: boolean;
          created_at?: string;
        };
      };
      wholesalers: {
        Row: {
          id: string;
          business_name: string;
          business_address: string | null;
          business_city: string | null;
          business_state: string | null;
          business_pincode: string | null;
          business_latitude: number | null;
          business_longitude: number | null;
          gst_number: string | null;
          is_verified: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          business_name: string;
          business_address?: string | null;
          business_city?: string | null;
          business_state?: string | null;
          business_pincode?: string | null;
          business_latitude?: number | null;
          business_longitude?: number | null;
          gst_number?: string | null;
          is_verified?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_name?: string;
          business_address?: string | null;
          business_city?: string | null;
          business_state?: string | null;
          business_pincode?: string | null;
          business_latitude?: number | null;
          business_longitude?: number | null;
          gst_number?: string | null;
          is_verified?: boolean;
          created_at?: string;
        };
      };
      delivery_persons: {
        Row: {
          id: string;
          vehicle_type: "bike" | "scooter" | "van" | "truck" | null;
          vehicle_number: string | null;
          license_number: string | null;
          current_latitude: number | null;
          current_longitude: number | null;
          is_available: boolean;
          rating: number;
          total_deliveries: number;
          created_at: string;
        };
        Insert: {
          id: string;
          vehicle_type?: "bike" | "scooter" | "van" | "truck" | null;
          vehicle_number?: string | null;
          license_number?: string | null;
          current_latitude?: number | null;
          current_longitude?: number | null;
          is_available?: boolean;
          rating?: number;
          total_deliveries?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          vehicle_type?: "bike" | "scooter" | "van" | "truck" | null;
          vehicle_number?: string | null;
          license_number?: string | null;
          current_latitude?: number | null;
          current_longitude?: number | null;
          is_available?: boolean;
          rating?: number;
          total_deliveries?: number;
          created_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          parent_id: string | null;
          image_url: string | null;
          description: string | null;
          is_regional: boolean;
          region: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          parent_id?: string | null;
          image_url?: string | null;
          description?: string | null;
          is_regional?: boolean;
          region?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          parent_id?: string | null;
          image_url?: string | null;
          description?: string | null;
          is_regional?: boolean;
          region?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          category_id: string | null;
          sku: string | null;
          base_price: number | null;
          unit: string;
          specifications: Json;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          category_id?: string | null;
          sku?: string | null;
          base_price?: number | null;
          unit?: string;
          specifications?: Json;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          category_id?: string | null;
          sku?: string | null;
          base_price?: number | null;
          unit?: string;
          specifications?: Json;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      inventory: {
        Row: {
          id: string;
          product_id: string;
          owner_id: string;
          owner_type: OwnerType;
          quantity: number;
          price: number;
          mrp: number | null;
          available_from: string | null;
          is_available: boolean;
          low_stock_threshold: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          owner_id: string;
          owner_type: OwnerType;
          quantity?: number;
          price: number;
          mrp?: number | null;
          available_from?: string | null;
          is_available?: boolean;
          low_stock_threshold?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          owner_id?: string;
          owner_type?: OwnerType;
          quantity?: number;
          price?: number;
          mrp?: number | null;
          available_from?: string | null;
          is_available?: boolean;
          low_stock_threshold?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      carts: {
        Row: {
          id: string;
          customer_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      cart_items: {
        Row: {
          id: string;
          cart_id: string;
          product_id: string;
          seller_id: string;
          quantity: number;
          price_at_addition: number;
          added_at: string;
        };
        Insert: {
          id?: string;
          cart_id: string;
          product_id: string;
          seller_id: string;
          quantity: number;
          price_at_addition: number;
          added_at?: string;
        };
        Update: {
          id?: string;
          cart_id?: string;
          product_id?: string;
          seller_id?: string;
          quantity?: number;
          price_at_addition?: number;
          added_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          customer_id: string | null;
          seller_id: string | null;
          delivery_person_id: string | null;
          subtotal: number;
          tax_amount: number;
          delivery_charges: number;
          discount_amount: number;
          total_amount: number;
          delivery_address: Json;
          delivery_latitude: number | null;
          delivery_longitude: number | null;
          order_type: OrderType;
          status: OrderStatus;
          payment_status: PaymentStatus;
          scheduled_date: string | null;
          estimated_delivery: string | null;
          actual_delivery: string | null;
          assigned_at: string | null;
          picked_up_at: string | null;
          cancelled_at: string | null;
          notes: string | null;
          cancellation_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number: string;
          customer_id?: string | null;
          seller_id?: string | null;
          delivery_person_id?: string | null;
          subtotal: number;
          tax_amount?: number;
          delivery_charges?: number;
          discount_amount?: number;
          total_amount: number;
          delivery_address: Json;
          delivery_latitude?: number | null;
          delivery_longitude?: number | null;
          order_type: OrderType;
          status?: OrderStatus;
          payment_status?: PaymentStatus;
          scheduled_date?: string | null;
          estimated_delivery?: string | null;
          actual_delivery?: string | null;
          assigned_at?: string | null;
          picked_up_at?: string | null;
          cancelled_at?: string | null;
          notes?: string | null;
          cancellation_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_number?: string;
          customer_id?: string | null;
          seller_id?: string | null;
          delivery_person_id?: string | null;
          subtotal?: number;
          tax_amount?: number;
          delivery_charges?: number;
          discount_amount?: number;
          total_amount?: number;
          delivery_address?: Json;
          delivery_latitude?: number | null;
          delivery_longitude?: number | null;
          order_type?: OrderType;
          status?: OrderStatus;
          payment_status?: PaymentStatus;
          scheduled_date?: string | null;
          estimated_delivery?: string | null;
          actual_delivery?: string | null;
          assigned_at?: string | null;
          picked_up_at?: string | null;
          cancelled_at?: string | null;
          notes?: string | null;
          cancellation_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          order_id: string | null;
          amount: number;
          currency: string;
          payment_method: PaymentMethod;
          payment_gateway: string | null;
          transaction_id: string | null;
          gateway_order_id: string | null;
          gateway_payment_id: string | null;
          status: PaymentStatus;
          payment_date: string | null;
          refund_date: string | null;
          failure_reason: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_id?: string | null;
          amount: number;
          currency?: string;
          payment_method: PaymentMethod;
          payment_gateway?: string | null;
          transaction_id?: string | null;
          gateway_order_id?: string | null;
          gateway_payment_id?: string | null;
          status?: PaymentStatus;
          payment_date?: string | null;
          refund_date?: string | null;
          failure_reason?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string | null;
          amount?: number;
          currency?: string;
          payment_method?: PaymentMethod;
          payment_gateway?: string | null;
          transaction_id?: string | null;
          gateway_order_id?: string | null;
          gateway_payment_id?: string | null;
          status?: PaymentStatus;
          payment_date?: string | null;
          refund_date?: string | null;
          failure_reason?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      feedback: {
        Row: {
          id: string;
          customer_id: string | null;
          product_id: string;
          order_id: string | null;
          seller_id: string | null;
          rating: number;
          title: string | null;
          comment: string | null;
          images: Json;
          is_verified_purchase: boolean;
          is_visible: boolean;
          helpful_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id?: string | null;
          product_id: string;
          order_id?: string | null;
          seller_id?: string | null;
          rating: number;
          title?: string | null;
          comment?: string | null;
          images?: Json;
          is_verified_purchase?: boolean;
          is_visible?: boolean;
          helpful_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string | null;
          product_id?: string;
          order_id?: string | null;
          seller_id?: string | null;
          rating?: number;
          title?: string | null;
          comment?: string | null;
          images?: Json;
          is_verified_purchase?: boolean;
          is_visible?: boolean;
          helpful_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: "email" | "sms" | "push" | "in_app";
          category:
            | "order"
            | "payment"
            | "delivery"
            | "promotion"
            | "system"
            | "feedback";
          title: string | null;
          message: string;
          is_read: boolean;
          read_at: string | null;
          action_url: string | null;
          metadata: Json;
          sent_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: "email" | "sms" | "push" | "in_app";
          category:
            | "order"
            | "payment"
            | "delivery"
            | "promotion"
            | "system"
            | "feedback";
          title?: string | null;
          message: string;
          is_read?: boolean;
          read_at?: string | null;
          action_url?: string | null;
          metadata?: Json;
          sent_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: "email" | "sms" | "push" | "in_app";
          category?:
            | "order"
            | "payment"
            | "delivery"
            | "promotion"
            | "system"
            | "feedback";
          title?: string | null;
          message?: string;
          is_read?: boolean;
          read_at?: string | null;
          action_url?: string | null;
          metadata?: Json;
          sent_at?: string;
          created_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          product_name: string;
          quantity: number;
          price_per_unit: number;
          subtotal: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          product_name: string;
          quantity: number;
          price_per_unit: number;
          subtotal: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string | null;
          product_name?: string;
          quantity?: number;
          price_per_unit?: number;
          subtotal?: number;
          created_at?: string;
        };
      };
      order_tracking: {
        Row: {
          id: string;
          order_id: string;
          status: string;
          latitude: number | null;
          longitude: number | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          status: string;
          latitude?: number | null;
          longitude?: number | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          status?: string;
          latitude?: number | null;
          longitude?: number | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          image_url: string;
          is_primary: boolean;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          image_url: string;
          is_primary?: boolean;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          image_url?: string;
          is_primary?: boolean;
          display_order?: number;
          created_at?: string;
        };
      };
      wishlists: {
        Row: {
          id: string;
          customer_id: string;
          product_id: string;
          added_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          product_id: string;
          added_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          product_id?: string;
          added_at?: string;
        };
      };
      search_history: {
        Row: {
          id: string;
          user_id: string;
          query: string;
          filters: Json;
          results_count: number | null;
          searched_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          query: string;
          filters?: Json;
          results_count?: number | null;
          searched_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          query?: string;
          filters?: Json;
          results_count?: number | null;
          searched_at?: string;
        };
      };
      product_views: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          viewed_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          viewed_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          viewed_at?: string;
        };
      };
      retailer_wholesaler_relationships: {
        Row: {
          id: string;
          retailer_id: string;
          wholesaler_id: string;
          status: "pending" | "approved" | "rejected";
          created_at: string;
          approved_at: string | null;
        };
        Insert: {
          id?: string;
          retailer_id: string;
          wholesaler_id: string;
          status?: "pending" | "approved" | "rejected";
          created_at?: string;
          approved_at?: string | null;
        };
        Update: {
          id?: string;
          retailer_id?: string;
          wholesaler_id?: string;
          status?: "pending" | "approved" | "rejected";
          created_at?: string;
          approved_at?: string | null;
        };
      };
      delivery_assignments: {
        Row: {
          id: string;
          order_id: string;
          delivery_person_id: string;
          status:
            | "assigned"
            | "accepted"
            | "rejected"
            | "picked_up"
            | "in_transit"
            | "delivered"
            | "failed";
          assigned_at: string;
          accepted_at: string | null;
          picked_up_at: string | null;
          delivered_at: string | null;
          rejection_reason: string | null;
          delivery_notes: string | null;
        };
        Insert: {
          id?: string;
          order_id: string;
          delivery_person_id: string;
          status?:
            | "assigned"
            | "accepted"
            | "rejected"
            | "picked_up"
            | "in_transit"
            | "delivered"
            | "failed";
          assigned_at?: string;
          accepted_at?: string | null;
          picked_up_at?: string | null;
          delivered_at?: string | null;
          rejection_reason?: string | null;
          delivery_notes?: string | null;
        };
        Update: {
          id?: string;
          order_id?: string;
          delivery_person_id?: string;
          status?:
            | "assigned"
            | "accepted"
            | "rejected"
            | "picked_up"
            | "in_transit"
            | "delivered"
            | "failed";
          assigned_at?: string;
          accepted_at?: string | null;
          picked_up_at?: string | null;
          delivered_at?: string | null;
          rejection_reason?: string | null;
          delivery_notes?: string | null;
        };
      };
    };
  };
}
