export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      item_addons: {
        Row: {
          created_at: string | null
          id: string
          name: string
          price: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          price: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          price?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      item_addons_map: {
        Row: {
          addon_id: string | null
          created_at: string | null
          id: string
          item_id: string | null
        }
        Insert: {
          addon_id?: string | null
          created_at?: string | null
          id?: string
          item_id?: string | null
        }
        Update: {
          addon_id?: string | null
          created_at?: string | null
          id?: string
          item_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "item_addons_map_addon_id_fkey"
            columns: ["addon_id"]
            isOneToOne: false
            referencedRelation: "item_addons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_addons_map_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      item_variations: {
        Row: {
          created_at: string | null
          id: string
          item_id: string | null
          name: string
          price_adjustment: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_id?: string | null
          name: string
          price_adjustment?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          item_id?: string | null
          name?: string
          price_adjustment?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "item_variations_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          category_id: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_available: boolean | null
          name: string
          price: number
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          name: string
          price: number
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          name?: string
          price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "menu_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      order_item_addons: {
        Row: {
          addon_id: string | null
          created_at: string | null
          id: string
          order_item_id: string | null
          price: number
        }
        Insert: {
          addon_id?: string | null
          created_at?: string | null
          id?: string
          order_item_id?: string | null
          price: number
        }
        Update: {
          addon_id?: string | null
          created_at?: string | null
          id?: string
          order_item_id?: string | null
          price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_item_addons_addon_id_fkey"
            columns: ["addon_id"]
            isOneToOne: false
            referencedRelation: "item_addons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_item_addons_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          item_id: string | null
          notes: string | null
          order_id: string | null
          price: number
          quantity: number
          variation_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_id?: string | null
          notes?: string | null
          order_id?: string | null
          price: number
          quantity: number
          variation_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          item_id?: string | null
          notes?: string | null
          order_id?: string | null
          price?: number
          quantity?: number
          variation_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variation_id_fkey"
            columns: ["variation_id"]
            isOneToOne: false
            referencedRelation: "item_variations"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          id: string
          order_number: string | null
          status: string
          total_amount: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_number?: string | null
          status?: string
          total_amount: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          order_number?: string | null
          status?: string
          total_amount?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      pending_orders: {
        Row: {
          cart_items: Json
          created_at: string | null
          id: string
          order_number: string
          profiles: string | null
          status: string | null
          total_amount: number
        }
        Insert: {
          cart_items: Json
          created_at?: string | null
          id?: string
          order_number: string
          profiles?: string | null
          status?: string | null
          total_amount: number
        }
        Update: {
          cart_items?: Json
          created_at?: string | null
          id?: string
          order_number?: string
          profiles?: string | null
          status?: string | null
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "pending_orders_profiles_fkey"
            columns: ["profiles"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          created_at: string | null
          first_name: string | null
          id: string
          is_admin: boolean | null
          last_name: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          first_name?: string | null
          id: string
          is_admin?: boolean | null
          last_name?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          first_name?: string | null
          id?: string
          is_admin?: boolean | null
          last_name?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reservations: {
        Row: {
          created_at: string | null
          date: string
          email: string
          guests: number
          id: string
          name: string
          notes: string | null
          phone: string
          status: string | null
          time: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          email: string
          guests: number
          id?: string
          name: string
          notes?: string | null
          phone: string
          status?: string | null
          time: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          email?: string
          guests?: number
          id?: string
          name?: string
          notes?: string | null
          phone?: string
          status?: string | null
          time?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      restaurant_settings: {
        Row: {
          created_at: string | null
          email_notifications: boolean | null
          id: string
          logo_url: string | null
          marketing_emails: boolean | null
          order_confirmations: boolean | null
          restaurant_address: string | null
          restaurant_email: string | null
          restaurant_name: string
          restaurant_phone: string | null
          social_facebook: string | null
          social_instagram: string | null
          social_twitter: string | null
          updated_at: string | null
          working_hours_weekday: string | null
          working_hours_weekend: string | null
        }
        Insert: {
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          logo_url?: string | null
          marketing_emails?: boolean | null
          order_confirmations?: boolean | null
          restaurant_address?: string | null
          restaurant_email?: string | null
          restaurant_name: string
          restaurant_phone?: string | null
          social_facebook?: string | null
          social_instagram?: string | null
          social_twitter?: string | null
          updated_at?: string | null
          working_hours_weekday?: string | null
          working_hours_weekend?: string | null
        }
        Update: {
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          logo_url?: string | null
          marketing_emails?: boolean | null
          order_confirmations?: boolean | null
          restaurant_address?: string | null
          restaurant_email?: string | null
          restaurant_name?: string
          restaurant_phone?: string | null
          social_facebook?: string | null
          social_instagram?: string | null
          social_twitter?: string | null
          updated_at?: string | null
          working_hours_weekday?: string | null
          working_hours_weekend?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
