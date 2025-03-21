

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "public";






CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";






CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."dna_category" AS ENUM (
    'ETHICS',
    'AESTHETICS',
    'POLITICS',
    'THEOLOGY',
    'ONTOLOGY',
    'EPISTEMOLOGY'
);


ALTER TYPE "public"."dna_category" OWNER TO "postgres";


CREATE TYPE "public"."dna_result_type" AS ENUM (
    'section_1',
    'section_2',
    'section_3'
);


ALTER TYPE "public"."dna_result_type" OWNER TO "postgres";


CREATE TYPE "public"."question_category" AS ENUM (
    'AESTHETICS',
    'EPISTEMOLOGY',
    'ETHICS',
    'ONTOLOGY',
    'POLITICS',
    'THEOLOGY'
);


ALTER TYPE "public"."question_category" OWNER TO "postgres";


CREATE TYPE "public"."share_message_type" AS ENUM (
    'classic_text',
    'classic_art',
    'classic_music',
    'icon',
    'concept',
    'virgil',
    'courses'
);


ALTER TYPE "public"."share_message_type" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."add_book_to_user_library"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  insert into public.user_library (user_id, book_id)
  values (auth.uid(), NEW.book_id)
  on conflict (user_id, book_id) do nothing;
  return NEW;
end;
$$;


ALTER FUNCTION "public"."add_book_to_user_library"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."debug_auth_state"() RETURNS TABLE("has_jwt" boolean, "jwt_claims" "json", "role_name" "text", "user_id" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY SELECT 
    current_setting('request.jwt.claims', true) IS NOT NULL,
    current_setting('request.jwt.claims', true)::json,
    current_setting('request.jwt.claims.role', true),
    auth.uid()::text;
END;
$$;


ALTER FUNCTION "public"."debug_auth_state"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."debug_jwt"() RETURNS "json"
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  SELECT current_setting('request.jwt.claims', true)::json;
$$;


ALTER FUNCTION "public"."debug_jwt"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."ensure_profile_exists"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.profiles (outseta_user_id, email)
  VALUES (NEW.outseta_user_id, 'pending@example.com')
  ON CONFLICT (outseta_user_id) DO NOTHING;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."ensure_profile_exists"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."populate_book_questions"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Clear existing entries for this question or book
    DELETE FROM book_questions 
    WHERE 
        CASE 
            WHEN TG_TABLE_NAME = 'great_questions' THEN question_id = NEW.id
            WHEN TG_TABLE_NAME = 'books' THEN book_id = NEW.id
        END;
    
    -- Insert new entries based on URL matching
    IF TG_TABLE_NAME = 'great_questions' THEN
        -- For each URL in the related_classics array, find matching books
        INSERT INTO book_questions (question_id, book_id, randomizer)
        SELECT DISTINCT
            NEW.id,
            b.id,
            random()
        FROM books b
        CROSS JOIN unnest(NEW.related_classics) AS url
        WHERE 
            -- Clean and compare URLs by removing whitespace, [, ], and quotes
            split_part(b."Notion_URL", '/', -1) = 
            split_part(
                trim(both ' []"' from url),
                '/',
                -1
            )
        ON CONFLICT DO NOTHING;
    ELSIF TG_TABLE_NAME = 'books' AND NEW."Notion_URL" IS NOT NULL THEN
        -- For each question, check if the book's Notion_URL exists in its related_classics array
        INSERT INTO book_questions (question_id, book_id, randomizer)
        SELECT DISTINCT
            q.id,
            NEW.id,
            random()
        FROM great_questions q
        WHERE 
            -- Check if any URL in related_classics matches the book's Notion_URL
            EXISTS (
                SELECT 1
                FROM unnest(q.related_classics) AS url
                WHERE 
                    split_part(NEW."Notion_URL", '/', -1) = 
                    split_part(
                        trim(both ' []"' from url),
                        '/',
                        -1
                    )
            )
        ON CONFLICT DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."populate_book_questions"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."art" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "title" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "author" "text",
    "art_file_url" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "Notion_URL" "text",
    "randomizer" double precision DEFAULT "random"(),
    "about" "text",
    "icon_illustration" "text",
    "introduction" "text"
);


ALTER TABLE "public"."art" OWNER TO "postgres";


COMMENT ON TABLE "public"."art" IS 'This is a duplicate of books';



COMMENT ON COLUMN "public"."art"."Notion_URL" IS 'Notion Page URL for Matching to Questions Table';



COMMENT ON COLUMN "public"."art"."about" IS 'Feed Description';



COMMENT ON COLUMN "public"."art"."icon_illustration" IS 'Portrait of the Author(s)';



CREATE TABLE IF NOT EXISTS "public"."user_badges" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "userid" "text",
    "entry_text" "uuid" DEFAULT "gen_random_uuid"(),
    "score" "text",
    "summary" "text",
    "entry_icon" "uuid",
    "entry_concepts" "uuid",
    "session_duration" numeric
);


ALTER TABLE "public"."user_badges" OWNER TO "postgres";


COMMENT ON COLUMN "public"."user_badges"."session_duration" IS 'time in seconds of session duration';



ALTER TABLE "public"."user_badges" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."badges_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."book_questions" (
    "question_id" "uuid" NOT NULL,
    "book_id" "uuid" NOT NULL,
    "randomizer" double precision DEFAULT "random"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."book_questions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."books" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "title" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "author" "text",
    "cover_url" "text",
    "epub_file_url" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "Cover_super" "text",
    "Notion_URL" "text",
    "randomizer" double precision DEFAULT "random"(),
    "categories" "text"[] DEFAULT '{}'::"text"[],
    "amazon_link" "text",
    "about" "text",
    "icon_illustration" "text",
    "introduction" "text",
    "bookshop_link" "text",
    "great_question_connection" "text",
    "author_id" "uuid"
);


ALTER TABLE "public"."books" OWNER TO "postgres";


COMMENT ON COLUMN "public"."books"."Cover_super" IS 'Super.so alexandria site link for book cover to return to encyclopedia';



COMMENT ON COLUMN "public"."books"."Notion_URL" IS 'Notion Page URL for Matching to Questions Table';



COMMENT ON COLUMN "public"."books"."amazon_link" IS 'Amazon affiliate link for this text';



COMMENT ON COLUMN "public"."books"."about" IS 'Feed Description';



COMMENT ON COLUMN "public"."books"."icon_illustration" IS 'Portrait of the Author(s)';



COMMENT ON COLUMN "public"."books"."bookshop_link" IS 'Bookshop.org affiliate link';



