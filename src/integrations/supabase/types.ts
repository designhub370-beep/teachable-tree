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
      admissions: {
        Row: {
          class_name: string
          contacted: boolean
          created_at: string
          id: string
          message: string
          parent_name: string
          phone: string
          student_name: string
        }
        Insert: {
          class_name?: string
          contacted?: boolean
          created_at?: string
          id?: string
          message?: string
          parent_name?: string
          phone: string
          student_name: string
        }
        Update: {
          class_name?: string
          contacted?: boolean
          created_at?: string
          id?: string
          message?: string
          parent_name?: string
          phone?: string
          student_name?: string
        }
        Relationships: []
      }
      ai_messages: {
        Row: {
          ai_message_id: string
          created_at: string
          id: string
          message: Json
          role: string
          thread_id: string
          user_id: string
        }
        Insert: {
          ai_message_id: string
          created_at?: string
          id?: string
          message: Json
          role: string
          thread_id: string
          user_id: string
        }
        Update: {
          ai_message_id?: string
          created_at?: string
          id?: string
          message?: Json
          role?: string
          thread_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "ai_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_threads: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      classes: {
        Row: {
          category: string
          created_at: string
          description: string
          duration: string
          id: string
          name: string
          original_price: number | null
          sale_label: string
          sale_price: number
          sort_order: number
          subjects: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string
          duration?: string
          id?: string
          name: string
          original_price?: number | null
          sale_label?: string
          sale_price?: number
          sort_order?: number
          subjects?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          duration?: string
          id?: string
          name?: string
          original_price?: number | null
          sale_label?: string
          sale_price?: number
          sort_order?: number
          subjects?: string
        }
        Relationships: []
      }
      event_registrations: {
        Row: {
          age: number | null
          class_name: string
          created_at: string
          event_id: string
          id: string
          phone: string
          student_name: string
        }
        Insert: {
          age?: number | null
          class_name?: string
          created_at?: string
          event_id: string
          id?: string
          phone: string
          student_name: string
        }
        Update: {
          age?: number | null
          class_name?: string
          created_at?: string
          event_id?: string
          id?: string
          phone?: string
          student_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          age_rule: string
          class_range: string
          created_at: string
          description: string
          event_date: string | null
          id: string
          photo_paths: string[]
          rules: string
          status: string
          title: string
        }
        Insert: {
          age_rule?: string
          class_range?: string
          created_at?: string
          description?: string
          event_date?: string | null
          id?: string
          photo_paths?: string[]
          rules?: string
          status?: string
          title: string
        }
        Update: {
          age_rule?: string
          class_range?: string
          created_at?: string
          description?: string
          event_date?: string | null
          id?: string
          photo_paths?: string[]
          rules?: string
          status?: string
          title?: string
        }
        Relationships: []
      }
      materials: {
        Row: {
          class_name: string
          created_at: string
          description: string
          file_path: string
          file_url: string
          id: string
          kind: string
          subject: string
          title: string
          uploaded_by: string
        }
        Insert: {
          class_name?: string
          created_at?: string
          description?: string
          file_path: string
          file_url: string
          id?: string
          kind?: string
          subject?: string
          title: string
          uploaded_by?: string
        }
        Update: {
          class_name?: string
          created_at?: string
          description?: string
          file_path?: string
          file_url?: string
          id?: string
          kind?: string
          subject?: string
          title?: string
          uploaded_by?: string
        }
        Relationships: []
      }
      teachers: {
        Row: {
          created_at: string
          id: string
          name: string
          photo_path: string
          qualification: string
          sections: Json
          sort_order: number
          subjects: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          photo_path?: string
          qualification?: string
          sections?: Json
          sort_order?: number
          subjects?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          photo_path?: string
          qualification?: string
          sections?: Json
          sort_order?: number
          subjects?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
