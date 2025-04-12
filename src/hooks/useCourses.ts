import { useEffect, useState, useCallback } from "react";
import { supabase as typedSupabase } from "@/integrations/supabase/client"; // Keep typed import if needed elsewhere
import { SupabaseClient } from '@supabase/supabase-js'; // Import base type
import { toast } from "sonner";

// Use any for the client within this hook to bypass complex types
const supabase = typedSupabase as SupabaseClient<any>;

// Simplified Course interface based on data directly available 
// from virgil_course_conversations or derivable from it.
// Title, description, image, entry_type need to be fetched separately.
export interface Course {
  id: string; // The ID of the virgil_course_conversations row
  course_id: string; // The ID of the underlying entry (book, icon, concept)
  progress: number; // Mapped from progress_percentage
  completed: boolean; // Derived from progress_percentage
  // We cannot reliably get these from virgil_course_conversations alone:
  // title: string; 
  // description: string;
  // image: string;
  // entry_type: string;
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
      
      // Fetch using the <any> client
      const { data: courseConversations, error: courseConvoError } = await supabase
        .from('virgil_course_conversations')
        .select('id, course_id, progress_percentage') 
        .eq('user_id', userId);
        
      if (courseConvoError) throw courseConvoError;

      // Map assuming data is an array of objects with expected fields
      const coursesList: Course[] = (courseConversations || []).map((convo: any) => ({
        id: convo.id,
        course_id: convo.course_id,
        progress: convo.progress_percentage ?? 0,
        completed: (convo.progress_percentage ?? 0) >= 100,
      }));
      
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