CREATE TABLE IF NOT EXISTS "public"."concepts" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "title" "text" NOT NULL,
    "illustration" "text" NOT NULL,
    "type" "text",
    "randomizer" double precision DEFAULT "random"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "about" "text",
    "introduction" "text",
    "Notion_URL" "text"
);


ALTER TABLE "public"."concepts" OWNER TO "postgres";


COMMENT ON COLUMN "public"."concepts"."type" IS 'Field, Subfield, Branch, Sub-branch - determines page structure';



CREATE TABLE IF NOT EXISTS "public"."custom_domain_books" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "domain_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "author" "text",
    "cover_url" "text",
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."custom_domain_books" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."custom_domains" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "outseta_user_id" "text"
);


ALTER TABLE "public"."custom_domains" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."dna_tree_structure" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "question_id" "uuid" NOT NULL,
    "category" "public"."dna_category" NOT NULL,
    "next_question_a_id" "uuid",
    "next_question_b_id" "uuid",
    "tree_position" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."dna_tree_structure" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."great_questions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "category_number" "text",
    "category" "text" NOT NULL,
    "question" "text" NOT NULL,
    "notion_id" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "related_classics" "text"[] DEFAULT '{}'::"text"[],
    "illustration" "text",
    "answer_a" "text",
    "answer_b" "text",
    CONSTRAINT "check_valid_category" CHECK (("category" = ANY (ARRAY['AESTHETICS'::"text", 'EPISTEMOLOGY'::"text", 'ETHICS'::"text", 'ONTOLOGY'::"text", 'POLITICS'::"text", 'THEOLOGY'::"text"])))
);


ALTER TABLE "public"."great_questions" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."decision_tree_view" AS
 SELECT "t"."category",
    "t"."tree_position",
    "q"."question",
    "na"."question" AS "next_question_a",
    "nb"."question" AS "next_question_b"
   FROM ((("public"."dna_tree_structure" "t"
     LEFT JOIN "public"."great_questions" "q" ON (("t"."question_id" = "q"."id")))
     LEFT JOIN "public"."great_questions" "na" ON (("t"."next_question_a_id" = "na"."id")))
     LEFT JOIN "public"."great_questions" "nb" ON (("t"."next_question_b_id" = "nb"."id")))
  ORDER BY "t"."category", "t"."tree_position";


