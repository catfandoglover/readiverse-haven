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
      book_questions: {
        Row: {
          book_id: string
          created_at: string
          question_id: string
          randomizer: number
        }
        Insert: {
          book_id: string
          created_at?: string
          question_id: string
          randomizer?: number
        }
        Update: {
          book_id?: string
          created_at?: string
          question_id?: string
          randomizer?: number
        }
        Relationships: [
          {
            foreignKeyName: "book_questions_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_questions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "great_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      books: {
        Row: {
          author: string | null
          categories: string[] | null
          Cover_super: string | null
          cover_url: string | null
          created_at: string
          epub_file_url: string
          id: string
          Notion_URL: string | null
          randomizer: number | null
          slug: string
          title: string
        }
        Insert: {
          author?: string | null
          categories?: string[] | null
          Cover_super?: string | null
          cover_url?: string | null
          created_at?: string
          epub_file_url: string
          id?: string
          Notion_URL?: string | null
          randomizer?: number | null
          slug: string
          title: string
        }
        Update: {
          author?: string | null
          categories?: string[] | null
          Cover_super?: string | null
          cover_url?: string | null
          created_at?: string
          epub_file_url?: string
          id?: string
          Notion_URL?: string | null
          randomizer?: number | null
          slug?: string
          title?: string
        }
        Relationships: []
      }
      external_links: {
        Row: {
          created_at: string
          id: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          url?: string
        }
        Relationships: []
      }
      great_questions: {
        Row: {
          category: string
          category_number: string | null
          created_at: string
          id: string
          illustration: string
          notion_id: string
          question: string
          related_classics: string[] | null
        }
        Insert: {
          category: string
          category_number?: string | null
          created_at?: string
          id?: string
          illustration: string
          notion_id: string
          question: string
          related_classics?: string[] | null
        }
        Update: {
          category?: string
          category_number?: string | null
          created_at?: string
          id?: string
          illustration?: string
          notion_id?: string
          question?: string
          related_classics?: string[] | null
        }
        Relationships: []
      }
      icons: {
        Row: {
          category: string
          created_at: string
          id: string
          illustration: string
          name: string
          randomizer: number
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          illustration: string
          name: string
          randomizer?: number
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          illustration?: string
          name?: string
          randomizer?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          outseta_user_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          outseta_user_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          outseta_user_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      reading_list_books: {
        Row: {
          added_at: string
          book_id: string
          reading_list_id: string
        }
        Insert: {
          added_at?: string
          book_id: string
          reading_list_id: string
        }
        Update: {
          added_at?: string
          book_id?: string
          reading_list_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reading_list_books_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reading_list_books_reading_list_id_fkey"
            columns: ["reading_list_id"]
            isOneToOne: false
            referencedRelation: "reading_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      reading_lists: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      reading_progress: {
        Row: {
          book_id: string
          created_at: string
          device_id: string
          id: string
          position: number
          updated_at: string
        }
        Insert: {
          book_id: string
          created_at?: string
          device_id: string
          id?: string
          position: number
          updated_at?: string
        }
        Update: {
          book_id?: string
          created_at?: string
          device_id?: string
          id?: string
          position?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reading_progress_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      user_library: {
        Row: {
          added_at: string
          book_id: string
          id: string
          user_id: string
        }
        Insert: {
          added_at?: string
          book_id: string
          id?: string
          user_id: string
        }
        Update: {
          added_at?: string
          book_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_library_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      question_category:
        | "AESTHETICS"
        | "EPISTEMOLOGY"
        | "ETHICS"
        | "ONTOLOGY"
        | "POLITICS"
        | "THEOLOGY"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
