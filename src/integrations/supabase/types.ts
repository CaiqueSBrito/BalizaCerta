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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      connections: {
        Row: {
          contacted_at: string
          id: string
          instructor_id: string
          student_id: string
        }
        Insert: {
          contacted_at?: string
          id?: string
          instructor_id: string
          student_id: string
        }
        Update: {
          contacted_at?: string
          id?: string
          instructor_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "connections_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "instructors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connections_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "instructors_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connections_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      instructors: {
        Row: {
          bio: string | null
          city: string | null
          cnh_category: Database["public"]["Enums"]["cnh_category"][]
          cnh_years: number
          created_at: string
          detran_certificate: string | null
          has_vehicle: boolean
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          plan: Database["public"]["Enums"]["instructor_plan"]
          price_per_hour: number
          profile_id: string
          rating: number | null
          review_count: number | null
          specialties: string[] | null
          state: string | null
          updated_at: string
        }
        Insert: {
          bio?: string | null
          city?: string | null
          cnh_category?: Database["public"]["Enums"]["cnh_category"][]
          cnh_years?: number
          created_at?: string
          detran_certificate?: string | null
          has_vehicle?: boolean
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          plan?: Database["public"]["Enums"]["instructor_plan"]
          price_per_hour?: number
          profile_id: string
          rating?: number | null
          review_count?: number | null
          specialties?: string[] | null
          state?: string | null
          updated_at?: string
        }
        Update: {
          bio?: string | null
          city?: string | null
          cnh_category?: Database["public"]["Enums"]["cnh_category"][]
          cnh_years?: number
          created_at?: string
          detran_certificate?: string | null
          has_vehicle?: boolean
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          plan?: Database["public"]["Enums"]["instructor_plan"]
          price_per_hour?: number
          profile_id?: string
          rating?: number | null
          review_count?: number | null
          specialties?: string[] | null
          state?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "instructors_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age: number | null
          avatar_url: string | null
          cpf: string | null
          created_at: string
          email: string
          first_name: string | null
          full_name: string
          id: string
          last_name: string | null
          phone: string | null
          updated_at: string
          user_type: Database["public"]["Enums"]["user_type"]
          whatsapp: string | null
        }
        Insert: {
          age?: number | null
          avatar_url?: string | null
          cpf?: string | null
          created_at?: string
          email: string
          first_name?: string | null
          full_name: string
          id: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
          user_type?: Database["public"]["Enums"]["user_type"]
          whatsapp?: string | null
        }
        Update: {
          age?: number | null
          avatar_url?: string | null
          cpf?: string | null
          created_at?: string
          email?: string
          first_name?: string | null
          full_name?: string
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
          user_type?: Database["public"]["Enums"]["user_type"]
          whatsapp?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      instructors_public: {
        Row: {
          avatar_url: string | null
          bio: string | null
          city: string | null
          cnh_category: Database["public"]["Enums"]["cnh_category"][] | null
          cnh_years: number | null
          created_at: string | null
          first_name: string | null
          has_vehicle: boolean | null
          id: string | null
          is_active: boolean | null
          is_verified: boolean | null
          last_name: string | null
          plan: Database["public"]["Enums"]["instructor_plan"] | null
          price_per_hour: number | null
          rating: number | null
          review_count: number | null
          specialties: string[] | null
          state: string | null
          whatsapp_masked: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      contact_instructor: { Args: { p_instructor_id: string }; Returns: string }
      get_instructor_by_id: {
        Args: { p_instructor_id: string }
        Returns: {
          avatar_url: string
          bio: string
          city: string
          cnh_category: Database["public"]["Enums"]["cnh_category"][]
          cnh_years: number
          created_at: string
          detran_certificate: string
          first_name: string
          has_vehicle: boolean
          id: string
          is_active: boolean
          is_verified: boolean
          last_name: string
          plan: Database["public"]["Enums"]["instructor_plan"]
          price_per_hour: number
          profile_id: string
          rating: number
          review_count: number
          specialties: string[]
          state: string
          whatsapp_masked: string
        }[]
      }
      get_instructor_whatsapp: {
        Args: { p_instructor_id: string }
        Returns: string
      }
      get_instructors_public: {
        Args: { p_is_active?: boolean }
        Returns: {
          avatar_url: string
          bio: string
          city: string
          cnh_category: Database["public"]["Enums"]["cnh_category"][]
          cnh_years: number
          created_at: string
          first_name: string
          has_vehicle: boolean
          id: string
          is_active: boolean
          is_verified: boolean
          last_name: string
          plan: Database["public"]["Enums"]["instructor_plan"]
          price_per_hour: number
          profile_id: string
          rating: number
          review_count: number
          specialties: string[]
          state: string
          whatsapp_masked: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      validate_cpf: { Args: { cpf: string }; Returns: boolean }
      validate_whatsapp: { Args: { phone: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      cnh_category: "A" | "B" | "AB" | "C" | "D" | "E"
      instructor_plan: "free" | "pro"
      user_type: "student" | "instructor"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
      cnh_category: ["A", "B", "AB", "C", "D", "E"],
      instructor_plan: ["free", "pro"],
      user_type: ["student", "instructor"],
    },
  },
} as const