ALTER TABLE "public"."decision_tree_view" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."dna_analysis_results" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "assessment_id" "uuid" NOT NULL,
    "analysis_text" "text",
    "raw_response" "jsonb",
    "archetype" "text",
    "introduction" "text",
    "archetype_definition" "text",
    "key_tension_1" "text",
    "key_tension_2" "text",
    "key_tension_3" "text",
    "natural_strength_1" "text",
    "natural_strength_2" "text",
    "natural_strength_3" "text",
    "growth_edges_1" "text",
    "growth_edges_2" "text",
    "growth_edges_3" "text",
    "theology_introduction" "text",
    "ontology_introduction" "text",
    "epistemology_introduction" "text",
    "ethics_introduction" "text",
    "politics_introduction" "text",
    "aesthetics_introduction" "text",
    "theology_kindred_spirit_1" "text",
    "theology_kindred_spirit_2" "text",
    "theology_kindred_spirit_3" "text",
    "theology_kindred_spirit_4" "text",
    "theology_kindred_spirit_5" "text",
    "theology_kindred_spirit_1_classic" "text",
    "theology_kindred_spirit_2_classic" "text",
    "theology_kindred_spirit_3_classic" "text",
    "theology_kindred_spirit_4_classic" "text",
    "theology_kindred_spirit_5_classic" "text",
    "theology_kindred_spirit_1_rationale" "text",
    "theology_kindred_spirit_2_rationale" "text",
    "theology_kindred_spirit_3_rationale" "text",
    "theology_kindred_spirit_4_rationale" "text",
    "theology_kindred_spirit_5_rationale" "text",
    "theology_challenging_voice_1" "text",
    "theology_challenging_voice_2" "text",
    "theology_challenging_voice_3" "text",
    "theology_challenging_voice_4" "text",
    "theology_challenging_voice_5" "text",
    "theology_challenging_voice_1_classic" "text",
    "theology_challenging_voice_2_classic" "text",
    "theology_challenging_voice_3_classic" "text",
    "theology_challenging_voice_4_classic" "text",
    "theology_challenging_voice_5_classic" "text",
    "theology_challenging_voice_1_rationale" "text",
    "theology_challenging_voice_2_rationale" "text",
    "theology_challenging_voice_3_rationale" "text",
    "theology_challenging_voice_4_rationale" "text",
    "theology_challenging_voice_5_rationale" "text",
    "ontology_kindred_spirit_1" "text",
    "ontology_kindred_spirit_2" "text",
    "ontology_kindred_spirit_3" "text",
    "ontology_kindred_spirit_4" "text",
    "ontology_kindred_spirit_5" "text",
    "ontology_kindred_spirit_1_classic" "text",
    "ontology_kindred_spirit_2_classic" "text",
    "ontology_kindred_spirit_3_classic" "text",
    "ontology_kindred_spirit_4_classic" "text",
    "ontology_kindred_spirit_5_classic" "text",
    "ontology_kindred_spirit_1_rationale" "text",
    "ontology_kindred_spirit_2_rationale" "text",
    "ontology_kindred_spirit_3_rationale" "text",
    "ontology_kindred_spirit_4_rationale" "text",
    "ontology_kindred_spirit_5_rationale" "text",
    "ontology_challenging_voice_1" "text",
    "ontology_challenging_voice_2" "text",
    "ontology_challenging_voice_3" "text",
    "ontology_challenging_voice_4" "text",
    "ontology_challenging_voice_5" "text",
    "ontology_challenging_voice_1_classic" "text",
    "ontology_challenging_voice_2_classic" "text",
    "ontology_challenging_voice_3_classic" "text",
    "ontology_challenging_voice_4_classic" "text",
    "ontology_challenging_voice_5_classic" "text",
    "ontology_challenging_voice_1_rationale" "text",
    "ontology_challenging_voice_2_rationale" "text",
    "ontology_challenging_voice_3_rationale" "text",
    "ontology_challenging_voice_4_rationale" "text",
    "ontology_challenging_voice_5_rationale" "text",
    "epistemology_kindred_spirit_1" "text",
    "epistemology_kindred_spirit_2" "text",
    "epistemology_kindred_spirit_3" "text",
    "epistemology_kindred_spirit_4" "text",
    "epistemology_kindred_spirit_5" "text",
    "epistemology_kindred_spirit_1_classic" "text",
    "epistemology_kindred_spirit_2_classic" "text",
    "epistemology_kindred_spirit_3_classic" "text",
    "epistemology_kindred_spirit_4_classic" "text",
    "epistemology_kindred_spirit_5_classic" "text",
    "epistemology_kindred_spirit_1_rationale" "text",
    "epistemology_kindred_spirit_2_rationale" "text",
    "epistemology_kindred_spirit_3_rationale" "text",
    "epistemology_kindred_spirit_4_rationale" "text",
    "epistemology_kindred_spirit_5_rationale" "text",
    "epistemology_challenging_voice_1" "text",
    "epistemology_challenging_voice_2" "text",
    "epistemology_challenging_voice_3" "text",
    "epistemology_challenging_voice_4" "text",
    "epistemology_challenging_voice_5" "text",
    "epistemology_challenging_voice_1_classic" "text",
    "epistemology_challenging_voice_2_classic" "text",
    "epistemology_challenging_voice_3_classic" "text",
    "epistemology_challenging_voice_4_classic" "text",
    "epistemology_challenging_voice_5_classic" "text",
    "epistemology_challenging_voice_1_rationale" "text",
    "epistemology_challenging_voice_2_rationale" "text",
    "epistemology_challenging_voice_3_rationale" "text",
    "epistemology_challenging_voice_4_rationale" "text",
    "epistemology_challenging_voice_5_rationale" "text",
    "ethics_kindred_spirit_1" "text",
    "ethics_kindred_spirit_2" "text",
    "ethics_kindred_spirit_3" "text",
    "ethics_kindred_spirit_4" "text",
    "ethics_kindred_spirit_5" "text",
    "ethics_kindred_spirit_1_classic" "text",
    "ethics_kindred_spirit_2_classic" "text",
    "ethics_kindred_spirit_3_classic" "text",
    "ethics_kindred_spirit_4_classic" "text",
    "ethics_kindred_spirit_5_classic" "text",
    "ethics_kindred_spirit_1_rationale" "text",
    "ethics_kindred_spirit_2_rationale" "text",
    "ethics_kindred_spirit_3_rationale" "text",
    "ethics_kindred_spirit_4_rationale" "text",
    "ethics_kindred_spirit_5_rationale" "text",
    "ethics_challenging_voice_1" "text",
    "ethics_challenging_voice_2" "text",
    "ethics_challenging_voice_3" "text",
    "ethics_challenging_voice_4" "text",
    "ethics_challenging_voice_5" "text",
    "ethics_challenging_voice_1_classic" "text",
    "ethics_challenging_voice_2_classic" "text",
    "ethics_challenging_voice_3_classic" "text",
    "ethics_challenging_voice_4_classic" "text",
    "ethics_challenging_voice_5_classic" "text",
    "ethics_challenging_voice_1_rationale" "text",
    "ethics_challenging_voice_2_rationale" "text",
    "ethics_challenging_voice_3_rationale" "text",
    "ethics_challenging_voice_4_rationale" "text",
    "ethics_challenging_voice_5_rationale" "text",
    "politics_kindred_spirit_1" "text",
    "politics_kindred_spirit_2" "text",
    "politics_kindred_spirit_3" "text",
    "politics_kindred_spirit_4" "text",
    "politics_kindred_spirit_5" "text",
    "politics_kindred_spirit_1_classic" "text",
    "politics_kindred_spirit_2_classic" "text",
    "politics_kindred_spirit_3_classic" "text",
    "politics_kindred_spirit_4_classic" "text",
    "politics_kindred_spirit_5_classic" "text",
    "politics_kindred_spirit_1_rationale" "text",
    "politics_kindred_spirit_2_rationale" "text",
    "politics_kindred_spirit_3_rationale" "text",
    "politics_kindred_spirit_4_rationale" "text",
    "politics_kindred_spirit_5_rationale" "text",
    "politics_challenging_voice_1" "text",
    "politics_challenging_voice_2" "text",
    "politics_challenging_voice_3" "text",
    "politics_challenging_voice_4" "text",
    "politics_challenging_voice_5" "text",
    "politics_challenging_voice_1_classic" "text",
    "politics_challenging_voice_2_classic" "text",
    "politics_challenging_voice_3_classic" "text",
    "politics_challenging_voice_4_classic" "text",
    "politics_challenging_voice_5_classic" "text",
    "politics_challenging_voice_1_rationale" "text",
    "politics_challenging_voice_2_rationale" "text",
    "politics_challenging_voice_3_rationale" "text",
    "politics_challenging_voice_4_rationale" "text",
    "politics_challenging_voice_5_rationale" "text",
    "aesthetics_kindred_spirit_1" "text",
    "aesthetics_kindred_spirit_2" "text",
    "aesthetics_kindred_spirit_3" "text",
    "aesthetics_kindred_spirit_4" "text",
    "aesthetics_kindred_spirit_5" "text",
    "aesthetics_kindred_spirit_1_classic" "text",
    "aesthetics_kindred_spirit_2_classic" "text",
    "aesthetics_kindred_spirit_3_classic" "text",
    "aesthetics_kindred_spirit_4_classic" "text",
    "aesthetics_kindred_spirit_5_classic" "text",
    "aesthetics_kindred_spirit_1_rationale" "text",
    "aesthetics_kindred_spirit_2_rationale" "text",
    "aesthetics_kindred_spirit_3_rationale" "text",
    "aesthetics_kindred_spirit_4_rationale" "text",
    "aesthetics_kindred_spirit_5_rationale" "text",
    "aesthetics_challenging_voice_1" "text",
    "aesthetics_challenging_voice_2" "text",
    "aesthetics_challenging_voice_3" "text",
    "aesthetics_challenging_voice_4" "text",
    "aesthetics_challenging_voice_5" "text",
    "aesthetics_challenging_voice_1_classic" "text",
    "aesthetics_challenging_voice_2_classic" "text",
    "aesthetics_challenging_voice_3_classic" "text",
    "aesthetics_challenging_voice_4_classic" "text",
    "aesthetics_challenging_voice_5_classic" "text",
    "aesthetics_challenging_voice_1_rationale" "text",
    "aesthetics_challenging_voice_2_rationale" "text",
    "aesthetics_challenging_voice_3_rationale" "text",
    "aesthetics_challenging_voice_4_rationale" "text",
    "aesthetics_challenging_voice_5_rationale" "text",
    "conclusion" "text",
    "next_steps" "text",
    "analysis_type" "public"."dna_result_type" NOT NULL,
    "name" "text",
    "profile_image_url" "text",
    "become_who_you_are" "text",
    "most_kindred_spirit" "text",
    "most_challenging_voice" "text"
);


