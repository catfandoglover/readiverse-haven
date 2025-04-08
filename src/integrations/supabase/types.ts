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
      archetypes: {
        Row: {
          archetype: string | null
          created_at: string
          id: number
          landscape_image: string | null
        }
        Insert: {
          archetype?: string | null
          created_at?: string
          id?: number
          landscape_image?: string | null
        }
        Update: {
          archetype?: string | null
          created_at?: string
          id?: number
          landscape_image?: string | null
        }
        Relationships: []
      }
      art: {
        Row: {
          about: string | null
          art_file_url: string
          author: string | null
          created_at: string
          icon_illustration: string | null
          id: string
          introduction: string | null
          Notion_URL: string | null
          randomizer: number | null
          slug: string
          title: string
        }
        Insert: {
          about?: string | null
          art_file_url: string
          author?: string | null
          created_at?: string
          icon_illustration?: string | null
          id?: string
          introduction?: string | null
          Notion_URL?: string | null
          randomizer?: number | null
          slug: string
          title: string
        }
        Update: {
          about?: string | null
          art_file_url?: string
          author?: string | null
          created_at?: string
          icon_illustration?: string | null
          id?: string
          introduction?: string | null
          Notion_URL?: string | null
          randomizer?: number | null
          slug?: string
          title?: string
        }
        Relationships: []
      }
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
      bookings: {
        Row: {
          booking_type_id: string
          created_at: string
          email: string
          id: string
          name: string
          status: string
          stripe_session_id: string
          tidycal_booking_id: string | null
          time_slot_id: string
          timezone: string
          updated_at: string
        }
        Insert: {
          booking_type_id: string
          created_at?: string
          email: string
          id?: string
          name: string
          status?: string
          stripe_session_id: string
          tidycal_booking_id?: string | null
          time_slot_id: string
          timezone: string
          updated_at?: string
        }
        Update: {
          booking_type_id?: string
          created_at?: string
          email?: string
          id?: string
          name?: string
          status?: string
          stripe_session_id?: string
          tidycal_booking_id?: string | null
          time_slot_id?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      books: {
        Row: {
          about: string | null
          amazon_link: string | null
          author: string | null
          author_id: string | null
          bookshop_link: string | null
          categories: string[] | null
          city_published: string | null
          country_published: string | null
          Cover_super: string | null
          cover_url: string | null
          created_at: string
          epub_file_url: string | null
          great_question_connection: string | null
          icon_illustration: string | null
          id: string
          introduction: string | null
          Notion_URL: string | null
          randomizer: number | null
          slug: string
          source: string | null
          title: string
        }
        Insert: {
          about?: string | null
          amazon_link?: string | null
          author?: string | null
          author_id?: string | null
          bookshop_link?: string | null
          categories?: string[] | null
          city_published?: string | null
          country_published?: string | null
          Cover_super?: string | null
          cover_url?: string | null
          created_at?: string
          epub_file_url?: string | null
          great_question_connection?: string | null
          icon_illustration?: string | null
          id?: string
          introduction?: string | null
          Notion_URL?: string | null
          randomizer?: number | null
          slug: string
          source?: string | null
          title: string
        }
        Update: {
          about?: string | null
          amazon_link?: string | null
          author?: string | null
          author_id?: string | null
          bookshop_link?: string | null
          categories?: string[] | null
          city_published?: string | null
          country_published?: string | null
          Cover_super?: string | null
          cover_url?: string | null
          created_at?: string
          epub_file_url?: string | null
          great_question_connection?: string | null
          icon_illustration?: string | null
          id?: string
          introduction?: string | null
          Notion_URL?: string | null
          randomizer?: number | null
          slug?: string
          source?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "books_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "icons"
            referencedColumns: ["id"]
          },
        ]
      }
      concepts: {
        Row: {
          about: string | null
          concept_type: string | null
          created_at: string
          great_conversation: string | null
          id: string
          illustration: string
          introduction: string | null
          Notion_URL: string | null
          randomizer: number
          slug: string | null
          title: string
        }
        Insert: {
          about?: string | null
          concept_type?: string | null
          created_at?: string
          great_conversation?: string | null
          id?: string
          illustration: string
          introduction?: string | null
          Notion_URL?: string | null
          randomizer?: number
          slug?: string | null
          title: string
        }
        Update: {
          about?: string | null
          concept_type?: string | null
          created_at?: string
          great_conversation?: string | null
          id?: string
          illustration?: string
          introduction?: string | null
          Notion_URL?: string | null
          randomizer?: number
          slug?: string | null
          title?: string
        }
        Relationships: []
      }
      custom_domain_books: {
        Row: {
          book_id: string | null
          created_at: string
          domain_id: string
          id: string
          user_id: string
        }
        Insert: {
          book_id?: string | null
          created_at?: string
          domain_id: string
          id?: string
          user_id: string
        }
        Update: {
          book_id?: string | null
          created_at?: string
          domain_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_domain_books_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_domain_books_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "custom_domains"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_domains: {
        Row: {
          created_at: string
          id: string
          name: string
          outseta_user_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          outseta_user_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          outseta_user_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_custom_domains_profile"
            columns: ["outseta_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["outseta_user_id"]
          },
        ]
      }
      customers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string
          subscription_status: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id: string
          subscription_status?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string
          subscription_status?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      dna_analysis_results: {
        Row: {
          aesthetics_challenging_voice_1: string | null
          aesthetics_challenging_voice_1_classic: string | null
          aesthetics_challenging_voice_1_classic_db_id: string | null
          aesthetics_challenging_voice_1_db_id: string | null
          aesthetics_challenging_voice_1_rationale: string | null
          aesthetics_challenging_voice_2: string | null
          aesthetics_challenging_voice_2_classic: string | null
          aesthetics_challenging_voice_2_classic_db_id: string | null
          aesthetics_challenging_voice_2_db_id: string | null
          aesthetics_challenging_voice_2_rationale: string | null
          aesthetics_challenging_voice_3: string | null
          aesthetics_challenging_voice_3_classic: string | null
          aesthetics_challenging_voice_3_classic_db_id: string | null
          aesthetics_challenging_voice_3_db_id: string | null
          aesthetics_challenging_voice_3_rationale: string | null
          aesthetics_challenging_voice_4: string | null
          aesthetics_challenging_voice_4_classic: string | null
          aesthetics_challenging_voice_4_classic_db_id: string | null
          aesthetics_challenging_voice_4_db_id: string | null
          aesthetics_challenging_voice_4_rationale: string | null
          aesthetics_challenging_voice_5: string | null
          aesthetics_challenging_voice_5_classic: string | null
          aesthetics_challenging_voice_5_classic_db_id: string | null
          aesthetics_challenging_voice_5_db_id: string | null
          aesthetics_challenging_voice_5_rationale: string | null
          aesthetics_introduction: string | null
          aesthetics_kindred_spirit_1: string | null
          aesthetics_kindred_spirit_1_classic: string | null
          aesthetics_kindred_spirit_1_classic_db_id: string | null
          aesthetics_kindred_spirit_1_db_id: string | null
          aesthetics_kindred_spirit_1_rationale: string | null
          aesthetics_kindred_spirit_2: string | null
          aesthetics_kindred_spirit_2_classic: string | null
          aesthetics_kindred_spirit_2_classic_db_id: string | null
          aesthetics_kindred_spirit_2_db_id: string | null
          aesthetics_kindred_spirit_2_rationale: string | null
          aesthetics_kindred_spirit_3: string | null
          aesthetics_kindred_spirit_3_classic: string | null
          aesthetics_kindred_spirit_3_classic_db_id: string | null
          aesthetics_kindred_spirit_3_db_id: string | null
          aesthetics_kindred_spirit_3_rationale: string | null
          aesthetics_kindred_spirit_4: string | null
          aesthetics_kindred_spirit_4_classic: string | null
          aesthetics_kindred_spirit_4_classic_db_id: string | null
          aesthetics_kindred_spirit_4_db_id: string | null
          aesthetics_kindred_spirit_4_rationale: string | null
          aesthetics_kindred_spirit_5: string | null
          aesthetics_kindred_spirit_5_classic: string | null
          aesthetics_kindred_spirit_5_classic_db_id: string | null
          aesthetics_kindred_spirit_5_db_id: string | null
          aesthetics_kindred_spirit_5_rationale: string | null
          analysis_text: string | null
          analysis_type: Database["public"]["Enums"]["dna_result_type"]
          archetype: string | null
          archetype_definition: string | null
          assessment_id: string
          become_who_you_are: string | null
          conclusion: string | null
          created_at: string
          epistemology_challenging_voice_1: string | null
          epistemology_challenging_voice_1_classic: string | null
          epistemology_challenging_voice_1_classic_db_id: string | null
          epistemology_challenging_voice_1_db_id: string | null
          epistemology_challenging_voice_1_rationale: string | null
          epistemology_challenging_voice_2: string | null
          epistemology_challenging_voice_2_classic: string | null
          epistemology_challenging_voice_2_classic_db_id: string | null
          epistemology_challenging_voice_2_db_id: string | null
          epistemology_challenging_voice_2_rationale: string | null
          epistemology_challenging_voice_3: string | null
          epistemology_challenging_voice_3_classic: string | null
          epistemology_challenging_voice_3_classic_db_id: string | null
          epistemology_challenging_voice_3_db_id: string | null
          epistemology_challenging_voice_3_rationale: string | null
          epistemology_challenging_voice_4: string | null
          epistemology_challenging_voice_4_classic: string | null
          epistemology_challenging_voice_4_classic_db_id: string | null
          epistemology_challenging_voice_4_db_id: string | null
          epistemology_challenging_voice_4_rationale: string | null
          epistemology_challenging_voice_5: string | null
          epistemology_challenging_voice_5_classic: string | null
          epistemology_challenging_voice_5_classic_db_id: string | null
          epistemology_challenging_voice_5_db_id: string | null
          epistemology_challenging_voice_5_rationale: string | null
          epistemology_introduction: string | null
          epistemology_kindred_spirit_1: string | null
          epistemology_kindred_spirit_1_classic: string | null
          epistemology_kindred_spirit_1_classic_db_id: string | null
          epistemology_kindred_spirit_1_db_id: string | null
          epistemology_kindred_spirit_1_rationale: string | null
          epistemology_kindred_spirit_2: string | null
          epistemology_kindred_spirit_2_classic: string | null
          epistemology_kindred_spirit_2_classic_db_id: string | null
          epistemology_kindred_spirit_2_db_id: string | null
          epistemology_kindred_spirit_2_rationale: string | null
          epistemology_kindred_spirit_3: string | null
          epistemology_kindred_spirit_3_classic: string | null
          epistemology_kindred_spirit_3_classic_db_id: string | null
          epistemology_kindred_spirit_3_db_id: string | null
          epistemology_kindred_spirit_3_rationale: string | null
          epistemology_kindred_spirit_4: string | null
          epistemology_kindred_spirit_4_classic: string | null
          epistemology_kindred_spirit_4_classic_db_id: string | null
          epistemology_kindred_spirit_4_db_id: string | null
          epistemology_kindred_spirit_4_rationale: string | null
          epistemology_kindred_spirit_5: string | null
          epistemology_kindred_spirit_5_classic: string | null
          epistemology_kindred_spirit_5_classic_db_id: string | null
          epistemology_kindred_spirit_5_db_id: string | null
          epistemology_kindred_spirit_5_rationale: string | null
          ethics_challenging_voice_1: string | null
          ethics_challenging_voice_1_classic: string | null
          ethics_challenging_voice_1_classic_db_id: string | null
          ethics_challenging_voice_1_db_id: string | null
          ethics_challenging_voice_1_rationale: string | null
          ethics_challenging_voice_2: string | null
          ethics_challenging_voice_2_classic: string | null
          ethics_challenging_voice_2_classic_db_id: string | null
          ethics_challenging_voice_2_db_id: string | null
          ethics_challenging_voice_2_rationale: string | null
          ethics_challenging_voice_3: string | null
          ethics_challenging_voice_3_classic: string | null
          ethics_challenging_voice_3_classic_db_id: string | null
          ethics_challenging_voice_3_db_id: string | null
          ethics_challenging_voice_3_rationale: string | null
          ethics_challenging_voice_4: string | null
          ethics_challenging_voice_4_classic: string | null
          ethics_challenging_voice_4_classic_db_id: string | null
          ethics_challenging_voice_4_db_id: string | null
          ethics_challenging_voice_4_rationale: string | null
          ethics_challenging_voice_5: string | null
          ethics_challenging_voice_5_classic: string | null
          ethics_challenging_voice_5_classic_db_id: string | null
          ethics_challenging_voice_5_db_id: string | null
          ethics_challenging_voice_5_rationale: string | null
          ethics_introduction: string | null
          ethics_kindred_spirit_1: string | null
          ethics_kindred_spirit_1_classic: string | null
          ethics_kindred_spirit_1_classic_db_id: string | null
          ethics_kindred_spirit_1_db_id: string | null
          ethics_kindred_spirit_1_rationale: string | null
          ethics_kindred_spirit_2: string | null
          ethics_kindred_spirit_2_classic: string | null
          ethics_kindred_spirit_2_classic_db_id: string | null
          ethics_kindred_spirit_2_db_id: string | null
          ethics_kindred_spirit_2_rationale: string | null
          ethics_kindred_spirit_3: string | null
          ethics_kindred_spirit_3_classic: string | null
          ethics_kindred_spirit_3_classic_db_id: string | null
          ethics_kindred_spirit_3_db_id: string | null
          ethics_kindred_spirit_3_rationale: string | null
          ethics_kindred_spirit_4: string | null
          ethics_kindred_spirit_4_classic: string | null
          ethics_kindred_spirit_4_classic_db_id: string | null
          ethics_kindred_spirit_4_db_id: string | null
          ethics_kindred_spirit_4_rationale: string | null
          ethics_kindred_spirit_5: string | null
          ethics_kindred_spirit_5_classic: string | null
          ethics_kindred_spirit_5_classic_db_id: string | null
          ethics_kindred_spirit_5_db_id: string | null
          ethics_kindred_spirit_5_rationale: string | null
          growth_edges_1: string | null
          growth_edges_2: string | null
          growth_edges_3: string | null
          id: string
          introduction: string | null
          key_tension_1: string | null
          key_tension_2: string | null
          key_tension_3: string | null
          most_challenging_voice: string | null
          most_challenging_voice_db_id: string | null
          most_kindred_spirit: string | null
          most_kindred_spirit_db_id: string | null
          name: string | null
          natural_strength_1: string | null
          natural_strength_2: string | null
          natural_strength_3: string | null
          next_steps: string | null
          ontology_challenging_voice_1: string | null
          ontology_challenging_voice_1_classic: string | null
          ontology_challenging_voice_1_classic_db_id: string | null
          ontology_challenging_voice_1_db_id: string | null
          ontology_challenging_voice_1_rationale: string | null
          ontology_challenging_voice_2: string | null
          ontology_challenging_voice_2_classic: string | null
          ontology_challenging_voice_2_classic_db_id: string | null
          ontology_challenging_voice_2_db_id: string | null
          ontology_challenging_voice_2_rationale: string | null
          ontology_challenging_voice_3: string | null
          ontology_challenging_voice_3_classic: string | null
          ontology_challenging_voice_3_classic_db_id: string | null
          ontology_challenging_voice_3_db_id: string | null
          ontology_challenging_voice_3_rationale: string | null
          ontology_challenging_voice_4: string | null
          ontology_challenging_voice_4_classic: string | null
          ontology_challenging_voice_4_classic_db_id: string | null
          ontology_challenging_voice_4_db_id: string | null
          ontology_challenging_voice_4_rationale: string | null
          ontology_challenging_voice_5: string | null
          ontology_challenging_voice_5_classic: string | null
          ontology_challenging_voice_5_classic_db_id: string | null
          ontology_challenging_voice_5_db_id: string | null
          ontology_challenging_voice_5_rationale: string | null
          ontology_introduction: string | null
          ontology_kindred_spirit_1: string | null
          ontology_kindred_spirit_1_classic: string | null
          ontology_kindred_spirit_1_classic_db_id: string | null
          ontology_kindred_spirit_1_db_id: string | null
          ontology_kindred_spirit_1_rationale: string | null
          ontology_kindred_spirit_2: string | null
          ontology_kindred_spirit_2_classic: string | null
          ontology_kindred_spirit_2_classic_db_id: string | null
          ontology_kindred_spirit_2_db_id: string | null
          ontology_kindred_spirit_2_rationale: string | null
          ontology_kindred_spirit_3: string | null
          ontology_kindred_spirit_3_classic: string | null
          ontology_kindred_spirit_3_classic_db_id: string | null
          ontology_kindred_spirit_3_db_id: string | null
          ontology_kindred_spirit_3_rationale: string | null
          ontology_kindred_spirit_4: string | null
          ontology_kindred_spirit_4_classic: string | null
          ontology_kindred_spirit_4_classic_db_id: string | null
          ontology_kindred_spirit_4_db_id: string | null
          ontology_kindred_spirit_4_rationale: string | null
          ontology_kindred_spirit_5: string | null
          ontology_kindred_spirit_5_classic: string | null
          ontology_kindred_spirit_5_classic_db_id: string | null
          ontology_kindred_spirit_5_db_id: string | null
          ontology_kindred_spirit_5_rationale: string | null
          politics_challenging_voice_1: string | null
          politics_challenging_voice_1_classic: string | null
          politics_challenging_voice_1_classic_db_id: string | null
          politics_challenging_voice_1_db_id: string | null
          politics_challenging_voice_1_rationale: string | null
          politics_challenging_voice_2: string | null
          politics_challenging_voice_2_classic: string | null
          politics_challenging_voice_2_classic_db_id: string | null
          politics_challenging_voice_2_db_id: string | null
          politics_challenging_voice_2_rationale: string | null
          politics_challenging_voice_3: string | null
          politics_challenging_voice_3_classic: string | null
          politics_challenging_voice_3_classic_db_id: string | null
          politics_challenging_voice_3_db_id: string | null
          politics_challenging_voice_3_rationale: string | null
          politics_challenging_voice_4: string | null
          politics_challenging_voice_4_classic: string | null
          politics_challenging_voice_4_classic_db_id: string | null
          politics_challenging_voice_4_db_id: string | null
          politics_challenging_voice_4_rationale: string | null
          politics_challenging_voice_5: string | null
          politics_challenging_voice_5_classic: string | null
          politics_challenging_voice_5_classic_db_id: string | null
          politics_challenging_voice_5_db_id: string | null
          politics_challenging_voice_5_rationale: string | null
          politics_introduction: string | null
          politics_kindred_spirit_1: string | null
          politics_kindred_spirit_1_classic: string | null
          politics_kindred_spirit_1_classic_db_id: string | null
          politics_kindred_spirit_1_db_id: string | null
          politics_kindred_spirit_1_rationale: string | null
          politics_kindred_spirit_2: string | null
          politics_kindred_spirit_2_classic: string | null
          politics_kindred_spirit_2_classic_db_id: string | null
          politics_kindred_spirit_2_db_id: string | null
          politics_kindred_spirit_2_rationale: string | null
          politics_kindred_spirit_3: string | null
          politics_kindred_spirit_3_classic: string | null
          politics_kindred_spirit_3_classic_db_id: string | null
          politics_kindred_spirit_3_db_id: string | null
          politics_kindred_spirit_3_rationale: string | null
          politics_kindred_spirit_4: string | null
          politics_kindred_spirit_4_classic: string | null
          politics_kindred_spirit_4_classic_db_id: string | null
          politics_kindred_spirit_4_db_id: string | null
          politics_kindred_spirit_4_rationale: string | null
          politics_kindred_spirit_5: string | null
          politics_kindred_spirit_5_classic: string | null
          politics_kindred_spirit_5_classic_db_id: string | null
          politics_kindred_spirit_5_db_id: string | null
          politics_kindred_spirit_5_rationale: string | null
          profile_image_url: string | null
          raw_response: Json | null
          share_summary: string | null
          theology_challenging_voice_1: string | null
          theology_challenging_voice_1_classic: string | null
          theology_challenging_voice_1_classic_db_id: string | null
          theology_challenging_voice_1_db_id: string | null
          theology_challenging_voice_1_rationale: string | null
          theology_challenging_voice_2: string | null
          theology_challenging_voice_2_classic: string | null
          theology_challenging_voice_2_classic_db_id: string | null
          theology_challenging_voice_2_db_id: string | null
          theology_challenging_voice_2_rationale: string | null
          theology_challenging_voice_3: string | null
          theology_challenging_voice_3_classic: string | null
          theology_challenging_voice_3_classic_db_id: string | null
          theology_challenging_voice_3_db_id: string | null
          theology_challenging_voice_3_rationale: string | null
          theology_challenging_voice_4: string | null
          theology_challenging_voice_4_classic: string | null
          theology_challenging_voice_4_classic_db_id: string | null
          theology_challenging_voice_4_db_id: string | null
          theology_challenging_voice_4_rationale: string | null
          theology_challenging_voice_5: string | null
          theology_challenging_voice_5_classic: string | null
          theology_challenging_voice_5_classic_db_id: string | null
          theology_challenging_voice_5_db_id: string | null
          theology_challenging_voice_5_rationale: string | null
          theology_introduction: string | null
          theology_kindred_spirit_1: string | null
          theology_kindred_spirit_1_classic: string | null
          theology_kindred_spirit_1_classic_db_id: string | null
          theology_kindred_spirit_1_db_id: string | null
          theology_kindred_spirit_1_rationale: string | null
          theology_kindred_spirit_2: string | null
          theology_kindred_spirit_2_classic: string | null
          theology_kindred_spirit_2_classic_db_id: string | null
          theology_kindred_spirit_2_db_id: string | null
          theology_kindred_spirit_2_rationale: string | null
          theology_kindred_spirit_3: string | null
          theology_kindred_spirit_3_classic: string | null
          theology_kindred_spirit_3_classic_db_id: string | null
          theology_kindred_spirit_3_db_id: string | null
          theology_kindred_spirit_3_rationale: string | null
          theology_kindred_spirit_4: string | null
          theology_kindred_spirit_4_classic: string | null
          theology_kindred_spirit_4_classic_db_id: string | null
          theology_kindred_spirit_4_db_id: string | null
          theology_kindred_spirit_4_rationale: string | null
          theology_kindred_spirit_5: string | null
          theology_kindred_spirit_5_classic: string | null
          theology_kindred_spirit_5_classic_db_id: string | null
          theology_kindred_spirit_5_db_id: string | null
          theology_kindred_spirit_5_rationale: string | null
        }
        Insert: {
          aesthetics_challenging_voice_1?: string | null
          aesthetics_challenging_voice_1_classic?: string | null
          aesthetics_challenging_voice_1_classic_db_id?: string | null
          aesthetics_challenging_voice_1_db_id?: string | null
          aesthetics_challenging_voice_1_rationale?: string | null
          aesthetics_challenging_voice_2?: string | null
          aesthetics_challenging_voice_2_classic?: string | null
          aesthetics_challenging_voice_2_classic_db_id?: string | null
          aesthetics_challenging_voice_2_db_id?: string | null
          aesthetics_challenging_voice_2_rationale?: string | null
          aesthetics_challenging_voice_3?: string | null
          aesthetics_challenging_voice_3_classic?: string | null
          aesthetics_challenging_voice_3_classic_db_id?: string | null
          aesthetics_challenging_voice_3_db_id?: string | null
          aesthetics_challenging_voice_3_rationale?: string | null
          aesthetics_challenging_voice_4?: string | null
          aesthetics_challenging_voice_4_classic?: string | null
          aesthetics_challenging_voice_4_classic_db_id?: string | null
          aesthetics_challenging_voice_4_db_id?: string | null
          aesthetics_challenging_voice_4_rationale?: string | null
          aesthetics_challenging_voice_5?: string | null
          aesthetics_challenging_voice_5_classic?: string | null
          aesthetics_challenging_voice_5_classic_db_id?: string | null
          aesthetics_challenging_voice_5_db_id?: string | null
          aesthetics_challenging_voice_5_rationale?: string | null
          aesthetics_introduction?: string | null
          aesthetics_kindred_spirit_1?: string | null
          aesthetics_kindred_spirit_1_classic?: string | null
          aesthetics_kindred_spirit_1_classic_db_id?: string | null
          aesthetics_kindred_spirit_1_db_id?: string | null
          aesthetics_kindred_spirit_1_rationale?: string | null
          aesthetics_kindred_spirit_2?: string | null
          aesthetics_kindred_spirit_2_classic?: string | null
          aesthetics_kindred_spirit_2_classic_db_id?: string | null
          aesthetics_kindred_spirit_2_db_id?: string | null
          aesthetics_kindred_spirit_2_rationale?: string | null
          aesthetics_kindred_spirit_3?: string | null
          aesthetics_kindred_spirit_3_classic?: string | null
          aesthetics_kindred_spirit_3_classic_db_id?: string | null
          aesthetics_kindred_spirit_3_db_id?: string | null
          aesthetics_kindred_spirit_3_rationale?: string | null
          aesthetics_kindred_spirit_4?: string | null
          aesthetics_kindred_spirit_4_classic?: string | null
          aesthetics_kindred_spirit_4_classic_db_id?: string | null
          aesthetics_kindred_spirit_4_db_id?: string | null
          aesthetics_kindred_spirit_4_rationale?: string | null
          aesthetics_kindred_spirit_5?: string | null
          aesthetics_kindred_spirit_5_classic?: string | null
          aesthetics_kindred_spirit_5_classic_db_id?: string | null
          aesthetics_kindred_spirit_5_db_id?: string | null
          aesthetics_kindred_spirit_5_rationale?: string | null
          analysis_text?: string | null
          analysis_type: Database["public"]["Enums"]["dna_result_type"]
          archetype?: string | null
          archetype_definition?: string | null
          assessment_id: string
          become_who_you_are?: string | null
          conclusion?: string | null
          created_at?: string
          epistemology_challenging_voice_1?: string | null
          epistemology_challenging_voice_1_classic?: string | null
          epistemology_challenging_voice_1_classic_db_id?: string | null
          epistemology_challenging_voice_1_db_id?: string | null
          epistemology_challenging_voice_1_rationale?: string | null
          epistemology_challenging_voice_2?: string | null
          epistemology_challenging_voice_2_classic?: string | null
          epistemology_challenging_voice_2_classic_db_id?: string | null
          epistemology_challenging_voice_2_db_id?: string | null
          epistemology_challenging_voice_2_rationale?: string | null
          epistemology_challenging_voice_3?: string | null
          epistemology_challenging_voice_3_classic?: string | null
          epistemology_challenging_voice_3_classic_db_id?: string | null
          epistemology_challenging_voice_3_db_id?: string | null
          epistemology_challenging_voice_3_rationale?: string | null
          epistemology_challenging_voice_4?: string | null
          epistemology_challenging_voice_4_classic?: string | null
          epistemology_challenging_voice_4_classic_db_id?: string | null
          epistemology_challenging_voice_4_db_id?: string | null
          epistemology_challenging_voice_4_rationale?: string | null
          epistemology_challenging_voice_5?: string | null
          epistemology_challenging_voice_5_classic?: string | null
          epistemology_challenging_voice_5_classic_db_id?: string | null
          epistemology_challenging_voice_5_db_id?: string | null
          epistemology_challenging_voice_5_rationale?: string | null
          epistemology_introduction?: string | null
          epistemology_kindred_spirit_1?: string | null
          epistemology_kindred_spirit_1_classic?: string | null
          epistemology_kindred_spirit_1_classic_db_id?: string | null
          epistemology_kindred_spirit_1_db_id?: string | null
          epistemology_kindred_spirit_1_rationale?: string | null
          epistemology_kindred_spirit_2?: string | null
          epistemology_kindred_spirit_2_classic?: string | null
          epistemology_kindred_spirit_2_classic_db_id?: string | null
          epistemology_kindred_spirit_2_db_id?: string | null
          epistemology_kindred_spirit_2_rationale?: string | null
          epistemology_kindred_spirit_3?: string | null
          epistemology_kindred_spirit_3_classic?: string | null
          epistemology_kindred_spirit_3_classic_db_id?: string | null
          epistemology_kindred_spirit_3_db_id?: string | null
          epistemology_kindred_spirit_3_rationale?: string | null
          epistemology_kindred_spirit_4?: string | null
          epistemology_kindred_spirit_4_classic?: string | null
          epistemology_kindred_spirit_4_classic_db_id?: string | null
          epistemology_kindred_spirit_4_db_id?: string | null
          epistemology_kindred_spirit_4_rationale?: string | null
          epistemology_kindred_spirit_5?: string | null
          epistemology_kindred_spirit_5_classic?: string | null
          epistemology_kindred_spirit_5_classic_db_id?: string | null
          epistemology_kindred_spirit_5_db_id?: string | null
          epistemology_kindred_spirit_5_rationale?: string | null
          ethics_challenging_voice_1?: string | null
          ethics_challenging_voice_1_classic?: string | null
          ethics_challenging_voice_1_classic_db_id?: string | null
          ethics_challenging_voice_1_db_id?: string | null
          ethics_challenging_voice_1_rationale?: string | null
          ethics_challenging_voice_2?: string | null
          ethics_challenging_voice_2_classic?: string | null
          ethics_challenging_voice_2_classic_db_id?: string | null
          ethics_challenging_voice_2_db_id?: string | null
          ethics_challenging_voice_2_rationale?: string | null
          ethics_challenging_voice_3?: string | null
          ethics_challenging_voice_3_classic?: string | null
          ethics_challenging_voice_3_classic_db_id?: string | null
          ethics_challenging_voice_3_db_id?: string | null
          ethics_challenging_voice_3_rationale?: string | null
          ethics_challenging_voice_4?: string | null
          ethics_challenging_voice_4_classic?: string | null
          ethics_challenging_voice_4_classic_db_id?: string | null
          ethics_challenging_voice_4_db_id?: string | null
          ethics_challenging_voice_4_rationale?: string | null
          ethics_challenging_voice_5?: string | null
          ethics_challenging_voice_5_classic?: string | null
          ethics_challenging_voice_5_classic_db_id?: string | null
          ethics_challenging_voice_5_db_id?: string | null
          ethics_challenging_voice_5_rationale?: string | null
          ethics_introduction?: string | null
          ethics_kindred_spirit_1?: string | null
          ethics_kindred_spirit_1_classic?: string | null
          ethics_kindred_spirit_1_classic_db_id?: string | null
          ethics_kindred_spirit_1_db_id?: string | null
          ethics_kindred_spirit_1_rationale?: string | null
          ethics_kindred_spirit_2?: string | null
          ethics_kindred_spirit_2_classic?: string | null
          ethics_kindred_spirit_2_classic_db_id?: string | null
          ethics_kindred_spirit_2_db_id?: string | null
          ethics_kindred_spirit_2_rationale?: string | null
          ethics_kindred_spirit_3?: string | null
          ethics_kindred_spirit_3_classic?: string | null
          ethics_kindred_spirit_3_classic_db_id?: string | null
          ethics_kindred_spirit_3_db_id?: string | null
          ethics_kindred_spirit_3_rationale?: string | null
          ethics_kindred_spirit_4?: string | null
          ethics_kindred_spirit_4_classic?: string | null
          ethics_kindred_spirit_4_classic_db_id?: string | null
          ethics_kindred_spirit_4_db_id?: string | null
          ethics_kindred_spirit_4_rationale?: string | null
          ethics_kindred_spirit_5?: string | null
          ethics_kindred_spirit_5_classic?: string | null
          ethics_kindred_spirit_5_classic_db_id?: string | null
          ethics_kindred_spirit_5_db_id?: string | null
          ethics_kindred_spirit_5_rationale?: string | null
          growth_edges_1?: string | null
          growth_edges_2?: string | null
          growth_edges_3?: string | null
          id?: string
          introduction?: string | null
          key_tension_1?: string | null
          key_tension_2?: string | null
          key_tension_3?: string | null
          most_challenging_voice?: string | null
          most_challenging_voice_db_id?: string | null
          most_kindred_spirit?: string | null
          most_kindred_spirit_db_id?: string | null
          name?: string | null
          natural_strength_1?: string | null
          natural_strength_2?: string | null
          natural_strength_3?: string | null
          next_steps?: string | null
          ontology_challenging_voice_1?: string | null
          ontology_challenging_voice_1_classic?: string | null
          ontology_challenging_voice_1_classic_db_id?: string | null
          ontology_challenging_voice_1_db_id?: string | null
          ontology_challenging_voice_1_rationale?: string | null
          ontology_challenging_voice_2?: string | null
          ontology_challenging_voice_2_classic?: string | null
          ontology_challenging_voice_2_classic_db_id?: string | null
          ontology_challenging_voice_2_db_id?: string | null
          ontology_challenging_voice_2_rationale?: string | null
          ontology_challenging_voice_3?: string | null
          ontology_challenging_voice_3_classic?: string | null
          ontology_challenging_voice_3_classic_db_id?: string | null
          ontology_challenging_voice_3_db_id?: string | null
          ontology_challenging_voice_3_rationale?: string | null
          ontology_challenging_voice_4?: string | null
          ontology_challenging_voice_4_classic?: string | null
          ontology_challenging_voice_4_classic_db_id?: string | null
          ontology_challenging_voice_4_db_id?: string | null
          ontology_challenging_voice_4_rationale?: string | null
          ontology_challenging_voice_5?: string | null
          ontology_challenging_voice_5_classic?: string | null
          ontology_challenging_voice_5_classic_db_id?: string | null
          ontology_challenging_voice_5_db_id?: string | null
          ontology_challenging_voice_5_rationale?: string | null
          ontology_introduction?: string | null
          ontology_kindred_spirit_1?: string | null
          ontology_kindred_spirit_1_classic?: string | null
          ontology_kindred_spirit_1_classic_db_id?: string | null
          ontology_kindred_spirit_1_db_id?: string | null
          ontology_kindred_spirit_1_rationale?: string | null
          ontology_kindred_spirit_2?: string | null
          ontology_kindred_spirit_2_classic?: string | null
          ontology_kindred_spirit_2_classic_db_id?: string | null
          ontology_kindred_spirit_2_db_id?: string | null
          ontology_kindred_spirit_2_rationale?: string | null
          ontology_kindred_spirit_3?: string | null
          ontology_kindred_spirit_3_classic?: string | null
          ontology_kindred_spirit_3_classic_db_id?: string | null
          ontology_kindred_spirit_3_db_id?: string | null
          ontology_kindred_spirit_3_rationale?: string | null
          ontology_kindred_spirit_4?: string | null
          ontology_kindred_spirit_4_classic?: string | null
          ontology_kindred_spirit_4_classic_db_id?: string | null
          ontology_kindred_spirit_4_db_id?: string | null
          ontology_kindred_spirit_4_rationale?: string | null
          ontology_kindred_spirit_5?: string | null
          ontology_kindred_spirit_5_classic?: string | null
          ontology_kindred_spirit_5_classic_db_id?: string | null
          ontology_kindred_spirit_5_db_id?: string | null
          ontology_kindred_spirit_5_rationale?: string | null
          politics_challenging_voice_1?: string | null
          politics_challenging_voice_1_classic?: string | null
          politics_challenging_voice_1_classic_db_id?: string | null
          politics_challenging_voice_1_db_id?: string | null
          politics_challenging_voice_1_rationale?: string | null
          politics_challenging_voice_2?: string | null
          politics_challenging_voice_2_classic?: string | null
          politics_challenging_voice_2_classic_db_id?: string | null
          politics_challenging_voice_2_db_id?: string | null
          politics_challenging_voice_2_rationale?: string | null
          politics_challenging_voice_3?: string | null
          politics_challenging_voice_3_classic?: string | null
          politics_challenging_voice_3_classic_db_id?: string | null
          politics_challenging_voice_3_db_id?: string | null
          politics_challenging_voice_3_rationale?: string | null
          politics_challenging_voice_4?: string | null
          politics_challenging_voice_4_classic?: string | null
          politics_challenging_voice_4_classic_db_id?: string | null
          politics_challenging_voice_4_db_id?: string | null
          politics_challenging_voice_4_rationale?: string | null
          politics_challenging_voice_5?: string | null
          politics_challenging_voice_5_classic?: string | null
          politics_challenging_voice_5_classic_db_id?: string | null
          politics_challenging_voice_5_db_id?: string | null
          politics_challenging_voice_5_rationale?: string | null
          politics_introduction?: string | null
          politics_kindred_spirit_1?: string | null
          politics_kindred_spirit_1_classic?: string | null
          politics_kindred_spirit_1_classic_db_id?: string | null
          politics_kindred_spirit_1_db_id?: string | null
          politics_kindred_spirit_1_rationale?: string | null
          politics_kindred_spirit_2?: string | null
          politics_kindred_spirit_2_classic?: string | null
          politics_kindred_spirit_2_classic_db_id?: string | null
          politics_kindred_spirit_2_db_id?: string | null
          politics_kindred_spirit_2_rationale?: string | null
          politics_kindred_spirit_3?: string | null
          politics_kindred_spirit_3_classic?: string | null
          politics_kindred_spirit_3_classic_db_id?: string | null
          politics_kindred_spirit_3_db_id?: string | null
          politics_kindred_spirit_3_rationale?: string | null
          politics_kindred_spirit_4?: string | null
          politics_kindred_spirit_4_classic?: string | null
          politics_kindred_spirit_4_classic_db_id?: string | null
          politics_kindred_spirit_4_db_id?: string | null
          politics_kindred_spirit_4_rationale?: string | null
          politics_kindred_spirit_5?: string | null
          politics_kindred_spirit_5_classic?: string | null
          politics_kindred_spirit_5_classic_db_id?: string | null
          politics_kindred_spirit_5_db_id?: string | null
          politics_kindred_spirit_5_rationale?: string | null
          profile_image_url?: string | null
          raw_response?: Json | null
          share_summary?: string | null
          theology_challenging_voice_1?: string | null
          theology_challenging_voice_1_classic?: string | null
          theology_challenging_voice_1_classic_db_id?: string | null
          theology_challenging_voice_1_db_id?: string | null
          theology_challenging_voice_1_rationale?: string | null
          theology_challenging_voice_2?: string | null
          theology_challenging_voice_2_classic?: string | null
          theology_challenging_voice_2_classic_db_id?: string | null
          theology_challenging_voice_2_db_id?: string | null
          theology_challenging_voice_2_rationale?: string | null
          theology_challenging_voice_3?: string | null
          theology_challenging_voice_3_classic?: string | null
          theology_challenging_voice_3_classic_db_id?: string | null
          theology_challenging_voice_3_db_id?: string | null
          theology_challenging_voice_3_rationale?: string | null
          theology_challenging_voice_4?: string | null
          theology_challenging_voice_4_classic?: string | null
          theology_challenging_voice_4_classic_db_id?: string | null
          theology_challenging_voice_4_db_id?: string | null
          theology_challenging_voice_4_rationale?: string | null
          theology_challenging_voice_5?: string | null
          theology_challenging_voice_5_classic?: string | null
          theology_challenging_voice_5_classic_db_id?: string | null
          theology_challenging_voice_5_db_id?: string | null
          theology_challenging_voice_5_rationale?: string | null
          theology_introduction?: string | null
          theology_kindred_spirit_1?: string | null
          theology_kindred_spirit_1_classic?: string | null
          theology_kindred_spirit_1_classic_db_id?: string | null
          theology_kindred_spirit_1_db_id?: string | null
          theology_kindred_spirit_1_rationale?: string | null
          theology_kindred_spirit_2?: string | null
          theology_kindred_spirit_2_classic?: string | null
          theology_kindred_spirit_2_classic_db_id?: string | null
          theology_kindred_spirit_2_db_id?: string | null
          theology_kindred_spirit_2_rationale?: string | null
          theology_kindred_spirit_3?: string | null
          theology_kindred_spirit_3_classic?: string | null
          theology_kindred_spirit_3_classic_db_id?: string | null
          theology_kindred_spirit_3_db_id?: string | null
          theology_kindred_spirit_3_rationale?: string | null
          theology_kindred_spirit_4?: string | null
          theology_kindred_spirit_4_classic?: string | null
          theology_kindred_spirit_4_classic_db_id?: string | null
          theology_kindred_spirit_4_db_id?: string | null
          theology_kindred_spirit_4_rationale?: string | null
          theology_kindred_spirit_5?: string | null
          theology_kindred_spirit_5_classic?: string | null
          theology_kindred_spirit_5_classic_db_id?: string | null
          theology_kindred_spirit_5_db_id?: string | null
          theology_kindred_spirit_5_rationale?: string | null
        }
        Update: {
          aesthetics_challenging_voice_1?: string | null
          aesthetics_challenging_voice_1_classic?: string | null
          aesthetics_challenging_voice_1_classic_db_id?: string | null
          aesthetics_challenging_voice_1_db_id?: string | null
          aesthetics_challenging_voice_1_rationale?: string | null
          aesthetics_challenging_voice_2?: string | null
          aesthetics_challenging_voice_2_classic?: string | null
          aesthetics_challenging_voice_2_classic_db_id?: string | null
          aesthetics_challenging_voice_2_db_id?: string | null
          aesthetics_challenging_voice_2_rationale?: string | null
          aesthetics_challenging_voice_3?: string | null
          aesthetics_challenging_voice_3_classic?: string | null
          aesthetics_challenging_voice_3_classic_db_id?: string | null
          aesthetics_challenging_voice_3_db_id?: string | null
          aesthetics_challenging_voice_3_rationale?: string | null
          aesthetics_challenging_voice_4?: string | null
          aesthetics_challenging_voice_4_classic?: string | null
          aesthetics_challenging_voice_4_classic_db_id?: string | null
          aesthetics_challenging_voice_4_db_id?: string | null
          aesthetics_challenging_voice_4_rationale?: string | null
          aesthetics_challenging_voice_5?: string | null
          aesthetics_challenging_voice_5_classic?: string | null
          aesthetics_challenging_voice_5_classic_db_id?: string | null
          aesthetics_challenging_voice_5_db_id?: string | null
          aesthetics_challenging_voice_5_rationale?: string | null
          aesthetics_introduction?: string | null
          aesthetics_kindred_spirit_1?: string | null
          aesthetics_kindred_spirit_1_classic?: string | null
          aesthetics_kindred_spirit_1_classic_db_id?: string | null
          aesthetics_kindred_spirit_1_db_id?: string | null
          aesthetics_kindred_spirit_1_rationale?: string | null
          aesthetics_kindred_spirit_2?: string | null
          aesthetics_kindred_spirit_2_classic?: string | null
          aesthetics_kindred_spirit_2_classic_db_id?: string | null
          aesthetics_kindred_spirit_2_db_id?: string | null
          aesthetics_kindred_spirit_2_rationale?: string | null
          aesthetics_kindred_spirit_3?: string | null
          aesthetics_kindred_spirit_3_classic?: string | null
          aesthetics_kindred_spirit_3_classic_db_id?: string | null
          aesthetics_kindred_spirit_3_db_id?: string | null
          aesthetics_kindred_spirit_3_rationale?: string | null
          aesthetics_kindred_spirit_4?: string | null
          aesthetics_kindred_spirit_4_classic?: string | null
          aesthetics_kindred_spirit_4_classic_db_id?: string | null
          aesthetics_kindred_spirit_4_db_id?: string | null
          aesthetics_kindred_spirit_4_rationale?: string | null
          aesthetics_kindred_spirit_5?: string | null
          aesthetics_kindred_spirit_5_classic?: string | null
          aesthetics_kindred_spirit_5_classic_db_id?: string | null
          aesthetics_kindred_spirit_5_db_id?: string | null
          aesthetics_kindred_spirit_5_rationale?: string | null
          analysis_text?: string | null
          analysis_type?: Database["public"]["Enums"]["dna_result_type"]
          archetype?: string | null
          archetype_definition?: string | null
          assessment_id?: string
          become_who_you_are?: string | null
          conclusion?: string | null
          created_at?: string
          epistemology_challenging_voice_1?: string | null
          epistemology_challenging_voice_1_classic?: string | null
          epistemology_challenging_voice_1_classic_db_id?: string | null
          epistemology_challenging_voice_1_db_id?: string | null
          epistemology_challenging_voice_1_rationale?: string | null
          epistemology_challenging_voice_2?: string | null
          epistemology_challenging_voice_2_classic?: string | null
          epistemology_challenging_voice_2_classic_db_id?: string | null
          epistemology_challenging_voice_2_db_id?: string | null
          epistemology_challenging_voice_2_rationale?: string | null
          epistemology_challenging_voice_3?: string | null
          epistemology_challenging_voice_3_classic?: string | null
          epistemology_challenging_voice_3_classic_db_id?: string | null
          epistemology_challenging_voice_3_db_id?: string | null
          epistemology_challenging_voice_3_rationale?: string | null
          epistemology_challenging_voice_4?: string | null
          epistemology_challenging_voice_4_classic?: string | null
          epistemology_challenging_voice_4_classic_db_id?: string | null
          epistemology_challenging_voice_4_db_id?: string | null
          epistemology_challenging_voice_4_rationale?: string | null
          epistemology_challenging_voice_5?: string | null
          epistemology_challenging_voice_5_classic?: string | null
          epistemology_challenging_voice_5_classic_db_id?: string | null
          epistemology_challenging_voice_5_db_id?: string | null
          epistemology_challenging_voice_5_rationale?: string | null
          epistemology_introduction?: string | null
          epistemology_kindred_spirit_1?: string | null
          epistemology_kindred_spirit_1_classic?: string | null
          epistemology_kindred_spirit_1_classic_db_id?: string | null
          epistemology_kindred_spirit_1_db_id?: string | null
          epistemology_kindred_spirit_1_rationale?: string | null
          epistemology_kindred_spirit_2?: string | null
          epistemology_kindred_spirit_2_classic?: string | null
          epistemology_kindred_spirit_2_classic_db_id?: string | null
          epistemology_kindred_spirit_2_db_id?: string | null
          epistemology_kindred_spirit_2_rationale?: string | null
          epistemology_kindred_spirit_3?: string | null
          epistemology_kindred_spirit_3_classic?: string | null
          epistemology_kindred_spirit_3_classic_db_id?: string | null
          epistemology_kindred_spirit_3_db_id?: string | null
          epistemology_kindred_spirit_3_rationale?: string | null
          epistemology_kindred_spirit_4?: string | null
          epistemology_kindred_spirit_4_classic?: string | null
          epistemology_kindred_spirit_4_classic_db_id?: string | null
          epistemology_kindred_spirit_4_db_id?: string | null
          epistemology_kindred_spirit_4_rationale?: string | null
          epistemology_kindred_spirit_5?: string | null
          epistemology_kindred_spirit_5_classic?: string | null
          epistemology_kindred_spirit_5_classic_db_id?: string | null
          epistemology_kindred_spirit_5_db_id?: string | null
          epistemology_kindred_spirit_5_rationale?: string | null
          ethics_challenging_voice_1?: string | null
          ethics_challenging_voice_1_classic?: string | null
          ethics_challenging_voice_1_classic_db_id?: string | null
          ethics_challenging_voice_1_db_id?: string | null
          ethics_challenging_voice_1_rationale?: string | null
          ethics_challenging_voice_2?: string | null
          ethics_challenging_voice_2_classic?: string | null
          ethics_challenging_voice_2_classic_db_id?: string | null
          ethics_challenging_voice_2_db_id?: string | null
          ethics_challenging_voice_2_rationale?: string | null
          ethics_challenging_voice_3?: string | null
          ethics_challenging_voice_3_classic?: string | null
          ethics_challenging_voice_3_classic_db_id?: string | null
          ethics_challenging_voice_3_db_id?: string | null
          ethics_challenging_voice_3_rationale?: string | null
          ethics_challenging_voice_4?: string | null
          ethics_challenging_voice_4_classic?: string | null
          ethics_challenging_voice_4_classic_db_id?: string | null
          ethics_challenging_voice_4_db_id?: string | null
          ethics_challenging_voice_4_rationale?: string | null
          ethics_challenging_voice_5?: string | null
          ethics_challenging_voice_5_classic?: string | null
          ethics_challenging_voice_5_classic_db_id?: string | null
          ethics_challenging_voice_5_db_id?: string | null
          ethics_challenging_voice_5_rationale?: string | null
          ethics_introduction?: string | null
          ethics_kindred_spirit_1?: string | null
          ethics_kindred_spirit_1_classic?: string | null
          ethics_kindred_spirit_1_classic_db_id?: string | null
          ethics_kindred_spirit_1_db_id?: string | null
          ethics_kindred_spirit_1_rationale?: string | null
          ethics_kindred_spirit_2?: string | null
          ethics_kindred_spirit_2_classic?: string | null
          ethics_kindred_spirit_2_classic_db_id?: string | null
          ethics_kindred_spirit_2_db_id?: string | null
          ethics_kindred_spirit_2_rationale?: string | null
          ethics_kindred_spirit_3?: string | null
          ethics_kindred_spirit_3_classic?: string | null
          ethics_kindred_spirit_3_classic_db_id?: string | null
          ethics_kindred_spirit_3_db_id?: string | null
          ethics_kindred_spirit_3_rationale?: string | null
          ethics_kindred_spirit_4?: string | null
          ethics_kindred_spirit_4_classic?: string | null
          ethics_kindred_spirit_4_classic_db_id?: string | null
          ethics_kindred_spirit_4_db_id?: string | null
          ethics_kindred_spirit_4_rationale?: string | null
          ethics_kindred_spirit_5?: string | null
          ethics_kindred_spirit_5_classic?: string | null
          ethics_kindred_spirit_5_classic_db_id?: string | null
          ethics_kindred_spirit_5_db_id?: string | null
          ethics_kindred_spirit_5_rationale?: string | null
          growth_edges_1?: string | null
          growth_edges_2?: string | null
          growth_edges_3?: string | null
          id?: string
          introduction?: string | null
          key_tension_1?: string | null
          key_tension_2?: string | null
          key_tension_3?: string | null
          most_challenging_voice?: string | null
          most_challenging_voice_db_id?: string | null
          most_kindred_spirit?: string | null
          most_kindred_spirit_db_id?: string | null
          name?: string | null
          natural_strength_1?: string | null
          natural_strength_2?: string | null
          natural_strength_3?: string | null
          next_steps?: string | null
          ontology_challenging_voice_1?: string | null
          ontology_challenging_voice_1_classic?: string | null
          ontology_challenging_voice_1_classic_db_id?: string | null
          ontology_challenging_voice_1_db_id?: string | null
          ontology_challenging_voice_1_rationale?: string | null
          ontology_challenging_voice_2?: string | null
          ontology_challenging_voice_2_classic?: string | null
          ontology_challenging_voice_2_classic_db_id?: string | null
          ontology_challenging_voice_2_db_id?: string | null
          ontology_challenging_voice_2_rationale?: string | null
          ontology_challenging_voice_3?: string | null
          ontology_challenging_voice_3_classic?: string | null
          ontology_challenging_voice_3_classic_db_id?: string | null
          ontology_challenging_voice_3_db_id?: string | null
          ontology_challenging_voice_3_rationale?: string | null
          ontology_challenging_voice_4?: string | null
          ontology_challenging_voice_4_classic?: string | null
          ontology_challenging_voice_4_classic_db_id?: string | null
          ontology_challenging_voice_4_db_id?: string | null
          ontology_challenging_voice_4_rationale?: string | null
          ontology_challenging_voice_5?: string | null
          ontology_challenging_voice_5_classic?: string | null
          ontology_challenging_voice_5_classic_db_id?: string | null
          ontology_challenging_voice_5_db_id?: string | null
          ontology_challenging_voice_5_rationale?: string | null
          ontology_introduction?: string | null
          ontology_kindred_spirit_1?: string | null
          ontology_kindred_spirit_1_classic?: string | null
          ontology_kindred_spirit_1_classic_db_id?: string | null
          ontology_kindred_spirit_1_db_id?: string | null
          ontology_kindred_spirit_1_rationale?: string | null
          ontology_kindred_spirit_2?: string | null
          ontology_kindred_spirit_2_classic?: string | null
          ontology_kindred_spirit_2_classic_db_id?: string | null
          ontology_kindred_spirit_2_db_id?: string | null
          ontology_kindred_spirit_2_rationale?: string | null
          ontology_kindred_spirit_3?: string | null
          ontology_kindred_spirit_3_classic?: string | null
          ontology_kindred_spirit_3_classic_db_id?: string | null
          ontology_kindred_spirit_3_db_id?: string | null
          ontology_kindred_spirit_3_rationale?: string | null
          ontology_kindred_spirit_4?: string | null
          ontology_kindred_spirit_4_classic?: string | null
          ontology_kindred_spirit_4_classic_db_id?: string | null
          ontology_kindred_spirit_4_db_id?: string | null
          ontology_kindred_spirit_4_rationale?: string | null
          ontology_kindred_spirit_5?: string | null
          ontology_kindred_spirit_5_classic?: string | null
          ontology_kindred_spirit_5_classic_db_id?: string | null
          ontology_kindred_spirit_5_db_id?: string | null
          ontology_kindred_spirit_5_rationale?: string | null
          politics_challenging_voice_1?: string | null
          politics_challenging_voice_1_classic?: string | null
          politics_challenging_voice_1_classic_db_id?: string | null
          politics_challenging_voice_1_db_id?: string | null
          politics_challenging_voice_1_rationale?: string | null
          politics_challenging_voice_2?: string | null
          politics_challenging_voice_2_classic?: string | null
          politics_challenging_voice_2_classic_db_id?: string | null
          politics_challenging_voice_2_db_id?: string | null
          politics_challenging_voice_2_rationale?: string | null
          politics_challenging_voice_3?: string | null
          politics_challenging_voice_3_classic?: string | null
          politics_challenging_voice_3_classic_db_id?: string | null
          politics_challenging_voice_3_db_id?: string | null
          politics_challenging_voice_3_rationale?: string | null
          politics_challenging_voice_4?: string | null
          politics_challenging_voice_4_classic?: string | null
          politics_challenging_voice_4_classic_db_id?: string | null
          politics_challenging_voice_4_db_id?: string | null
          politics_challenging_voice_4_rationale?: string | null
          politics_challenging_voice_5?: string | null
          politics_challenging_voice_5_classic?: string | null
          politics_challenging_voice_5_classic_db_id?: string | null
          politics_challenging_voice_5_db_id?: string | null
          politics_challenging_voice_5_rationale?: string | null
          politics_introduction?: string | null
          politics_kindred_spirit_1?: string | null
          politics_kindred_spirit_1_classic?: string | null
          politics_kindred_spirit_1_classic_db_id?: string | null
          politics_kindred_spirit_1_db_id?: string | null
          politics_kindred_spirit_1_rationale?: string | null
          politics_kindred_spirit_2?: string | null
          politics_kindred_spirit_2_classic?: string | null
          politics_kindred_spirit_2_classic_db_id?: string | null
          politics_kindred_spirit_2_db_id?: string | null
          politics_kindred_spirit_2_rationale?: string | null
          politics_kindred_spirit_3?: string | null
          politics_kindred_spirit_3_classic?: string | null
          politics_kindred_spirit_3_classic_db_id?: string | null
          politics_kindred_spirit_3_db_id?: string | null
          politics_kindred_spirit_3_rationale?: string | null
          politics_kindred_spirit_4?: string | null
          politics_kindred_spirit_4_classic?: string | null
          politics_kindred_spirit_4_classic_db_id?: string | null
          politics_kindred_spirit_4_db_id?: string | null
          politics_kindred_spirit_4_rationale?: string | null
          politics_kindred_spirit_5?: string | null
          politics_kindred_spirit_5_classic?: string | null
          politics_kindred_spirit_5_classic_db_id?: string | null
          politics_kindred_spirit_5_db_id?: string | null
          politics_kindred_spirit_5_rationale?: string | null
          profile_image_url?: string | null
          raw_response?: Json | null
          share_summary?: string | null
          theology_challenging_voice_1?: string | null
          theology_challenging_voice_1_classic?: string | null
          theology_challenging_voice_1_classic_db_id?: string | null
          theology_challenging_voice_1_db_id?: string | null
          theology_challenging_voice_1_rationale?: string | null
          theology_challenging_voice_2?: string | null
          theology_challenging_voice_2_classic?: string | null
          theology_challenging_voice_2_classic_db_id?: string | null
          theology_challenging_voice_2_db_id?: string | null
          theology_challenging_voice_2_rationale?: string | null
          theology_challenging_voice_3?: string | null
          theology_challenging_voice_3_classic?: string | null
          theology_challenging_voice_3_classic_db_id?: string | null
          theology_challenging_voice_3_db_id?: string | null
          theology_challenging_voice_3_rationale?: string | null
          theology_challenging_voice_4?: string | null
          theology_challenging_voice_4_classic?: string | null
          theology_challenging_voice_4_classic_db_id?: string | null
          theology_challenging_voice_4_db_id?: string | null
          theology_challenging_voice_4_rationale?: string | null
          theology_challenging_voice_5?: string | null
          theology_challenging_voice_5_classic?: string | null
          theology_challenging_voice_5_classic_db_id?: string | null
          theology_challenging_voice_5_db_id?: string | null
          theology_challenging_voice_5_rationale?: string | null
          theology_introduction?: string | null
          theology_kindred_spirit_1?: string | null
          theology_kindred_spirit_1_classic?: string | null
          theology_kindred_spirit_1_classic_db_id?: string | null
          theology_kindred_spirit_1_db_id?: string | null
          theology_kindred_spirit_1_rationale?: string | null
          theology_kindred_spirit_2?: string | null
          theology_kindred_spirit_2_classic?: string | null
          theology_kindred_spirit_2_classic_db_id?: string | null
          theology_kindred_spirit_2_db_id?: string | null
          theology_kindred_spirit_2_rationale?: string | null
          theology_kindred_spirit_3?: string | null
          theology_kindred_spirit_3_classic?: string | null
          theology_kindred_spirit_3_classic_db_id?: string | null
          theology_kindred_spirit_3_db_id?: string | null
          theology_kindred_spirit_3_rationale?: string | null
          theology_kindred_spirit_4?: string | null
          theology_kindred_spirit_4_classic?: string | null
          theology_kindred_spirit_4_classic_db_id?: string | null
          theology_kindred_spirit_4_db_id?: string | null
          theology_kindred_spirit_4_rationale?: string | null
          theology_kindred_spirit_5?: string | null
          theology_kindred_spirit_5_classic?: string | null
          theology_kindred_spirit_5_classic_db_id?: string | null
          theology_kindred_spirit_5_db_id?: string | null
          theology_kindred_spirit_5_rationale?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dna_analysis_results_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "dna_assessment_results"
            referencedColumns: ["id"]
          },
        ]
      }
      dna_assessment_progress: {
        Row: {
          category: Database["public"]["Enums"]["dna_category"]
          completed: boolean | null
          created_at: string
          current_position: string
          id: string
          responses: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category: Database["public"]["Enums"]["dna_category"]
          completed?: boolean | null
          created_at?: string
          current_position: string
          id?: string
          responses?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["dna_category"]
          completed?: boolean | null
          created_at?: string
          current_position?: string
          id?: string
          responses?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      dna_assessment_results: {
        Row: {
          aesthetics_sequence: string | null
          answers: Json | null
          created_at: string
          epistemology_sequence: string | null
          ethics_sequence: string | null
          id: string
          name: string
          ontology_sequence: string | null
          politics_sequence: string | null
          profile_id: string | null
          theology_sequence: string | null
        }
        Insert: {
          aesthetics_sequence?: string | null
          answers?: Json | null
          created_at?: string
          epistemology_sequence?: string | null
          ethics_sequence?: string | null
          id?: string
          name: string
          ontology_sequence?: string | null
          politics_sequence?: string | null
          profile_id?: string | null
          theology_sequence?: string | null
        }
        Update: {
          aesthetics_sequence?: string | null
          answers?: Json | null
          created_at?: string
          epistemology_sequence?: string | null
          ethics_sequence?: string | null
          id?: string
          name?: string
          ontology_sequence?: string | null
          politics_sequence?: string | null
          profile_id?: string | null
          theology_sequence?: string | null
        }
        Relationships: []
      }
      dna_conversations: {
        Row: {
          assessment_id: string | null
          created_at: string | null
          id: string
          messages: Json
          metadata: Json | null
          question_id: string
          session_id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          assessment_id?: string | null
          created_at?: string | null
          id?: string
          messages: Json
          metadata?: Json | null
          question_id: string
          session_id: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          assessment_id?: string | null
          created_at?: string | null
          id?: string
          messages?: Json
          metadata?: Json | null
          question_id?: string
          session_id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dna_conversations_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "dna_assessment_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dna_conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dna_question_responses: {
        Row: {
          answer: string
          assessment_id: string
          category: Database["public"]["Enums"]["dna_category"]
          created_at: string
          id: string
          question_id: string
        }
        Insert: {
          answer: string
          assessment_id: string
          category: Database["public"]["Enums"]["dna_category"]
          created_at?: string
          id?: string
          question_id: string
        }
        Update: {
          answer?: string
          assessment_id?: string
          category?: Database["public"]["Enums"]["dna_category"]
          created_at?: string
          id?: string
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dna_question_responses_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "dna_assessment_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dna_question_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "dna_tree_structure"
            referencedColumns: ["id"]
          },
        ]
      }
      dna_tree_structure: {
        Row: {
          category: Database["public"]["Enums"]["dna_category"]
          created_at: string
          id: string
          next_question_a_id: string | null
          next_question_b_id: string | null
          question_id: string
          tree_position: string
        }
        Insert: {
          category: Database["public"]["Enums"]["dna_category"]
          created_at?: string
          id?: string
          next_question_a_id?: string | null
          next_question_b_id?: string | null
          question_id: string
          tree_position: string
        }
        Update: {
          category?: Database["public"]["Enums"]["dna_category"]
          created_at?: string
          id?: string
          next_question_a_id?: string | null
          next_question_b_id?: string | null
          question_id?: string
          tree_position?: string
        }
        Relationships: [
          {
            foreignKeyName: "dna_tree_structure_next_question_a_id_fkey"
            columns: ["next_question_a_id"]
            isOneToOne: false
            referencedRelation: "dna_tree_structure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dna_tree_structure_next_question_b_id_fkey"
            columns: ["next_question_b_id"]
            isOneToOne: false
            referencedRelation: "dna_tree_structure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dna_tree_structure_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "great_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      dna_unmatched_entities: {
        Row: {
          analysis_id: string | null
          assessment_id: string | null
          created_at: string
          id: string
          status: string
          unmatched_classics: Json | null
          unmatched_thinkers: Json | null
          updated_at: string
        }
        Insert: {
          analysis_id?: string | null
          assessment_id?: string | null
          created_at?: string
          id?: string
          status?: string
          unmatched_classics?: Json | null
          unmatched_thinkers?: Json | null
          updated_at?: string
        }
        Update: {
          analysis_id?: string | null
          assessment_id?: string | null
          created_at?: string
          id?: string
          status?: string
          unmatched_classics?: Json | null
          unmatched_thinkers?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dna_unmatched_entities_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: true
            referencedRelation: "dna_analysis_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dna_unmatched_entities_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: true
            referencedRelation: "dna_assessment_results"
            referencedColumns: ["id"]
          },
        ]
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
          answer_a: string | null
          answer_b: string | null
          category: string
          category_number: string | null
          created_at: string
          great_conversation: string | null
          id: string
          illustration: string | null
          notion_id: string
          Notion_URL: string | null
          question: string
          randomizer: number | null
          related_classics: string[] | null
          slug: string | null
        }
        Insert: {
          answer_a?: string | null
          answer_b?: string | null
          category: string
          category_number?: string | null
          created_at?: string
          great_conversation?: string | null
          id?: string
          illustration?: string | null
          notion_id: string
          Notion_URL?: string | null
          question: string
          randomizer?: number | null
          related_classics?: string[] | null
          slug?: string | null
        }
        Update: {
          answer_a?: string | null
          answer_b?: string | null
          category?: string
          category_number?: string | null
          created_at?: string
          great_conversation?: string | null
          id?: string
          illustration?: string | null
          notion_id?: string
          Notion_URL?: string | null
          question?: string
          randomizer?: number | null
          related_classics?: string[] | null
          slug?: string | null
        }
        Relationships: []
      }
      icon_update_temp: {
        Row: {
          anecdotes: string[] | null
          created_at: string
          icon_id: string | null
          id: string
        }
        Insert: {
          anecdotes?: string[] | null
          created_at?: string
          icon_id?: string | null
          id?: string
        }
        Update: {
          anecdotes?: string[] | null
          created_at?: string
          icon_id?: string | null
          id?: string
        }
        Relationships: []
      }
      icons: {
        Row: {
          about: string | null
          anecdotes: string[] | null
          created_at: string
          great_conversation: string | null
          id: string
          illustration: string
          introduction: string | null
          name: string
          Notion_URL: string | null
          randomizer: number
          slug: string | null
        }
        Insert: {
          about?: string | null
          anecdotes?: string[] | null
          created_at?: string
          great_conversation?: string | null
          id?: string
          illustration: string
          introduction?: string | null
          name: string
          Notion_URL?: string | null
          randomizer?: number
          slug?: string | null
        }
        Update: {
          about?: string | null
          anecdotes?: string[] | null
          created_at?: string
          great_conversation?: string | null
          id?: string
          illustration?: string
          introduction?: string | null
          name?: string
          Notion_URL?: string | null
          randomizer?: number
          slug?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          assessment_id: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          landscape_image: string | null
          outseta_user_id: string | null
          profile_image: string | null
          updated_at: string
          user_id: string | null
          vanity_url: string | null
        }
        Insert: {
          assessment_id?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          landscape_image?: string | null
          outseta_user_id?: string | null
          profile_image?: string | null
          updated_at?: string
          user_id?: string | null
          vanity_url?: string | null
        }
        Update: {
          assessment_id?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          landscape_image?: string | null
          outseta_user_id?: string | null
          profile_image?: string | null
          updated_at?: string
          user_id?: string | null
          vanity_url?: string | null
        }
        Relationships: []
      }
      promo_codes: {
        Row: {
          active: boolean
          code: string
          created_at: string
          current_uses: number
          discount_percent: number
          expires_at: string | null
          id: string
          max_uses: number | null
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          current_uses?: number
          discount_percent: number
          expires_at?: string | null
          id?: string
          max_uses?: number | null
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          current_uses?: number
          discount_percent?: number
          expires_at?: string | null
          id?: string
          max_uses?: number | null
        }
        Relationships: []
      }
      prompts: {
        Row: {
          context: string | null
          display_order: number | null
          icon_display: string | null
          id: number
          prompt: string | null
          purpose: string | null
          section: string | null
          user_subtitle: string | null
          user_title: string | null
        }
        Insert: {
          context?: string | null
          display_order?: number | null
          icon_display?: string | null
          id?: number
          prompt?: string | null
          purpose?: string | null
          section?: string | null
          user_subtitle?: string | null
          user_title?: string | null
        }
        Update: {
          context?: string | null
          display_order?: number | null
          icon_display?: string | null
          id?: number
          prompt?: string | null
          purpose?: string | null
          section?: string | null
          user_subtitle?: string | null
          user_title?: string | null
        }
        Relationships: []
      }
      quotes: {
        Row: {
          created_at: string
          icon: string | null
          icon_id: string | null
          id: number
          quote: string | null
        }
        Insert: {
          created_at?: string
          icon?: string | null
          icon_id?: string | null
          id?: number
          quote?: string | null
        }
        Update: {
          created_at?: string
          icon?: string | null
          icon_id?: string | null
          id?: number
          quote?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_icon_id_fkey"
            columns: ["icon_id"]
            isOneToOne: false
            referencedRelation: "icons"
            referencedColumns: ["id"]
          },
        ]
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
      revenue_items: {
        Row: {
          cost: number | null
          created_at: string
          id: string
          purpose: string | null
          token_limit: number | null
        }
        Insert: {
          cost?: number | null
          created_at?: string
          id?: string
          purpose?: string | null
          token_limit?: number | null
        }
        Update: {
          cost?: number | null
          created_at?: string
          id?: string
          purpose?: string | null
          token_limit?: number | null
        }
        Relationships: []
      }
      share_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          type: Database["public"]["Enums"]["share_message_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          type: Database["public"]["Enums"]["share_message_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          type?: Database["public"]["Enums"]["share_message_type"]
          updated_at?: string
        }
        Relationships: []
      }
      test_auth: {
        Row: {
          content: string | null
          created_at: string | null
          id: number
          person_uid: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: number
          person_uid?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: number
          person_uid?: string | null
        }
        Relationships: []
      }
      token_usage: {
        Row: {
          created_at: string
          id: string
          month_year: string
          tokens_used: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          month_year: string
          tokens_used?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          month_year?: string
          tokens_used?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          created_at: string
          entry_concepts: string | null
          entry_icon: string | null
          entry_text: string | null
          id: number
          one_sentence: string | null
          score: string | null
          session_duration: number | null
          summary: string | null
          userid: string | null
        }
        Insert: {
          created_at?: string
          entry_concepts?: string | null
          entry_icon?: string | null
          entry_text?: string | null
          id?: number
          one_sentence?: string | null
          score?: string | null
          session_duration?: number | null
          summary?: string | null
          userid?: string | null
        }
        Update: {
          created_at?: string
          entry_concepts?: string | null
          entry_icon?: string | null
          entry_text?: string | null
          id?: number
          one_sentence?: string | null
          score?: string | null
          session_duration?: number | null
          summary?: string | null
          userid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "badges_entry_icon_fkey"
            columns: ["entry_icon"]
            isOneToOne: false
            referencedRelation: "icons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "badges_entry_text_fkey"
            columns: ["entry_text"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_entry_concepts_fkey"
            columns: ["entry_concepts"]
            isOneToOne: false
            referencedRelation: "concepts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_books: {
        Row: {
          book_id: string
          created_at: string | null
          current_cfi: string | null
          current_page: number | null
          id: string
          last_read_at: string | null
          outseta_user_id: string
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          book_id: string
          created_at?: string | null
          current_cfi?: string | null
          current_page?: number | null
          id?: string
          last_read_at?: string | null
          outseta_user_id: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          book_id?: string
          created_at?: string | null
          current_cfi?: string | null
          current_page?: number | null
          id?: string
          last_read_at?: string | null
          outseta_user_id?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_books_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_books_outseta_user_id_fkey"
            columns: ["outseta_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["outseta_user_id"]
          },
        ]
      }
      user_courses: {
        Row: {
          completed: boolean
          conversation_id: string | null
          created_at: string
          entry_id: string
          entry_type: string
          id: string
          last_message: string | null
          profile_id: string | null
          progress: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          conversation_id?: string | null
          created_at?: string
          entry_id: string
          entry_type: string
          id?: string
          last_message?: string | null
          profile_id?: string | null
          progress?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          conversation_id?: string | null
          created_at?: string
          entry_id?: string
          entry_type?: string
          id?: string
          last_message?: string | null
          profile_id?: string | null
          progress?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_courses_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["outseta_user_id"]
          },
        ]
      }
      user_favorites: {
        Row: {
          added_at: string
          id: string
          item_id: string
          item_type: string
          outseta_user_id: string
          user_id: string | null
        }
        Insert: {
          added_at?: string
          id?: string
          item_id: string
          item_type: string
          outseta_user_id: string
          user_id?: string | null
        }
        Update: {
          added_at?: string
          id?: string
          item_id?: string
          item_type?: string
          outseta_user_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_promo_codes: {
        Row: {
          applied_at: string
          id: string
          promo_code_id: string
          user_id: string
        }
        Insert: {
          applied_at?: string
          id?: string
          promo_code_id: string
          user_id: string
        }
        Update: {
          applied_at?: string
          id?: string
          promo_code_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_promo_codes_promo_code_id_fkey"
            columns: ["promo_code_id"]
            isOneToOne: false
            referencedRelation: "promo_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      virgil_conversations: {
        Row: {
          created_at: string | null
          id: string
          last_message: string | null
          mode_icon: string
          mode_id: string
          mode_title: string
          session_id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_message?: string | null
          mode_icon: string
          mode_id: string
          mode_title: string
          session_id: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_message?: string | null
          mode_icon?: string
          mode_id?: string
          mode_title?: string
          session_id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      decision_tree_view: {
        Row: {
          category: Database["public"]["Enums"]["dna_category"] | null
          next_question_a: string | null
          next_question_b: string | null
          question: string | null
          tree_position: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_token_availability: {
        Args: { user_id_param: string }
        Returns: boolean
      }
      debug_auth_state: {
        Args: Record<PropertyKey, never>
        Returns: {
          has_jwt: boolean
          jwt_claims: Json
          role_name: string
          user_id: string
        }[]
      }
      debug_jwt: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      generate_vanity_url: {
        Args: { full_name: string; user_id: string }
        Returns: string
      }
      get_files_batch: {
        Args: { last_id: string; page_size: number }
        Returns: {
          id: string
          folder: string
          name: string
          url: string
        }[]
      }
      get_user_subscription: {
        Args: { user_id_param: string }
        Returns: {
          subscription_status: string
          subscription_tier: string
        }[]
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
    }
    Enums: {
      dna_category:
        | "ETHICS"
        | "AESTHETICS"
        | "POLITICS"
        | "THEOLOGY"
        | "ONTOLOGY"
        | "EPISTEMOLOGY"
      dna_result_type: "section_1" | "section_2" | "section_3"
      question_category:
        | "AESTHETICS"
        | "EPISTEMOLOGY"
        | "ETHICS"
        | "ONTOLOGY"
        | "POLITICS"
        | "THEOLOGY"
      share_message_type:
        | "classic_text"
        | "classic_art"
        | "classic_music"
        | "icon"
        | "concept"
        | "virgil"
        | "courses"
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
    Enums: {
      dna_category: [
        "ETHICS",
        "AESTHETICS",
        "POLITICS",
        "THEOLOGY",
        "ONTOLOGY",
        "EPISTEMOLOGY",
      ],
      dna_result_type: ["section_1", "section_2", "section_3"],
      question_category: [
        "AESTHETICS",
        "EPISTEMOLOGY",
        "ETHICS",
        "ONTOLOGY",
        "POLITICS",
        "THEOLOGY",
      ],
      share_message_type: [
        "classic_text",
        "classic_art",
        "classic_music",
        "icon",
        "concept",
        "virgil",
        "courses",
      ],
    },
  },
} as const
