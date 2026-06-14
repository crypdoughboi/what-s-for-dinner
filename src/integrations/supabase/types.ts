export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          color: string | null
          created_at: string
          icon: string | null
          id: string
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      household_members: {
        Row: {
          access_level: string
          created_at: string
          household_id: string
          id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_level?: string
          created_at?: string
          household_id: string
          id?: string
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_level?: string
          created_at?: string
          household_id?: string
          id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "household_members_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      households: {
        Row: {
          created_at: string
          id: string
          invite_code: string
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          invite_code: string
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          invite_code?: string
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      inventory_items: {
        Row: {
          category_id: string | null
          created_at: string
          expiration_date: string | null
          household_id: string | null
          id: string
          location_id: string | null
          name: string
          notes: string | null
          owner_id: string
          quantity: number
          recently_added: boolean
          tags: string[]
          unit: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          expiration_date?: string | null
          household_id?: string | null
          id?: string
          location_id?: string | null
          name: string
          notes?: string | null
          owner_id: string
          quantity?: number
          recently_added?: boolean
          tags?: string[]
          unit?: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          expiration_date?: string | null
          household_id?: string | null
          id?: string
          location_id?: string | null
          name?: string
          notes?: string | null
          owner_id?: string
          quantity?: number
          recently_added?: boolean
          tags?: string[]
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_items_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_items_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          created_at: string
          household_id: string | null
          icon: string | null
          id: string
          is_default: boolean
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          household_id?: string | null
          icon?: string | null
          id?: string
          is_default?: boolean
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          household_id?: string | null
          icon?: string | null
          id?: string
          is_default?: boolean
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "locations_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_ideas: {
        Row: {
          cooking_method: string | null
          created_at: string
          description: string | null
          difficulty: string | null
          expiring_used: string[]
          id: string
          image_url: string | null
          ingredients: Json
          instructions: Json
          is_generated: boolean
          name: string
          owner_id: string
          servings: number
          substitutions: Json
          total_minutes: number | null
          updated_at: string
          vibe: string | null
        }
        Insert: {
          cooking_method?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          expiring_used?: string[]
          id?: string
          image_url?: string | null
          ingredients?: Json
          instructions?: Json
          is_generated?: boolean
          name: string
          owner_id: string
          servings?: number
          substitutions?: Json
          total_minutes?: number | null
          updated_at?: string
          vibe?: string | null
        }
        Update: {
          cooking_method?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          expiring_used?: string[]
          id?: string
          image_url?: string | null
          ingredients?: Json
          instructions?: Json
          is_generated?: boolean
          name?: string
          owner_id?: string
          servings?: number
          substitutions?: Json
          total_minutes?: number | null
          updated_at?: string
          vibe?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          default_servings: number
          dietary_preferences: string[]
          display_name: string | null
          id: string
          is_guest: boolean
          skill_level: string
          theme: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          default_servings?: number
          dietary_preferences?: string[]
          display_name?: string | null
          id: string
          is_guest?: boolean
          skill_level?: string
          theme?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          default_servings?: number
          dietary_preferences?: string[]
          display_name?: string | null
          id?: string
          is_guest?: boolean
          skill_level?: string
          theme?: string
          updated_at?: string
        }
        Relationships: []
      }
      reminder_settings: {
        Row: {
          created_at: string
          expired_summary: boolean
          expiring_three_days: boolean
          expiring_tomorrow: boolean
          household_invite_accepted: boolean
          id: string
          owner_id: string
          updated_at: string
          weekly_meal_ideas: boolean
        }
        Insert: {
          created_at?: string
          expired_summary?: boolean
          expiring_three_days?: boolean
          expiring_tomorrow?: boolean
          household_invite_accepted?: boolean
          id?: string
          owner_id: string
          updated_at?: string
          weekly_meal_ideas?: boolean
        }
        Update: {
          created_at?: string
          expired_summary?: boolean
          expiring_three_days?: boolean
          expiring_tomorrow?: boolean
          household_invite_accepted?: boolean
          id?: string
          owner_id?: string
          updated_at?: string
          weekly_meal_ideas?: boolean
        }
        Relationships: []
      }
      saved_meals: {
        Row: {
          created_at: string
          id: string
          meal_id: string
          owner_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          meal_id: string
          owner_id: string
        }
        Update: {
          created_at?: string
          id?: string
          meal_id?: string
          owner_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_meals_meal_id_fkey"
            columns: ["meal_id"]
            isOneToOne: false
            referencedRelation: "meal_ideas"
            referencedColumns: ["id"]
          },
        ]
      }
      shopping_list_items: {
        Row: {
          category: string
          checked: boolean
          created_at: string
          household_id: string | null
          id: string
          name: string
          owner_id: string
          quantity: number
          source_meal_id: string | null
          unit: string
          updated_at: string
        }
        Insert: {
          category?: string
          checked?: boolean
          created_at?: string
          household_id?: string | null
          id?: string
          name: string
          owner_id: string
          quantity?: number
          source_meal_id?: string | null
          unit?: string
          updated_at?: string
        }
        Update: {
          category?: string
          checked?: boolean
          created_at?: string
          household_id?: string | null
          id?: string
          name?: string
          owner_id?: string
          quantity?: number
          source_meal_id?: string | null
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shopping_list_items_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shopping_list_items_source_meal_id_fkey"
            columns: ["source_meal_id"]
            isOneToOne: false
            referencedRelation: "meal_ideas"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_edit_household: { Args: { _household_id: string }; Returns: boolean }
      can_view_household: { Args: { _household_id: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