ALTER TABLE "public"."dna_analysis_results" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."dna_assessment_progress" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "category" "public"."dna_category" NOT NULL,
    "current_position" "text" NOT NULL,
    "responses" "jsonb" DEFAULT '{}'::"jsonb",
    "completed" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."dna_assessment_progress" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."dna_assessment_results" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "name" "text" NOT NULL,
    "answers" "jsonb" DEFAULT '{}'::"jsonb",
    "ethics_sequence" "text" DEFAULT ''::"text",
    "epistemology_sequence" "text" DEFAULT ''::"text",
    "politics_sequence" "text" DEFAULT ''::"text",
    "theology_sequence" "text" DEFAULT ''::"text",
    "ontology_sequence" "text" DEFAULT ''::"text",
    "aesthetics_sequence" "text" DEFAULT ''::"text",
    "profile_id" "text"
);


ALTER TABLE "public"."dna_assessment_results" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."dna_conversations" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "assessment_id" "uuid",
    "user_id" "uuid",
    "session_id" "text" NOT NULL,
    "messages" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "question_id" "text" NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb"
);


ALTER TABLE "public"."dna_conversations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."dna_question_responses" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "assessment_id" "uuid" NOT NULL,
    "category" "public"."dna_category" NOT NULL,
    "question_id" "uuid" NOT NULL,
    "answer" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "dna_question_responses_answer_check" CHECK (("answer" = ANY (ARRAY['A'::"text", 'B'::"text"])))
);


ALTER TABLE "public"."dna_question_responses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."external_links" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "url" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."external_links" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."icon_update_temp" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "icon_id" "text",
    "anecdotes" "text"[]
);


ALTER TABLE "public"."icon_update_temp" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."icons" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "illustration" "text" NOT NULL,
    "randomizer" double precision DEFAULT "random"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "about" "text",
    "introduction" "text",
    "Notion_URL" "text",
    "anecdotes" "text"[] DEFAULT '{}'::"text"[],
    "great_conversation" "text",
    "slug" "text"
);


ALTER TABLE "public"."icons" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "outseta_user_id" character varying NOT NULL,
    "email" character varying NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "full_name" character varying,
    "profile_image" "text",
    "landscape_image" "text",
    "assessment_id" "uuid"
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."prompts" (
    "id" bigint NOT NULL,
    "context" "text",
    "purpose" "text",
    "prompt" "text"
);


ALTER TABLE "public"."prompts" OWNER TO "postgres";


ALTER TABLE "public"."prompts" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."prompts_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."quotes" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "icon_id" "uuid",
    "quote" "text",
    "icon" "text"
);


ALTER TABLE "public"."quotes" OWNER TO "postgres";


ALTER TABLE "public"."quotes" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."quotes_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."reading_list_books" (
    "reading_list_id" "uuid" NOT NULL,
    "book_id" "uuid" NOT NULL,
    "added_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."reading_list_books" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reading_lists" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."reading_lists" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reading_progress" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "book_id" "uuid" NOT NULL,
    "position" double precision NOT NULL,
    "device_id" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);

ALTER TABLE ONLY "public"."reading_progress" REPLICA IDENTITY FULL;


ALTER TABLE "public"."reading_progress" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."share_messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "type" "public"."share_message_type" NOT NULL,
    "message" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."share_messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."test_auth" (
    "id" bigint NOT NULL,
    "content" "text",
    "person_uid" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."test_auth" OWNER TO "postgres";


ALTER TABLE "public"."test_auth" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."test_auth_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."user_books" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "book_id" "uuid" NOT NULL,
    "outseta_user_id" character varying NOT NULL,
    "status" "text" DEFAULT 'reading'::"text",
    "current_page" integer DEFAULT 0,
    "current_cfi" "text",
    "last_read_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    CONSTRAINT "user_books_status_check" CHECK (("status" = ANY (ARRAY['reading'::"text", 'completed'::"text", 'on_hold'::"text", 'dropped'::"text"])))
);


ALTER TABLE "public"."user_books" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_favorites" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "outseta_user_id" character varying NOT NULL,
    "item_id" "uuid" NOT NULL,
    "item_type" "text" NOT NULL,
    "added_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_favorites" OWNER TO "postgres";


ALTER TABLE ONLY "public"."art"
    ADD CONSTRAINT "art_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."art"
    ADD CONSTRAINT "art_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."user_badges"
    ADD CONSTRAINT "badges_id_key" UNIQUE ("id");



ALTER TABLE ONLY "public"."user_badges"
    ADD CONSTRAINT "badges_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."book_questions"
    ADD CONSTRAINT "book_questions_pkey" PRIMARY KEY ("question_id", "book_id");



ALTER TABLE ONLY "public"."books"
    ADD CONSTRAINT "books_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."books"
    ADD CONSTRAINT "books_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."concepts"
    ADD CONSTRAINT "concepts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."custom_domain_books"
    ADD CONSTRAINT "custom_domain_books_domain_id_title_author_key" UNIQUE ("domain_id", "title", "author");



ALTER TABLE ONLY "public"."custom_domain_books"
    ADD CONSTRAINT "custom_domain_books_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."custom_domains"
    ADD CONSTRAINT "custom_domains_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."dna_analysis_results"
    ADD CONSTRAINT "dna_analysis_results_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."dna_assessment_progress"
    ADD CONSTRAINT "dna_assessment_progress_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."dna_assessment_progress"
    ADD CONSTRAINT "dna_assessment_progress_user_id_category_key" UNIQUE ("user_id", "category");



ALTER TABLE ONLY "public"."dna_assessment_results"
    ADD CONSTRAINT "dna_assessment_results_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."dna_conversations"
    ADD CONSTRAINT "dna_conversations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."dna_question_responses"
    ADD CONSTRAINT "dna_question_responses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."dna_tree_structure"
    ADD CONSTRAINT "dna_tree_structure_category_position_key" UNIQUE ("category", "tree_position");



ALTER TABLE ONLY "public"."dna_tree_structure"
    ADD CONSTRAINT "dna_tree_structure_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."dna_tree_structure"
    ADD CONSTRAINT "dna_tree_structure_question_id_category_key" UNIQUE ("question_id", "category");



ALTER TABLE ONLY "public"."external_links"
    ADD CONSTRAINT "external_links_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."great_questions"
    ADD CONSTRAINT "great_questions_notion_id_key" UNIQUE ("notion_id");



