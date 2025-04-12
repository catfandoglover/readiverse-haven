import { useEffect, useState, useCallback } from "react";
import { supabase as typedSupabase } from "@/integrations/supabase/client"; // Keep typed import if needed elsewhere
import { SupabaseClient } from '@supabase/supabase-js'; // Import base type
import { toast } from "sonner";

// Use any for the client within this hook to bypass complex types
const supabase = typedSupabase as SupabaseClient<any>;

// Expanded Course interface to include details fetched from source tables
export interface Course {
  id: string; // The ID of the virgil_course_conversations row
  course_id: string; // The ID of the underlying entry (book, icon, concept, art)
  progress: number; // Mapped from progress_percentage
  completed: boolean; // Derived from progress_percentage
  title: string; 
  description: string;
  image: string;
  entry_type: 'book' | 'art' | 'icon' | 'concept' | 'unknown'; // Added entry type
}

// Define a type for the detailed course information fetched from source tables
interface CourseDetails {
    title: string;
    description: string;
    image: string;
    type: 'book' | 'art' | 'icon' | 'concept';
}

export const useCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        throw new Error('User not authenticated.');
      }
      const userId = sessionData.session.user.id;
      
      // 1. Fetch course conversations
      const { data: courseConversations, error: courseConvoError } = await supabase
        .from('virgil_course_conversations')
        .select('id, course_id, progress_percentage') 
        .eq('user_id', userId);
        
      if (courseConvoError) throw courseConvoError;
      if (!courseConversations || courseConversations.length === 0) {
        setCourses([]); // No conversations found
        setLoading(false);
        return;
      }

      // 2. Extract unique course_ids
      const courseIds = [...new Set((courseConversations || []).map((convo: any) => convo.course_id))];

      // 3. Fetch details from source tables
      const courseDetailsMap = new Map<string, CourseDetails>();

      // Fetch Books
      const { data: booksData, error: booksError } = await supabase
        .from('books')
        .select('id, title, about, cover_url')
        .in('id', courseIds);
      if (booksError) console.error("Error fetching books:", booksError);
      else booksData?.forEach((item: any) => courseDetailsMap.set(item.id, { title: item.title, description: item.about || '', image: item.cover_url || '/path/to/default/book_cover.png', type: 'book' }));

      // Fetch Art (if exists and needed)
      const { data: artData, error: artError } = await supabase
          .from('art')
          .select('id, title, about, art_file_url')
          .in('id', courseIds);
      if (artError) console.error("Error fetching art:", artError);
      else artData?.forEach((item: any) => {
          if (!courseDetailsMap.has(item.id)) { // Avoid overwriting if ID exists in multiple tables
              courseDetailsMap.set(item.id, { title: item.title, description: item.about || '', image: item.art_file_url || '/path/to/default/art_icon.png', type: 'art' });
          }
      });

      // Fetch Icons
      const { data: iconsData, error: iconsError } = await supabase
        .from('icons')
        .select('id, name, about, illustration')
        .in('id', courseIds);
      if (iconsError) console.error("Error fetching icons:", iconsError);
      else iconsData?.forEach((item: any) => {
        if (!courseDetailsMap.has(item.id)) {
            courseDetailsMap.set(item.id, { title: item.name, description: item.about || '', image: item.illustration || '/path/to/default/icon.png', type: 'icon' });
        }
      });

      // Fetch Concepts
      const { data: conceptsData, error: conceptsError } = await supabase
        .from('concepts')
        .select('id, title, about, illustration')
        .in('id', courseIds);
      if (conceptsError) console.error("Error fetching concepts:", conceptsError);
      else conceptsData?.forEach((item: any) => {
        if (!courseDetailsMap.has(item.id)) {
            courseDetailsMap.set(item.id, { title: item.title, description: item.about || '', image: item.illustration || '/path/to/default/concept_icon.png', type: 'concept' });
        }
      });

      // 4. Map conversations to Course objects, merging details
      const coursesList: Course[] = (courseConversations || []).map((convo: any) => {
        const details = courseDetailsMap.get(convo.course_id);
        const entryType = (details?.type ?? 'unknown') as Course['entry_type']; // Explicit cast
        return {
          id: convo.id, // Conversation ID
          course_id: convo.course_id,
          progress: convo.progress_percentage ?? 0,
          completed: (convo.progress_percentage ?? 0) >= 100,
          // Provide defaults if details are missing
          title: details?.title ?? 'Unknown Course',
          description: details?.description ?? '',
          image: details?.image ?? '/default-placeholder.png', // Use a real placeholder path
          entry_type: entryType, // Use the casted type
        };
      }).filter(course => course.entry_type !== 'unknown'); // Filter out courses where details couldn't be found

      setCourses(coursesList);
    } catch (error: any) {
      console.error("Error fetching courses:", error);
      toast.error(`Failed to load courses: ${error.message}`);
      setCourses([]); // Clear courses on error
    } finally {
      setLoading(false);
    }
  }, []); // Use useCallback

  const updateCourseProgress = useCallback(async (courseInstanceId: string, progress: number) => {
    try {
      const progressPercentage = Math.max(0, Math.min(100, Math.round(progress)));
      
      // Update using the <any> client
      const { error } = await supabase
        .from('virgil_course_conversations') 
        .update({ 
          progress_percentage: progressPercentage,
          updated_at: new Date().toISOString()
        })
        .eq('id', courseInstanceId);
        
      if (error) throw error;
      
      // Update local state optimistically or re-fetch
      setCourses(prevCourses => 
        prevCourses.map(course => 
          course.id === courseInstanceId 
            ? { ...course, progress: progressPercentage, completed: progressPercentage >= 100 } 
            : course
        )
      );
      
      return { success: true };
    } catch (error: any) {
      console.error("Error updating course progress:", error);
      toast.error(`Failed to update course progress: ${error.message}`);
      return { success: false, error };
    }
  }, []); // Use useCallback

  // Create a new course conversation entry
  const createCourse = useCallback(async (entryId: string /* Now represents course_id */) => {
    // entryType is no longer stored here
    try {
      console.log("Creating course conversation for entryId (course_id):", entryId);
      
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
          console.error("User not authenticated for createCourse");
          throw new Error("User not authenticated");
      }
      const userId = sessionData.session.user.id;
      console.log("User session:", userId);
      
      // We don't need profile_id for virgil_course_conversations
      
      // Insert using the <any> client
      const { data, error } = await supabase
        .from('virgil_course_conversations') 
        .insert({
          user_id: userId,
          course_id: entryId,
          progress_percentage: 0,
          messages: [], 
        })
        .select('id, course_id, progress_percentage')
        .single();
        
      if (error) {
        console.error("Insert error:", error);
        if (error.code === '23505') { 
           toast.info("You have already started this course.");
           // Optionally fetch existing course data here?
           return { success: false, error, duplicate: true };
        }
        throw error;
      }
      
      console.log("Course conversation created:", data);
      
      // Add the new course to local state
      if (data) {
          const newCourse: Course = {
              id: data.id,
              course_id: data.course_id,
              progress: data.progress_percentage ?? 0,
              completed: (data.progress_percentage ?? 0) >= 100,
              title: '',
              description: '',
              image: '',
              entry_type: 'unknown',
          };
          setCourses(prev => [...prev, newCourse]);
      }
      // Optionally re-fetch all courses instead of just adding locally:
      // await fetchCourses(); 
      
      return { success: true, data };
    } catch (error: any) {
      console.error("Error creating course:", error);
      toast.error(`Failed to create course: ${error.message || "Unknown error"}`);
      return { success: false, error };
    }
  }, [fetchCourses]); // Add fetchCourses if using re-fetch

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]); // Add fetchCourses dependency

  return {
    courses,
    loading,
    fetchCourses, // Expose fetch function
    updateCourseProgress,
    createCourse
  };
};
