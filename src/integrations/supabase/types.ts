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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      characters: {
        Row: {
          age: number | null
          avatar: string | null
          biography: string
          character_instructions: string
          clothing_style: string | null
          conversation_examples: string
          created_at: string
          description: string
          display_name: string | null
          eye_color: string | null
          forbidden_behaviors: string
          gender: string | null
          greeting: string | null
          hair_color: string | null
          height_cm: number | null
          hidden_instructions: string
          id: string
          interests: string[]
          is_featured: boolean
          is_hidden: boolean
          is_new: boolean
          is_premium: boolean
          language: string
          memory_birthdays: boolean
          memory_favorite_topics: boolean
          memory_past_conversations: boolean
          memory_preferences: boolean
          memory_user_name: boolean
          name: string
          nationality: string | null
          personality: string
          profession: string | null
          slug: string
          status: Database["public"]["Enums"]["character_status"]
          style_asks_questions: number
          style_emoji_usage: number
          style_formality: number
          style_gif_usage: number
          style_message_length: string
          style_nickname_usage: number
          style_typing_speed: number
          system_prompt: string
          tagline: string | null
          tags: string[]
          trait_caring: number
          trait_confident: number
          trait_curious: number
          trait_dominant: number
          trait_emotional: number
          trait_flirty: number
          trait_funny: number
          trait_intelligent: number
          trait_jealous: number
          trait_playful: number
          trait_romantic: number
          trait_shy: number
          updated_at: string
        }
        Insert: {
          age?: number | null
          avatar?: string | null
          biography?: string
          character_instructions?: string
          clothing_style?: string | null
          conversation_examples?: string
          created_at?: string
          description?: string
          display_name?: string | null
          eye_color?: string | null
          forbidden_behaviors?: string
          gender?: string | null
          greeting?: string | null
          hair_color?: string | null
          height_cm?: number | null
          hidden_instructions?: string
          id?: string
          interests?: string[]
          is_featured?: boolean
          is_hidden?: boolean
          is_new?: boolean
          is_premium?: boolean
          language?: string
          memory_birthdays?: boolean
          memory_favorite_topics?: boolean
          memory_past_conversations?: boolean
          memory_preferences?: boolean
          memory_user_name?: boolean
          name: string
          nationality?: string | null
          personality?: string
          profession?: string | null
          slug: string
          status?: Database["public"]["Enums"]["character_status"]
          style_asks_questions?: number
          style_emoji_usage?: number
          style_formality?: number
          style_gif_usage?: number
          style_message_length?: string
          style_nickname_usage?: number
          style_typing_speed?: number
          system_prompt?: string
          tagline?: string | null
          tags?: string[]
          trait_caring?: number
          trait_confident?: number
          trait_curious?: number
          trait_dominant?: number
          trait_emotional?: number
          trait_flirty?: number
          trait_funny?: number
          trait_intelligent?: number
          trait_jealous?: number
          trait_playful?: number
          trait_romantic?: number
          trait_shy?: number
          updated_at?: string
        }
        Update: {
          age?: number | null
          avatar?: string | null
          biography?: string
          character_instructions?: string
          clothing_style?: string | null
          conversation_examples?: string
          created_at?: string
          description?: string
          display_name?: string | null
          eye_color?: string | null
          forbidden_behaviors?: string
          gender?: string | null
          greeting?: string | null
          hair_color?: string | null
          height_cm?: number | null
          hidden_instructions?: string
          id?: string
          interests?: string[]
          is_featured?: boolean
          is_hidden?: boolean
          is_new?: boolean
          is_premium?: boolean
          language?: string
          memory_birthdays?: boolean
          memory_favorite_topics?: boolean
          memory_past_conversations?: boolean
          memory_preferences?: boolean
          memory_user_name?: boolean
          name?: string
          nationality?: string | null
          personality?: string
          profession?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["character_status"]
          style_asks_questions?: number
          style_emoji_usage?: number
          style_formality?: number
          style_gif_usage?: number
          style_message_length?: string
          style_nickname_usage?: number
          style_typing_speed?: number
          system_prompt?: string
          tagline?: string | null
          tags?: string[]
          trait_caring?: number
          trait_confident?: number
          trait_curious?: number
          trait_dominant?: number
          trait_emotional?: number
          trait_flirty?: number
          trait_funny?: number
          trait_intelligent?: number
          trait_jealous?: number
          trait_playful?: number
          trait_romantic?: number
          trait_shy?: number
          updated_at?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          character_id: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          character_id: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          character_id?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "public_characters"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          type: Database["public"]["Enums"]["credit_transaction_type"]
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          type: Database["public"]["Enums"]["credit_transaction_type"]
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          type?: Database["public"]["Enums"]["credit_transaction_type"]
          user_id?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          character_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          character_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          character_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "public_characters"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          conversation_id: string
          id: string
          message: string
          sender: Database["public"]["Enums"]["message_sender"]
          timestamp: string
        }
        Insert: {
          conversation_id: string
          id?: string
          message: string
          sender: Database["public"]["Enums"]["message_sender"]
          timestamp?: string
        }
        Update: {
          conversation_id?: string
          id?: string
          message?: string
          sender?: Database["public"]["Enums"]["message_sender"]
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar: string | null
          created_at: string
          credits: number
          email: string
          id: string
          subscription: Database["public"]["Enums"]["subscription_tier"]
          updated_at: string
          username: string
        }
        Insert: {
          avatar?: string | null
          created_at?: string
          credits?: number
          email: string
          id: string
          subscription?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
          username: string
        }
        Update: {
          avatar?: string | null
          created_at?: string
          credits?: number
          email?: string
          id?: string
          subscription?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
          username?: string
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
      public_characters: {
        Row: {
          age: number | null
          avatar: string | null
          biography: string | null
          clothing_style: string | null
          created_at: string | null
          description: string | null
          display_name: string | null
          eye_color: string | null
          gender: string | null
          greeting: string | null
          hair_color: string | null
          height_cm: number | null
          id: string | null
          interests: string[] | null
          is_featured: boolean | null
          is_new: boolean | null
          is_premium: boolean | null
          language: string | null
          name: string | null
          nationality: string | null
          personality: string | null
          profession: string | null
          slug: string | null
          status: Database["public"]["Enums"]["character_status"] | null
          tagline: string | null
          tags: string[] | null
        }
        Insert: {
          age?: number | null
          avatar?: string | null
          biography?: string | null
          clothing_style?: string | null
          created_at?: string | null
          description?: string | null
          display_name?: string | null
          eye_color?: string | null
          gender?: string | null
          greeting?: string | null
          hair_color?: string | null
          height_cm?: number | null
          id?: string | null
          interests?: string[] | null
          is_featured?: boolean | null
          is_new?: boolean | null
          is_premium?: boolean | null
          language?: string | null
          name?: string | null
          nationality?: string | null
          personality?: string | null
          profession?: string | null
          slug?: string | null
          status?: Database["public"]["Enums"]["character_status"] | null
          tagline?: string | null
          tags?: string[] | null
        }
        Update: {
          age?: number | null
          avatar?: string | null
          biography?: string | null
          clothing_style?: string | null
          created_at?: string | null
          description?: string | null
          display_name?: string | null
          eye_color?: string | null
          gender?: string | null
          greeting?: string | null
          hair_color?: string | null
          height_cm?: number | null
          id?: string | null
          interests?: string[] | null
          is_featured?: boolean | null
          is_new?: boolean | null
          is_premium?: boolean | null
          language?: string | null
          name?: string | null
          nationality?: string | null
          personality?: string | null
          profession?: string | null
          slug?: string | null
          status?: Database["public"]["Enums"]["character_status"] | null
          tagline?: string | null
          tags?: string[] | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      character_status: "active" | "draft" | "archived"
      credit_transaction_type: "purchase" | "spend" | "bonus" | "refund"
      message_sender: "user" | "character"
      subscription_tier: "free" | "starter" | "premium" | "vip"
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
      app_role: ["admin", "user"],
      character_status: ["active", "draft", "archived"],
      credit_transaction_type: ["purchase", "spend", "bonus", "refund"],
      message_sender: ["user", "character"],
      subscription_tier: ["free", "starter", "premium", "vip"],
    },
  },
} as const