ALTER TABLE ONLY "public"."great_questions"
    ADD CONSTRAINT "great_questions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."icon_update_temp"
    ADD CONSTRAINT "icon_update_temp_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."icons"
    ADD CONSTRAINT "icons_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_outseta_user_id_key" UNIQUE ("outseta_user_id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."prompts"
    ADD CONSTRAINT "prompts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."quotes"
    ADD CONSTRAINT "quotes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reading_list_books"
    ADD CONSTRAINT "reading_list_books_pkey" PRIMARY KEY ("reading_list_id", "book_id");



ALTER TABLE ONLY "public"."reading_lists"
    ADD CONSTRAINT "reading_lists_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reading_progress"
    ADD CONSTRAINT "reading_progress_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."share_messages"
    ADD CONSTRAINT "share_messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."test_auth"
    ADD CONSTRAINT "test_auth_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_books"
    ADD CONSTRAINT "unique_book_user" UNIQUE ("book_id", "outseta_user_id");



ALTER TABLE ONLY "public"."user_books"
    ADD CONSTRAINT "user_books_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_favorites"
    ADD CONSTRAINT "user_favorites_outseta_user_id_item_id_item_type_key" UNIQUE ("outseta_user_id", "item_id", "item_type");



ALTER TABLE ONLY "public"."user_favorites"
    ADD CONSTRAINT "user_favorites_pkey" PRIMARY KEY ("id");



CREATE INDEX "custom_domain_books_domain_id_idx" ON "public"."custom_domain_books" USING "btree" ("domain_id");



CREATE INDEX "custom_domain_books_user_id_idx" ON "public"."custom_domain_books" USING "btree" ("user_id");



CREATE INDEX "custom_domains_user_id_idx" ON "public"."custom_domains" USING "btree" ("user_id");



CREATE INDEX "dna_question_responses_assessment_id_idx" ON "public"."dna_question_responses" USING "btree" ("assessment_id");



CREATE INDEX "idx_books_author_id" ON "public"."books" USING "btree" ("author_id");



CREATE INDEX "idx_books_categories" ON "public"."books" USING "gin" ("categories");



CREATE INDEX "idx_dna_assessment_results_sequences" ON "public"."dna_assessment_results" USING "btree" ("ethics_sequence", "epistemology_sequence", "politics_sequence", "theology_sequence", "ontology_sequence", "aesthetics_sequence");



CREATE INDEX "idx_dna_tree_category" ON "public"."dna_tree_structure" USING "btree" ("category");



CREATE INDEX "idx_dna_tree_position" ON "public"."dna_tree_structure" USING "btree" ("tree_position");



CREATE INDEX "idx_great_questions_category" ON "public"."great_questions" USING "btree" ("category");



CREATE INDEX "idx_tree_position" ON "public"."dna_tree_structure" USING "btree" ("category", "tree_position");



CREATE INDEX "idx_user_books_outseta_user_id" ON "public"."user_books" USING "btree" ("outseta_user_id");



CREATE INDEX "idx_user_books_user_id" ON "public"."user_books" USING "btree" ("outseta_user_id");



CREATE INDEX "idx_user_favorites_item_id" ON "public"."user_favorites" USING "btree" ("item_id");



CREATE INDEX "idx_user_favorites_user_id" ON "public"."user_favorites" USING "btree" ("outseta_user_id");



CREATE OR REPLACE TRIGGER "ensure_profile_before_user_books" BEFORE INSERT ON "public"."user_books" FOR EACH ROW EXECUTE FUNCTION "public"."ensure_profile_exists"();



CREATE OR REPLACE TRIGGER "on_reading_progress_created" AFTER INSERT ON "public"."reading_progress" FOR EACH ROW EXECUTE FUNCTION "public"."add_book_to_user_library"();



CREATE OR REPLACE TRIGGER "populate_book_questions_from_books" AFTER INSERT OR UPDATE ON "public"."books" FOR EACH ROW EXECUTE FUNCTION "public"."populate_book_questions"();



CREATE OR REPLACE TRIGGER "populate_book_questions_from_questions" AFTER INSERT OR UPDATE ON "public"."great_questions" FOR EACH ROW EXECUTE FUNCTION "public"."populate_book_questions"();



CREATE OR REPLACE TRIGGER "update_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_reading_lists_updated_at" BEFORE UPDATE ON "public"."reading_lists" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_reading_progress_updated_at" BEFORE UPDATE ON "public"."reading_progress" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_share_messages_updated_at" BEFORE UPDATE ON "public"."share_messages" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."user_badges"
    ADD CONSTRAINT "badges_entry_icon_fkey" FOREIGN KEY ("entry_icon") REFERENCES "public"."icons"("id");



ALTER TABLE ONLY "public"."user_badges"
    ADD CONSTRAINT "badges_entry_text_fkey" FOREIGN KEY ("entry_text") REFERENCES "public"."books"("id");



ALTER TABLE ONLY "public"."book_questions"
    ADD CONSTRAINT "book_questions_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."book_questions"
    ADD CONSTRAINT "book_questions_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."great_questions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."books"
    ADD CONSTRAINT "books_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."icons"("id");



ALTER TABLE ONLY "public"."custom_domain_books"
    ADD CONSTRAINT "custom_domain_books_domain_id_fkey" FOREIGN KEY ("domain_id") REFERENCES "public"."custom_domains"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."custom_domain_books"
    ADD CONSTRAINT "custom_domain_books_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."custom_domains"
    ADD CONSTRAINT "custom_domains_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."dna_analysis_results"
    ADD CONSTRAINT "dna_analysis_results_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "public"."dna_assessment_results"("id");



ALTER TABLE ONLY "public"."dna_conversations"
    ADD CONSTRAINT "dna_conversations_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "public"."dna_assessment_results"("id");



ALTER TABLE ONLY "public"."dna_conversations"
    ADD CONSTRAINT "dna_conversations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."dna_question_responses"
    ADD CONSTRAINT "dna_question_responses_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "public"."dna_assessment_results"("id");



ALTER TABLE ONLY "public"."dna_question_responses"
    ADD CONSTRAINT "dna_question_responses_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."dna_tree_structure"("id");



ALTER TABLE ONLY "public"."dna_tree_structure"
    ADD CONSTRAINT "dna_tree_structure_next_question_a_id_fkey" FOREIGN KEY ("next_question_a_id") REFERENCES "public"."dna_tree_structure"("id");



ALTER TABLE ONLY "public"."dna_tree_structure"
    ADD CONSTRAINT "dna_tree_structure_next_question_b_id_fkey" FOREIGN KEY ("next_question_b_id") REFERENCES "public"."dna_tree_structure"("id");



ALTER TABLE ONLY "public"."dna_tree_structure"
    ADD CONSTRAINT "dna_tree_structure_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."great_questions"("id");



ALTER TABLE ONLY "public"."custom_domains"
    ADD CONSTRAINT "fk_custom_domains_profile" FOREIGN KEY ("outseta_user_id") REFERENCES "public"."profiles"("outseta_user_id");



ALTER TABLE ONLY "public"."dna_tree_structure"
    ADD CONSTRAINT "fk_next_question_a" FOREIGN KEY ("next_question_a_id") REFERENCES "public"."dna_tree_structure"("id");



ALTER TABLE ONLY "public"."dna_tree_structure"
    ADD CONSTRAINT "fk_next_question_b" FOREIGN KEY ("next_question_b_id") REFERENCES "public"."dna_tree_structure"("id");



ALTER TABLE ONLY "public"."dna_tree_structure"
    ADD CONSTRAINT "fk_question" FOREIGN KEY ("question_id") REFERENCES "public"."great_questions"("id");



ALTER TABLE ONLY "public"."user_books"
    ADD CONSTRAINT "fk_user_books_book" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_books"
    ADD CONSTRAINT "fk_user_books_book_id" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id");



ALTER TABLE ONLY "public"."quotes"
    ADD CONSTRAINT "quotes_icon_id_fkey" FOREIGN KEY ("icon_id") REFERENCES "public"."icons"("id");



ALTER TABLE ONLY "public"."reading_list_books"
    ADD CONSTRAINT "reading_list_books_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reading_list_books"
    ADD CONSTRAINT "reading_list_books_reading_list_id_fkey" FOREIGN KEY ("reading_list_id") REFERENCES "public"."reading_lists"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reading_progress"
    ADD CONSTRAINT "reading_progress_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_badges"
    ADD CONSTRAINT "user_badges_entry_concepts_fkey" FOREIGN KEY ("entry_concepts") REFERENCES "public"."concepts"("id");



ALTER TABLE ONLY "public"."user_books"
    ADD CONSTRAINT "user_books_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id");



