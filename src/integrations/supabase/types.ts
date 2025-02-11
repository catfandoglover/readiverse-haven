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
      concepts: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          illustration: string
          randomizer: number
          title: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          illustration: string
          randomizer?: number
          title: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          illustration?: string
          randomizer?: number
          title?: string
        }
        Relationships: []
      }
      dna_analysis_results: {
        Row: {
          aesthetics_challenging_voice_1: string | null
          aesthetics_challenging_voice_1_classic: string | null
          aesthetics_challenging_voice_1_rationale: string | null
          aesthetics_challenging_voice_2: string | null
          aesthetics_challenging_voice_2_classic: string | null
          aesthetics_challenging_voice_2_rationale: string | null
          aesthetics_challenging_voice_3: string | null
          aesthetics_challenging_voice_3_classic: string | null
          aesthetics_challenging_voice_3_rationale: string | null
          aesthetics_challenging_voice_4: string | null
          aesthetics_challenging_voice_4_classic: string | null
          aesthetics_challenging_voice_4_rationale: string | null
          aesthetics_challenging_voice_5: string | null
          aesthetics_challenging_voice_5_classic: string | null
          aesthetics_challenging_voice_5_rationale: string | null
          aesthetics_introduction: string | null
          aesthetics_kindred_spirit_1: string | null
          aesthetics_kindred_spirit_1_classic: string | null
          aesthetics_kindred_spirit_1_rationale: string | null
          aesthetics_kindred_spirit_2: string | null
          aesthetics_kindred_spirit_2_classic: string | null
          aesthetics_kindred_spirit_2_rationale: string | null
          aesthetics_kindred_spirit_3: string | null
          aesthetics_kindred_spirit_3_classic: string | null
          aesthetics_kindred_spirit_3_rationale: string | null
          aesthetics_kindred_spirit_4: string | null
          aesthetics_kindred_spirit_4_classic: string | null
          aesthetics_kindred_spirit_4_rationale: string | null
          aesthetics_kindred_spirit_5: string | null
          aesthetics_kindred_spirit_5_classic: string | null
          aesthetics_kindred_spirit_5_rationale: string | null
          analysis_text: string | null
          analysis_type: Database["public"]["Enums"]["dna_result_type"]
          archetype: string | null
          archetype_definition: string | null
          assessment_id: string
          conclusion: string | null
          created_at: string
          epistemology_challenging_voice_1: string | null
          epistemology_challenging_voice_1_classic: string | null
          epistemology_challenging_voice_1_rationale: string | null
          epistemology_challenging_voice_2: string | null
          epistemology_challenging_voice_2_classic: string | null
          epistemology_challenging_voice_2_rationale: string | null
          epistemology_challenging_voice_3: string | null
          epistemology_challenging_voice_3_classic: string | null
          epistemology_challenging_voice_3_rationale: string | null
          epistemology_challenging_voice_4: string | null
          epistemology_challenging_voice_4_classic: string | null
          epistemology_challenging_voice_4_rationale: string | null
          epistemology_challenging_voice_5: string | null
          epistemology_challenging_voice_5_classic: string | null
          epistemology_challenging_voice_5_rationale: string | null
          epistemology_introduction: string | null
          epistemology_kindred_spirit_1: string | null
          epistemology_kindred_spirit_1_classic: string | null
          epistemology_kindred_spirit_1_rationale: string | null
          epistemology_kindred_spirit_2: string | null
          epistemology_kindred_spirit_2_classic: string | null
          epistemology_kindred_spirit_2_rationale: string | null
          epistemology_kindred_spirit_3: string | null
          epistemology_kindred_spirit_3_classic: string | null
          epistemology_kindred_spirit_3_rationale: string | null
          epistemology_kindred_spirit_4: string | null
          epistemology_kindred_spirit_4_classic: string | null
          epistemology_kindred_spirit_4_rationale: string | null
          epistemology_kindred_spirit_5: string | null
          epistemology_kindred_spirit_5_classic: string | null
          epistemology_kindred_spirit_5_rationale: string | null
          ethics_challenging_voice_1: string | null
          ethics_challenging_voice_1_classic: string | null
          ethics_challenging_voice_1_rationale: string | null
          ethics_challenging_voice_2: string | null
          ethics_challenging_voice_2_classic: string | null
          ethics_challenging_voice_2_rationale: string | null
          ethics_challenging_voice_3: string | null
          ethics_challenging_voice_3_classic: string | null
          ethics_challenging_voice_3_rationale: string | null
          ethics_challenging_voice_4: string | null
          ethics_challenging_voice_4_classic: string | null
          ethics_challenging_voice_4_rationale: string | null
          ethics_challenging_voice_5: string | null
          ethics_challenging_voice_5_classic: string | null
          ethics_challenging_voice_5_rationale: string | null
          ethics_introduction: string | null
          ethics_kindred_spirit_1: string | null
          ethics_kindred_spirit_1_classic: string | null
          ethics_kindred_spirit_1_rationale: string | null
          ethics_kindred_spirit_2: string | null
          ethics_kindred_spirit_2_classic: string | null
          ethics_kindred_spirit_2_rationale: string | null
          ethics_kindred_spirit_3: string | null
          ethics_kindred_spirit_3_classic: string | null
          ethics_kindred_spirit_3_rationale: string | null
          ethics_kindred_spirit_4: string | null
          ethics_kindred_spirit_4_classic: string | null
          ethics_kindred_spirit_4_rationale: string | null
          ethics_kindred_spirit_5: string | null
          ethics_kindred_spirit_5_classic: string | null
          ethics_kindred_spirit_5_rationale: string | null
          growth_edges_1: string | null
          growth_edges_2: string | null
          growth_edges_3: string | null
          id: string
          introduction: string | null
          key_tension_1: string | null
          key_tension_2: string | null
          key_tension_3: string | null
          name: string | null
          natural_strength_1: string | null
          natural_strength_2: string | null
          natural_strength_3: string | null
          next_steps: string | null
          ontology_challenging_voice_1: string | null
          ontology_challenging_voice_1_classic: string | null
          ontology_challenging_voice_1_rationale: string | null
          ontology_challenging_voice_2: string | null
          ontology_challenging_voice_2_classic: string | null
          ontology_challenging_voice_2_rationale: string | null
          ontology_challenging_voice_3: string | null
          ontology_challenging_voice_3_classic: string | null
          ontology_challenging_voice_3_rationale: string | null
          ontology_challenging_voice_4: string | null
          ontology_challenging_voice_4_classic: string | null
          ontology_challenging_voice_4_rationale: string | null
          ontology_challenging_voice_5: string | null
          ontology_challenging_voice_5_classic: string | null
          ontology_challenging_voice_5_rationale: string | null
          ontology_introduction: string | null
          ontology_kindred_spirit_1: string | null
          ontology_kindred_spirit_1_classic: string | null
          ontology_kindred_spirit_1_rationale: string | null
          ontology_kindred_spirit_2: string | null
          ontology_kindred_spirit_2_classic: string | null
          ontology_kindred_spirit_2_rationale: string | null
          ontology_kindred_spirit_3: string | null
          ontology_kindred_spirit_3_classic: string | null
          ontology_kindred_spirit_3_rationale: string | null
          ontology_kindred_spirit_4: string | null
          ontology_kindred_spirit_4_classic: string | null
          ontology_kindred_spirit_4_rationale: string | null
          ontology_kindred_spirit_5: string | null
          ontology_kindred_spirit_5_classic: string | null
          ontology_kindred_spirit_5_rationale: string | null
          politics_challenging_voice_1: string | null
          politics_challenging_voice_1_classic: string | null
          politics_challenging_voice_1_rationale: string | null
          politics_challenging_voice_2: string | null
          politics_challenging_voice_2_classic: string | null
          politics_challenging_voice_2_rationale: string | null
          politics_challenging_voice_3: string | null
          politics_challenging_voice_3_classic: string | null
          politics_challenging_voice_3_rationale: string | null
          politics_challenging_voice_4: string | null
          politics_challenging_voice_4_classic: string | null
          politics_challenging_voice_4_rationale: string | null
          politics_challenging_voice_5: string | null
          politics_challenging_voice_5_classic: string | null
          politics_challenging_voice_5_rationale: string | null
          politics_introduction: string | null
          politics_kindred_spirit_1: string | null
          politics_kindred_spirit_1_classic: string | null
          politics_kindred_spirit_1_rationale: string | null
          politics_kindred_spirit_2: string | null
          politics_kindred_spirit_2_classic: string | null
          politics_kindred_spirit_2_rationale: string | null
          politics_kindred_spirit_3: string | null
          politics_kindred_spirit_3_classic: string | null
          politics_kindred_spirit_3_rationale: string | null
          politics_kindred_spirit_4: string | null
          politics_kindred_spirit_4_classic: string | null
          politics_kindred_spirit_4_rationale: string | null
          politics_kindred_spirit_5: string | null
          politics_kindred_spirit_5_classic: string | null
          politics_kindred_spirit_5_rationale: string | null
          profile_image_url: string | null
          raw_response: Json | null
          theology_challenging_voice_1: string | null
          theology_challenging_voice_1_classic: string | null
          theology_challenging_voice_1_rationale: string | null
          theology_challenging_voice_2: string | null
          theology_challenging_voice_2_classic: string | null
          theology_challenging_voice_2_rationale: string | null
          theology_challenging_voice_3: string | null
          theology_challenging_voice_3_classic: string | null
          theology_challenging_voice_3_rationale: string | null
          theology_challenging_voice_4: string | null
          theology_challenging_voice_4_classic: string | null
          theology_challenging_voice_4_rationale: string | null
          theology_challenging_voice_5: string | null
          theology_challenging_voice_5_classic: string | null
          theology_challenging_voice_5_rationale: string | null
          theology_introduction: string | null
          theology_kindred_spirit_1: string | null
          theology_kindred_spirit_1_classic: string | null
          theology_kindred_spirit_1_rationale: string | null
          theology_kindred_spirit_2: string | null
          theology_kindred_spirit_2_classic: string | null
          theology_kindred_spirit_2_rationale: string | null
          theology_kindred_spirit_3: string | null
          theology_kindred_spirit_3_classic: string | null
          theology_kindred_spirit_3_rationale: string | null
          theology_kindred_spirit_4: string | null
          theology_kindred_spirit_4_classic: string | null
          theology_kindred_spirit_4_rationale: string | null
          theology_kindred_spirit_5: string | null
          theology_kindred_spirit_5_classic: string | null
          theology_kindred_spirit_5_rationale: string | null
        }
        Insert: {
          aesthetics_challenging_voice_1?: string | null
          aesthetics_challenging_voice_1_classic?: string | null
          aesthetics_challenging_voice_1_rationale?: string | null
          aesthetics_challenging_voice_2?: string | null
          aesthetics_challenging_voice_2_classic?: string | null
          aesthetics_challenging_voice_2_rationale?: string | null
          aesthetics_challenging_voice_3?: string | null
          aesthetics_challenging_voice_3_classic?: string | null
          aesthetics_challenging_voice_3_rationale?: string | null
          aesthetics_challenging_voice_4?: string | null
          aesthetics_challenging_voice_4_classic?: string | null
          aesthetics_challenging_voice_4_rationale?: string | null
          aesthetics_challenging_voice_5?: string | null
          aesthetics_challenging_voice_5_classic?: string | null
          aesthetics_challenging_voice_5_rationale?: string | null
          aesthetics_introduction?: string | null
          aesthetics_kindred_spirit_1?: string | null
          aesthetics_kindred_spirit_1_classic?: string | null
          aesthetics_kindred_spirit_1_rationale?: string | null
          aesthetics_kindred_spirit_2?: string | null
          aesthetics_kindred_spirit_2_classic?: string | null
          aesthetics_kindred_spirit_2_rationale?: string | null
          aesthetics_kindred_spirit_3?: string | null
          aesthetics_kindred_spirit_3_classic?: string | null
          aesthetics_kindred_spirit_3_rationale?: string | null
          aesthetics_kindred_spirit_4?: string | null
          aesthetics_kindred_spirit_4_classic?: string | null
          aesthetics_kindred_spirit_4_rationale?: string | null
          aesthetics_kindred_spirit_5?: string | null
          aesthetics_kindred_spirit_5_classic?: string | null
          aesthetics_kindred_spirit_5_rationale?: string | null
          analysis_text?: string | null
          analysis_type: Database["public"]["Enums"]["dna_result_type"]
          archetype?: string | null
          archetype_definition?: string | null
          assessment_id: string
          conclusion?: string | null
          created_at?: string
          epistemology_challenging_voice_1?: string | null
          epistemology_challenging_voice_1_classic?: string | null
          epistemology_challenging_voice_1_rationale?: string | null
          epistemology_challenging_voice_2?: string | null
          epistemology_challenging_voice_2_classic?: string | null
          epistemology_challenging_voice_2_rationale?: string | null
          epistemology_challenging_voice_3?: string | null
          epistemology_challenging_voice_3_classic?: string | null
          epistemology_challenging_voice_3_rationale?: string | null
          epistemology_challenging_voice_4?: string | null
          epistemology_challenging_voice_4_classic?: string | null
          epistemology_challenging_voice_4_rationale?: string | null
          epistemology_challenging_voice_5?: string | null
          epistemology_challenging_voice_5_classic?: string | null
          epistemology_challenging_voice_5_rationale?: string | null
          epistemology_introduction?: string | null
          epistemology_kindred_spirit_1?: string | null
          epistemology_kindred_spirit_1_classic?: string | null
          epistemology_kindred_spirit_1_rationale?: string | null
          epistemology_kindred_spirit_2?: string | null
          epistemology_kindred_spirit_2_classic?: string | null
          epistemology_kindred_spirit_2_rationale?: string | null
          epistemology_kindred_spirit_3?: string | null
          epistemology_kindred_spirit_3_classic?: string | null
          epistemology_kindred_spirit_3_rationale?: string | null
          epistemology_kindred_spirit_4?: string | null
          epistemology_kindred_spirit_4_classic?: string | null
          epistemology_kindred_spirit_4_rationale?: string | null
          epistemology_kindred_spirit_5?: string | null
          epistemology_kindred_spirit_5_classic?: string | null
          epistemology_kindred_spirit_5_rationale?: string | null
          ethics_challenging_voice_1?: string | null
          ethics_challenging_voice_1_classic?: string | null
          ethics_challenging_voice_1_rationale?: string | null
          ethics_challenging_voice_2?: string | null
          ethics_challenging_voice_2_classic?: string | null
          ethics_challenging_voice_2_rationale?: string | null
          ethics_challenging_voice_3?: string | null
          ethics_challenging_voice_3_classic?: string | null
          ethics_challenging_voice_3_rationale?: string | null
          ethics_challenging_voice_4?: string | null
          ethics_challenging_voice_4_classic?: string | null
          ethics_challenging_voice_4_rationale?: string | null
          ethics_challenging_voice_5?: string | null
          ethics_challenging_voice_5_classic?: string | null
          ethics_challenging_voice_5_rationale?: string | null
          ethics_introduction?: string | null
          ethics_kindred_spirit_1?: string | null
          ethics_kindred_spirit_1_classic?: string | null
          ethics_kindred_spirit_1_rationale?: string | null
          ethics_kindred_spirit_2?: string | null
          ethics_kindred_spirit_2_classic?: string | null
          ethics_kindred_spirit_2_rationale?: string | null
          ethics_kindred_spirit_3?: string | null
          ethics_kindred_spirit_3_classic?: string | null
          ethics_kindred_spirit_3_rationale?: string | null
          ethics_kindred_spirit_4?: string | null
          ethics_kindred_spirit_4_classic?: string | null
          ethics_kindred_spirit_4_rationale?: string | null
          ethics_kindred_spirit_5?: string | null
          ethics_kindred_spirit_5_classic?: string | null
          ethics_kindred_spirit_5_rationale?: string | null
          growth_edges_1?: string | null
          growth_edges_2?: string | null
          growth_edges_3?: string | null
          id?: string
          introduction?: string | null
          key_tension_1?: string | null
          key_tension_2?: string | null
          key_tension_3?: string | null
          name?: string | null
          natural_strength_1?: string | null
          natural_strength_2?: string | null
          natural_strength_3?: string | null
          next_steps?: string | null
          ontology_challenging_voice_1?: string | null
          ontology_challenging_voice_1_classic?: string | null
          ontology_challenging_voice_1_rationale?: string | null
          ontology_challenging_voice_2?: string | null
          ontology_challenging_voice_2_classic?: string | null
          ontology_challenging_voice_2_rationale?: string | null
          ontology_challenging_voice_3?: string | null
          ontology_challenging_voice_3_classic?: string | null
          ontology_challenging_voice_3_rationale?: string | null
          ontology_challenging_voice_4?: string | null
          ontology_challenging_voice_4_classic?: string | null
          ontology_challenging_voice_4_rationale?: string | null
          ontology_challenging_voice_5?: string | null
          ontology_challenging_voice_5_classic?: string | null
          ontology_challenging_voice_5_rationale?: string | null
          ontology_introduction?: string | null
          ontology_kindred_spirit_1?: string | null
          ontology_kindred_spirit_1_classic?: string | null
          ontology_kindred_spirit_1_rationale?: string | null
          ontology_kindred_spirit_2?: string | null
          ontology_kindred_spirit_2_classic?: string | null
          ontology_kindred_spirit_2_rationale?: string | null
          ontology_kindred_spirit_3?: string | null
          ontology_kindred_spirit_3_classic?: string | null
          ontology_kindred_spirit_3_rationale?: string | null
          ontology_kindred_spirit_4?: string | null
          ontology_kindred_spirit_4_classic?: string | null
          ontology_kindred_spirit_4_rationale?: string | null
          ontology_kindred_spirit_5?: string | null
          ontology_kindred_spirit_5_classic?: string | null
          ontology_kindred_spirit_5_rationale?: string | null
          politics_challenging_voice_1?: string | null
          politics_challenging_voice_1_classic?: string | null
          politics_challenging_voice_1_rationale?: string | null
          politics_challenging_voice_2?: string | null
          politics_challenging_voice_2_classic?: string | null
          politics_challenging_voice_2_rationale?: string | null
          politics_challenging_voice_3?: string | null
          politics_challenging_voice_3_classic?: string | null
          politics_challenging_voice_3_rationale?: string | null
          politics_challenging_voice_4?: string | null
          politics_challenging_voice_4_classic?: string | null
          politics_challenging_voice_4_rationale?: string | null
          politics_challenging_voice_5?: string | null
          politics_challenging_voice_5_classic?: string | null
          politics_challenging_voice_5_rationale?: string | null
          politics_introduction?: string | null
          politics_kindred_spirit_1?: string | null
          politics_kindred_spirit_1_classic?: string | null
          politics_kindred_spirit_1_rationale?: string | null
          politics_kindred_spirit_2?: string | null
          politics_kindred_spirit_2_classic?: string | null
          politics_kindred_spirit_2_rationale?: string | null
          politics_kindred_spirit_3?: string | null
          politics_kindred_spirit_3_classic?: string | null
          politics_kindred_spirit_3_rationale?: string | null
          politics_kindred_spirit_4?: string | null
          politics_kindred_spirit_4_classic?: string | null
          politics_kindred_spirit_4_rationale?: string | null
          politics_kindred_spirit_5?: string | null
          politics_kindred_spirit_5_classic?: string | null
          politics_kindred_spirit_5_rationale?: string | null
          profile_image_url?: string | null
          raw_response?: Json | null
          theology_challenging_voice_1?: string | null
          theology_challenging_voice_1_classic?: string | null
          theology_challenging_voice_1_rationale?: string | null
          theology_challenging_voice_2?: string | null
          theology_challenging_voice_2_classic?: string | null
          theology_challenging_voice_2_rationale?: string | null
          theology_challenging_voice_3?: string | null
          theology_challenging_voice_3_classic?: string | null
          theology_challenging_voice_3_rationale?: string | null
          theology_challenging_voice_4?: string | null
          theology_challenging_voice_4_classic?: string | null
          theology_challenging_voice_4_rationale?: string | null
          theology_challenging_voice_5?: string | null
          theology_challenging_voice_5_classic?: string | null
          theology_challenging_voice_5_rationale?: string | null
          theology_introduction?: string | null
          theology_kindred_spirit_1?: string | null
          theology_kindred_spirit_1_classic?: string | null
          theology_kindred_spirit_1_rationale?: string | null
          theology_kindred_spirit_2?: string | null
          theology_kindred_spirit_2_classic?: string | null
          theology_kindred_spirit_2_rationale?: string | null
          theology_kindred_spirit_3?: string | null
          theology_kindred_spirit_3_classic?: string | null
          theology_kindred_spirit_3_rationale?: string | null
          theology_kindred_spirit_4?: string | null
          theology_kindred_spirit_4_classic?: string | null
          theology_kindred_spirit_4_rationale?: string | null
          theology_kindred_spirit_5?: string | null
          theology_kindred_spirit_5_classic?: string | null
          theology_kindred_spirit_5_rationale?: string | null
        }
        Update: {
          aesthetics_challenging_voice_1?: string | null
          aesthetics_challenging_voice_1_classic?: string | null
          aesthetics_challenging_voice_1_rationale?: string | null
          aesthetics_challenging_voice_2?: string | null
          aesthetics_challenging_voice_2_classic?: string | null
          aesthetics_challenging_voice_2_rationale?: string | null
          aesthetics_challenging_voice_3?: string | null
          aesthetics_challenging_voice_3_classic?: string | null
          aesthetics_challenging_voice_3_rationale?: string | null
          aesthetics_challenging_voice_4?: string | null
          aesthetics_challenging_voice_4_classic?: string | null
          aesthetics_challenging_voice_4_rationale?: string | null
          aesthetics_challenging_voice_5?: string | null
          aesthetics_challenging_voice_5_classic?: string | null
          aesthetics_challenging_voice_5_rationale?: string | null
          aesthetics_introduction?: string | null
          aesthetics_kindred_spirit_1?: string | null
          aesthetics_kindred_spirit_1_classic?: string | null
          aesthetics_kindred_spirit_1_rationale?: string | null
          aesthetics_kindred_spirit_2?: string | null
          aesthetics_kindred_spirit_2_classic?: string | null
          aesthetics_kindred_spirit_2_rationale?: string | null
          aesthetics_kindred_spirit_3?: string | null
          aesthetics_kindred_spirit_3_classic?: string | null
          aesthetics_kindred_spirit_3_rationale?: string | null
          aesthetics_kindred_spirit_4?: string | null
          aesthetics_kindred_spirit_4_classic?: string | null
          aesthetics_kindred_spirit_4_rationale?: string | null
          aesthetics_kindred_spirit_5?: string | null
          aesthetics_kindred_spirit_5_classic?: string | null
          aesthetics_kindred_spirit_5_rationale?: string | null
          analysis_text?: string | null
          analysis_type?: Database["public"]["Enums"]["dna_result_type"]
          archetype?: string | null
          archetype_definition?: string | null
          assessment_id?: string
          conclusion?: string | null
          created_at?: string
          epistemology_challenging_voice_1?: string | null
          epistemology_challenging_voice_1_classic?: string | null
          epistemology_challenging_voice_1_rationale?: string | null
          epistemology_challenging_voice_2?: string | null
          epistemology_challenging_voice_2_classic?: string | null
          epistemology_challenging_voice_2_rationale?: string | null
          epistemology_challenging_voice_3?: string | null
          epistemology_challenging_voice_3_classic?: string | null
          epistemology_challenging_voice_3_rationale?: string | null
          epistemology_challenging_voice_4?: string | null
          epistemology_challenging_voice_4_classic?: string | null
          epistemology_challenging_voice_4_rationale?: string | null
          epistemology_challenging_voice_5?: string | null
          epistemology_challenging_voice_5_classic?: string | null
          epistemology_challenging_voice_5_rationale?: string | null
          epistemology_introduction?: string | null
          epistemology_kindred_spirit_1?: string | null
          epistemology_kindred_spirit_1_classic?: string | null
          epistemology_kindred_spirit_1_rationale?: string | null
          epistemology_kindred_spirit_2?: string | null
          epistemology_kindred_spirit_2_classic?: string | null
          epistemology_kindred_spirit_2_rationale?: string | null
          epistemology_kindred_spirit_3?: string | null
          epistemology_kindred_spirit_3_classic?: string | null
          epistemology_kindred_spirit_3_rationale?: string | null
          epistemology_kindred_spirit_4?: string | null
          epistemology_kindred_spirit_4_classic?: string | null
          epistemology_kindred_spirit_4_rationale?: string | null
          epistemology_kindred_spirit_5?: string | null
          epistemology_kindred_spirit_5_classic?: string | null
          epistemology_kindred_spirit_5_rationale?: string | null
          ethics_challenging_voice_1?: string | null
          ethics_challenging_voice_1_classic?: string | null
          ethics_challenging_voice_1_rationale?: string | null
          ethics_challenging_voice_2?: string | null
          ethics_challenging_voice_2_classic?: string | null
          ethics_challenging_voice_2_rationale?: string | null
          ethics_challenging_voice_3?: string | null
          ethics_challenging_voice_3_classic?: string | null
          ethics_challenging_voice_3_rationale?: string | null
          ethics_challenging_voice_4?: string | null
          ethics_challenging_voice_4_classic?: string | null
          ethics_challenging_voice_4_rationale?: string | null
          ethics_challenging_voice_5?: string | null
          ethics_challenging_voice_5_classic?: string | null
          ethics_challenging_voice_5_rationale?: string | null
          ethics_introduction?: string | null
          ethics_kindred_spirit_1?: string | null
          ethics_kindred_spirit_1_classic?: string | null
          ethics_kindred_spirit_1_rationale?: string | null
          ethics_kindred_spirit_2?: string | null
          ethics_kindred_spirit_2_classic?: string | null
          ethics_kindred_spirit_2_rationale?: string | null
          ethics_kindred_spirit_3?: string | null
          ethics_kindred_spirit_3_classic?: string | null
          ethics_kindred_spirit_3_rationale?: string | null
          ethics_kindred_spirit_4?: string | null
          ethics_kindred_spirit_4_classic?: string | null
          ethics_kindred_spirit_4_rationale?: string | null
          ethics_kindred_spirit_5?: string | null
          ethics_kindred_spirit_5_classic?: string | null
          ethics_kindred_spirit_5_rationale?: string | null
          growth_edges_1?: string | null
          growth_edges_2?: string | null
          growth_edges_3?: string | null
          id?: string
          introduction?: string | null
          key_tension_1?: string | null
          key_tension_2?: string | null
          key_tension_3?: string | null
          name?: string | null
          natural_strength_1?: string | null
          natural_strength_2?: string | null
          natural_strength_3?: string | null
          next_steps?: string | null
          ontology_challenging_voice_1?: string | null
          ontology_challenging_voice_1_classic?: string | null
          ontology_challenging_voice_1_rationale?: string | null
          ontology_challenging_voice_2?: string | null
          ontology_challenging_voice_2_classic?: string | null
          ontology_challenging_voice_2_rationale?: string | null
          ontology_challenging_voice_3?: string | null
          ontology_challenging_voice_3_classic?: string | null
          ontology_challenging_voice_3_rationale?: string | null
          ontology_challenging_voice_4?: string | null
          ontology_challenging_voice_4_classic?: string | null
          ontology_challenging_voice_4_rationale?: string | null
          ontology_challenging_voice_5?: string | null
          ontology_challenging_voice_5_classic?: string | null
          ontology_challenging_voice_5_rationale?: string | null
          ontology_introduction?: string | null
          ontology_kindred_spirit_1?: string | null
          ontology_kindred_spirit_1_classic?: string | null
          ontology_kindred_spirit_1_rationale?: string | null
          ontology_kindred_spirit_2?: string | null
          ontology_kindred_spirit_2_classic?: string | null
          ontology_kindred_spirit_2_rationale?: string | null
          ontology_kindred_spirit_3?: string | null
          ontology_kindred_spirit_3_classic?: string | null
          ontology_kindred_spirit_3_rationale?: string | null
          ontology_kindred_spirit_4?: string | null
          ontology_kindred_spirit_4_classic?: string | null
          ontology_kindred_spirit_4_rationale?: string | null
          ontology_kindred_spirit_5?: string | null
          ontology_kindred_spirit_5_classic?: string | null
          ontology_kindred_spirit_5_rationale?: string | null
          politics_challenging_voice_1?: string | null
          politics_challenging_voice_1_classic?: string | null
          politics_challenging_voice_1_rationale?: string | null
          politics_challenging_voice_2?: string | null
          politics_challenging_voice_2_classic?: string | null
          politics_challenging_voice_2_rationale?: string | null
          politics_challenging_voice_3?: string | null
          politics_challenging_voice_3_classic?: string | null
          politics_challenging_voice_3_rationale?: string | null
          politics_challenging_voice_4?: string | null
          politics_challenging_voice_4_classic?: string | null
          politics_challenging_voice_4_rationale?: string | null
          politics_challenging_voice_5?: string | null
          politics_challenging_voice_5_classic?: string | null
          politics_challenging_voice_5_rationale?: string | null
          politics_introduction?: string | null
          politics_kindred_spirit_1?: string | null
          politics_kindred_spirit_1_classic?: string | null
          politics_kindred_spirit_1_rationale?: string | null
          politics_kindred_spirit_2?: string | null
          politics_kindred_spirit_2_classic?: string | null
          politics_kindred_spirit_2_rationale?: string | null
          politics_kindred_spirit_3?: string | null
          politics_kindred_spirit_3_classic?: string | null
          politics_kindred_spirit_3_rationale?: string | null
          politics_kindred_spirit_4?: string | null
          politics_kindred_spirit_4_classic?: string | null
          politics_kindred_spirit_4_rationale?: string | null
          politics_kindred_spirit_5?: string | null
          politics_kindred_spirit_5_classic?: string | null
          politics_kindred_spirit_5_rationale?: string | null
          profile_image_url?: string | null
          raw_response?: Json | null
          theology_challenging_voice_1?: string | null
          theology_challenging_voice_1_classic?: string | null
          theology_challenging_voice_1_rationale?: string | null
          theology_challenging_voice_2?: string | null
          theology_challenging_voice_2_classic?: string | null
          theology_challenging_voice_2_rationale?: string | null
          theology_challenging_voice_3?: string | null
          theology_challenging_voice_3_classic?: string | null
          theology_challenging_voice_3_rationale?: string | null
          theology_challenging_voice_4?: string | null
          theology_challenging_voice_4_classic?: string | null
          theology_challenging_voice_4_rationale?: string | null
          theology_challenging_voice_5?: string | null
          theology_challenging_voice_5_classic?: string | null
          theology_challenging_voice_5_rationale?: string | null
          theology_introduction?: string | null
          theology_kindred_spirit_1?: string | null
          theology_kindred_spirit_1_classic?: string | null
          theology_kindred_spirit_1_rationale?: string | null
          theology_kindred_spirit_2?: string | null
          theology_kindred_spirit_2_classic?: string | null
          theology_kindred_spirit_2_rationale?: string | null
          theology_kindred_spirit_3?: string | null
          theology_kindred_spirit_3_classic?: string | null
          theology_kindred_spirit_3_rationale?: string | null
          theology_kindred_spirit_4?: string | null
          theology_kindred_spirit_4_classic?: string | null
          theology_kindred_spirit_4_rationale?: string | null
          theology_kindred_spirit_5?: string | null
          theology_kindred_spirit_5_classic?: string | null
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
          theology_sequence?: string | null
        }
        Relationships: []
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
          {
            foreignKeyName: "fk_next_question_a"
            columns: ["next_question_a_id"]
            isOneToOne: false
            referencedRelation: "dna_tree_structure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_next_question_b"
            columns: ["next_question_b_id"]
            isOneToOne: false
            referencedRelation: "dna_tree_structure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_question"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "great_questions"
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
          id: string
          illustration: string | null
          notion_id: string
          question: string
          related_classics: string[] | null
        }
        Insert: {
          answer_a?: string | null
          answer_b?: string | null
          category: string
          category_number?: string | null
          created_at?: string
          id?: string
          illustration?: string | null
          notion_id: string
          question: string
          related_classics?: string[] | null
        }
        Update: {
          answer_a?: string | null
          answer_b?: string | null
          category?: string
          category_number?: string | null
          created_at?: string
          id?: string
          illustration?: string | null
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
      [_ in never]: never
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