ALTER TABLE ONLY "public"."user_books"
    ADD CONSTRAINT "user_books_outseta_user_id_fkey" FOREIGN KEY ("outseta_user_id") REFERENCES "public"."profiles"("outseta_user_id");



CREATE POLICY "Allow anonymous read access to dna_tree_structure" ON "public"."dna_tree_structure" FOR SELECT TO "anon" USING (true);



CREATE POLICY "Allow anonymous read access to great_questions" ON "public"."great_questions" FOR SELECT TO "anon" USING (true);



CREATE POLICY "Allow public read access to books" ON "public"."books" FOR SELECT USING (true);



CREATE POLICY "Allow public read access to share_messages" ON "public"."share_messages" FOR SELECT USING (true);



CREATE POLICY "Anyone can add books" ON "public"."books" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Anyone can create analysis results" ON "public"."dna_analysis_results" FOR INSERT TO "anon" WITH CHECK (true);



CREATE POLICY "Anyone can create assessment results" ON "public"."dna_assessment_results" FOR INSERT TO "anon" WITH CHECK (true);



CREATE POLICY "Anyone can delete books" ON "public"."books" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Anyone can insert results" ON "public"."dna_assessment_results" FOR INSERT TO "authenticated", "anon" WITH CHECK (true);



CREATE POLICY "Anyone can read analysis results" ON "public"."dna_analysis_results" FOR SELECT TO "anon" USING (true);



CREATE POLICY "Anyone can read assessment results" ON "public"."dna_assessment_results" FOR SELECT TO "anon" USING (true);



CREATE POLICY "Anyone can read books" ON "public"."books" FOR SELECT USING (true);



CREATE POLICY "Anyone can read results" ON "public"."dna_assessment_results" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Anyone can update books" ON "public"."books" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Anyone can update their assessment results" ON "public"."dna_assessment_results" FOR UPDATE TO "anon" USING (true) WITH CHECK (true);



CREATE POLICY "Anyone can view book questions" ON "public"."book_questions" FOR SELECT USING (true);



CREATE POLICY "Anyone can view books" ON "public"."books" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Anyone can view external links" ON "public"."external_links" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Anyone can view questions" ON "public"."great_questions" FOR SELECT USING (true);



CREATE POLICY "DNA tree structure is readable by authenticated users" ON "public"."dna_tree_structure" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Enable delete for authenticated users" ON "public"."reading_list_books" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Enable delete for authenticated users" ON "public"."reading_lists" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Enable delete for authenticated users" ON "public"."reading_progress" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Enable insert access for authenticated users" ON "public"."dna_assessment_progress" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Enable insert for all users" ON "public"."dna_assessment_results" FOR INSERT WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users" ON "public"."reading_list_books" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users" ON "public"."reading_lists" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users" ON "public"."reading_progress" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable read access for all users" ON "public"."books" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."reading_list_books" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."reading_lists" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."reading_progress" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Enable read access for authenticated users" ON "public"."dna_assessment_progress" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Enable select for all users" ON "public"."dna_assessment_results" FOR SELECT USING (true);



CREATE POLICY "Enable update access for authenticated users" ON "public"."dna_assessment_progress" FOR UPDATE TO "authenticated" USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Enable update for authenticated users" ON "public"."reading_lists" FOR UPDATE TO "authenticated" USING (true);



CREATE POLICY "Enable update for authenticated users" ON "public"."reading_progress" FOR UPDATE TO "authenticated" USING (true);



CREATE POLICY "Enable user_books access" ON "public"."user_books" TO "authenticated" USING ((("outseta_user_id")::"text" = "current_setting"('request.jwt.claims.sub'::"text")));



CREATE POLICY "No deletions allowed" ON "public"."dna_assessment_results" FOR DELETE TO "authenticated", "anon" USING (false);



CREATE POLICY "No updates allowed" ON "public"."dna_assessment_results" FOR UPDATE TO "authenticated", "anon" USING (false);



CREATE POLICY "Profiles are viewable by authenticated users only" ON "public"."profiles" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Users can access their own rows" ON "public"."test_auth" USING (("person_uid" = ("auth"."jwt"() ->> 'sub'::"text")));



CREATE POLICY "Users can add books to their library" ON "public"."user_books" FOR INSERT TO "authenticated" WITH CHECK ((("outseta_user_id")::"text" = ("auth"."jwt"() ->> 'sub'::"text")));



CREATE POLICY "Users can add books to their shelf" ON "public"."user_books" FOR INSERT TO "authenticated" WITH CHECK ((("outseta_user_id")::"text" = ("auth"."jwt"() ->> 'outseta:accountUid'::"text")));



CREATE POLICY "Users can add their own books" ON "public"."user_books" FOR INSERT TO "authenticated" WITH CHECK ((("outseta_user_id")::"text" = ((("auth"."jwt"() ->> 'outseta:accountUid'::"text"))::character varying)::"text"));



CREATE POLICY "Users can add their own favorites" ON "public"."user_favorites" FOR INSERT WITH CHECK (((("outseta_user_id")::"text" = (("current_setting"('request.jwt.claims'::"text", true))::"json" ->> 'sub'::"text")) OR (("outseta_user_id")::"text" = "current_setting"('request.jwt.claims.outseta_user_id'::"text", true))));



CREATE POLICY "Users can create books in their domains" ON "public"."custom_domain_books" FOR INSERT WITH CHECK ((("auth"."uid"() = "user_id") AND (EXISTS ( SELECT 1
   FROM "public"."custom_domains"
  WHERE (("custom_domains"."id" = "custom_domain_books"."domain_id") AND ("custom_domains"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Users can create their own domains" ON "public"."custom_domains" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create their own profile" ON "public"."profiles" FOR INSERT WITH CHECK ((("auth"."jwt"() ->> 'sub'::"text") = ("outseta_user_id")::"text"));



CREATE POLICY "Users can delete books in their domains" ON "public"."custom_domain_books" FOR DELETE USING ((("auth"."uid"() = "user_id") AND (EXISTS ( SELECT 1
   FROM "public"."custom_domains"
  WHERE (("custom_domains"."id" = "custom_domain_books"."domain_id") AND ("custom_domains"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Users can delete their own domains" ON "public"."custom_domains" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own favorites" ON "public"."user_favorites" FOR DELETE USING (((("outseta_user_id")::"text" = (("current_setting"('request.jwt.claims'::"text", true))::"json" ->> 'sub'::"text")) OR (("outseta_user_id")::"text" = "current_setting"('request.jwt.claims.outseta_user_id'::"text", true))));



CREATE POLICY "Users can manage their own books" ON "public"."user_books" USING ((("outseta_user_id")::"text" = ("auth"."jwt"() ->> 'outseta:accountUid'::"text"))) WITH CHECK ((("outseta_user_id")::"text" = ("auth"."jwt"() ->> 'outseta:accountUid'::"text")));



CREATE POLICY "Users can read their own books" ON "public"."user_books" FOR SELECT USING (true);



CREATE POLICY "Users can read their own profile" ON "public"."profiles" FOR SELECT TO "authenticated" USING ((("auth"."jwt"() ->> 'sub'::"text") = ("outseta_user_id")::"text"));



CREATE POLICY "Users can remove books from their shelf" ON "public"."user_books" FOR DELETE TO "authenticated" USING ((("outseta_user_id")::"text" = ("auth"."jwt"() ->> 'outseta:accountUid'::"text")));



CREATE POLICY "Users can update books in their domains" ON "public"."custom_domain_books" FOR UPDATE USING ((("auth"."uid"() = "user_id") AND (EXISTS ( SELECT 1
   FROM "public"."custom_domains"
  WHERE (("custom_domains"."id" = "custom_domain_books"."domain_id") AND ("custom_domains"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Users can update their book progress" ON "public"."user_books" FOR UPDATE TO "authenticated" USING ((("outseta_user_id")::"text" = ("auth"."jwt"() ->> 'outseta:accountUid'::"text")));



CREATE POLICY "Users can update their own domains" ON "public"."custom_domains" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own profile" ON "public"."profiles" FOR UPDATE USING ((("auth"."jwt"() ->> 'sub'::"text") = ("outseta_user_id")::"text")) WITH CHECK ((("auth"."jwt"() ->> 'sub'::"text") = ("outseta_user_id")::"text"));



CREATE POLICY "Users can view books in their domains" ON "public"."custom_domain_books" FOR SELECT USING ((("auth"."uid"() = "user_id") OR (EXISTS ( SELECT 1
   FROM "public"."custom_domains"
  WHERE (("custom_domains"."id" = "custom_domain_books"."domain_id") AND ("custom_domains"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Users can view books in their library" ON "public"."books" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."user_books"
  WHERE (("user_books"."book_id" = "books"."id") AND (("user_books"."outseta_user_id")::"text" = NULLIF("current_setting"('request.jwt.claims.outseta:accountUid'::"text", true), ''::"text"))))));



CREATE POLICY "Users can view their own books" ON "public"."user_books" FOR SELECT TO "authenticated" USING ((("outseta_user_id")::"text" = NULLIF("current_setting"('request.jwt.claims.outseta:accountUid'::"text", true), ''::"text")));



CREATE POLICY "Users can view their own domains" ON "public"."custom_domains" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own favorites" ON "public"."user_favorites" FOR SELECT USING (((("outseta_user_id")::"text" = (("current_setting"('request.jwt.claims'::"text", true))::"json" ->> 'sub'::"text")) OR (("outseta_user_id")::"text" = "current_setting"('request.jwt.claims.outseta_user_id'::"text", true))));



CREATE POLICY "Users can view their own profile" ON "public"."profiles" FOR SELECT USING ((("auth"."jwt"() ->> 'sub'::"text") = ("outseta_user_id")::"text"));



CREATE POLICY "Users can view their own progress" ON "public"."dna_assessment_progress" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."art" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."book_questions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."books" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."custom_domain_books" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."custom_domains" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."dna_analysis_results" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."dna_assessment_progress" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."dna_assessment_results" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."dna_tree_structure" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."external_links" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."great_questions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."icon_update_temp" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."prompts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."quotes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reading_list_books" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reading_lists" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reading_progress" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."share_messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."test_auth" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_badges" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_books" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_favorites" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."dna_analysis_results";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."reading_progress";






GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";
GRANT USAGE ON SCHEMA "public" TO "anon";












































































































































































































GRANT ALL ON FUNCTION "public"."add_book_to_user_library"() TO "anon";
GRANT ALL ON FUNCTION "public"."add_book_to_user_library"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."add_book_to_user_library"() TO "service_role";



GRANT ALL ON FUNCTION "public"."debug_auth_state"() TO "anon";
GRANT ALL ON FUNCTION "public"."debug_auth_state"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."debug_auth_state"() TO "service_role";



GRANT ALL ON FUNCTION "public"."debug_jwt"() TO "anon";
GRANT ALL ON FUNCTION "public"."debug_jwt"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."debug_jwt"() TO "service_role";



GRANT ALL ON FUNCTION "public"."ensure_profile_exists"() TO "anon";
GRANT ALL ON FUNCTION "public"."ensure_profile_exists"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."ensure_profile_exists"() TO "service_role";



GRANT ALL ON FUNCTION "public"."populate_book_questions"() TO "anon";
GRANT ALL ON FUNCTION "public"."populate_book_questions"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."populate_book_questions"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";
























GRANT ALL ON TABLE "public"."art" TO "anon";
GRANT ALL ON TABLE "public"."art" TO "authenticated";
GRANT ALL ON TABLE "public"."art" TO "service_role";



GRANT ALL ON TABLE "public"."user_badges" TO "anon";
GRANT ALL ON TABLE "public"."user_badges" TO "authenticated";
GRANT ALL ON TABLE "public"."user_badges" TO "service_role";



GRANT ALL ON SEQUENCE "public"."badges_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."badges_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."badges_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."book_questions" TO "anon";
GRANT ALL ON TABLE "public"."book_questions" TO "authenticated";
GRANT ALL ON TABLE "public"."book_questions" TO "service_role";



GRANT ALL ON TABLE "public"."books" TO "service_role";
GRANT SELECT ON TABLE "public"."books" TO "anon";
GRANT SELECT ON TABLE "public"."books" TO "authenticated";



GRANT ALL ON TABLE "public"."concepts" TO "anon";
GRANT ALL ON TABLE "public"."concepts" TO "authenticated";
GRANT ALL ON TABLE "public"."concepts" TO "service_role";



GRANT ALL ON TABLE "public"."custom_domain_books" TO "anon";
GRANT ALL ON TABLE "public"."custom_domain_books" TO "authenticated";
GRANT ALL ON TABLE "public"."custom_domain_books" TO "service_role";



GRANT ALL ON TABLE "public"."custom_domains" TO "anon";
GRANT ALL ON TABLE "public"."custom_domains" TO "authenticated";
GRANT ALL ON TABLE "public"."custom_domains" TO "service_role";



GRANT ALL ON TABLE "public"."dna_tree_structure" TO "anon";
GRANT ALL ON TABLE "public"."dna_tree_structure" TO "authenticated";
GRANT ALL ON TABLE "public"."dna_tree_structure" TO "service_role";



GRANT ALL ON TABLE "public"."great_questions" TO "anon";
GRANT ALL ON TABLE "public"."great_questions" TO "authenticated";
GRANT ALL ON TABLE "public"."great_questions" TO "service_role";



GRANT ALL ON TABLE "public"."decision_tree_view" TO "anon";
GRANT ALL ON TABLE "public"."decision_tree_view" TO "authenticated";
GRANT ALL ON TABLE "public"."decision_tree_view" TO "service_role";



GRANT ALL ON TABLE "public"."dna_analysis_results" TO "anon";
GRANT ALL ON TABLE "public"."dna_analysis_results" TO "authenticated";
GRANT ALL ON TABLE "public"."dna_analysis_results" TO "service_role";



GRANT ALL ON TABLE "public"."dna_assessment_progress" TO "anon";
GRANT ALL ON TABLE "public"."dna_assessment_progress" TO "authenticated";
GRANT ALL ON TABLE "public"."dna_assessment_progress" TO "service_role";



GRANT ALL ON TABLE "public"."dna_assessment_results" TO "anon";
GRANT ALL ON TABLE "public"."dna_assessment_results" TO "authenticated";
GRANT ALL ON TABLE "public"."dna_assessment_results" TO "service_role";



GRANT ALL ON TABLE "public"."dna_conversations" TO "anon";
GRANT ALL ON TABLE "public"."dna_conversations" TO "authenticated";
GRANT ALL ON TABLE "public"."dna_conversations" TO "service_role";



GRANT ALL ON TABLE "public"."dna_question_responses" TO "anon";
GRANT ALL ON TABLE "public"."dna_question_responses" TO "authenticated";
GRANT ALL ON TABLE "public"."dna_question_responses" TO "service_role";



GRANT ALL ON TABLE "public"."external_links" TO "anon";
GRANT ALL ON TABLE "public"."external_links" TO "authenticated";
GRANT ALL ON TABLE "public"."external_links" TO "service_role";



GRANT ALL ON TABLE "public"."icon_update_temp" TO "anon";
GRANT ALL ON TABLE "public"."icon_update_temp" TO "authenticated";
GRANT ALL ON TABLE "public"."icon_update_temp" TO "service_role";



GRANT ALL ON TABLE "public"."icons" TO "anon";
GRANT ALL ON TABLE "public"."icons" TO "authenticated";
GRANT ALL ON TABLE "public"."icons" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."prompts" TO "anon";
GRANT ALL ON TABLE "public"."prompts" TO "authenticated";
GRANT ALL ON TABLE "public"."prompts" TO "service_role";



GRANT ALL ON SEQUENCE "public"."prompts_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."prompts_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."prompts_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."quotes" TO "anon";
GRANT ALL ON TABLE "public"."quotes" TO "authenticated";
GRANT ALL ON TABLE "public"."quotes" TO "service_role";



GRANT ALL ON SEQUENCE "public"."quotes_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."quotes_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."quotes_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."reading_list_books" TO "anon";
GRANT ALL ON TABLE "public"."reading_list_books" TO "authenticated";
GRANT ALL ON TABLE "public"."reading_list_books" TO "service_role";



GRANT ALL ON TABLE "public"."reading_lists" TO "anon";
GRANT ALL ON TABLE "public"."reading_lists" TO "authenticated";
GRANT ALL ON TABLE "public"."reading_lists" TO "service_role";



GRANT ALL ON TABLE "public"."reading_progress" TO "anon";
GRANT ALL ON TABLE "public"."reading_progress" TO "authenticated";
GRANT ALL ON TABLE "public"."reading_progress" TO "service_role";



GRANT ALL ON TABLE "public"."share_messages" TO "anon";
GRANT ALL ON TABLE "public"."share_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."share_messages" TO "service_role";



GRANT ALL ON TABLE "public"."test_auth" TO "anon";
GRANT ALL ON TABLE "public"."test_auth" TO "authenticated";
GRANT ALL ON TABLE "public"."test_auth" TO "service_role";



GRANT ALL ON SEQUENCE "public"."test_auth_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."test_auth_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."test_auth_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."user_books" TO "anon";
GRANT ALL ON TABLE "public"."user_books" TO "authenticated";
GRANT ALL ON TABLE "public"."user_books" TO "service_role";



GRANT ALL ON TABLE "public"."user_favorites" TO "anon";
GRANT ALL ON TABLE "public"."user_favorites" TO "authenticated";
GRANT ALL ON TABLE "public"."user_favorites" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
