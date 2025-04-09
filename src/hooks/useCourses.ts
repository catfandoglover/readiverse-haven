import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Course {
  id: string;
  title: string;
  description: string;
  progress: number;
  image: string;
  conversation_id?: string;
  completed: boolean;
  entry_id: string;
  entry_type: string;
}

export const useCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      
      // Get prompt 15 for classroom courses
      const { data: promptData, error: promptError } = await supabase
        .from('prompts')
        .select('*')
        .eq('id', 15)
        .single();
        
      if (promptError) throw promptError;

      // Get user's courses from the user_courses table
      const { data: userCoursesData, error: userCoursesError } = await supabase
        .from('user_courses')
        .select('*');
        
      if (userCoursesError) throw userCoursesError;

      // Convert to the Course interface format
      let coursesList: Course[] = [];
      
      // If user has existing courses, use those
      if (userCoursesData && userCoursesData.length > 0) {
        // Get all unique entry types
        const entryTypes = [...new Set(userCoursesData.map(course => course.entry_type))];
        const entryIds = userCoursesData.map(course => course.entry_id);
        
        // Fetch entry details for each entry type
        const entriesData = await Promise.all(
          entryTypes.map(async (type) => {
            // Filter entry IDs for current type
            const typeEntryIds = userCoursesData
              .filter(course => course.entry_type === type)
              .map(course => course.entry_id);
            
            // Skip if no entries of this type
            if (!typeEntryIds.length) return { type, data: [] };
            
            // Determine table name based on entry type
            const tableName = type === 'book' ? 'books' : 
                              type === 'icon' ? 'icons' : 'concepts';
            
            // Select appropriate fields based on entry type
            const selectFields = type === 'book' ? 'id, title, about, cover_url' :
                                 type === 'icon' ? 'id, name as title, about, illustration as cover_url' :
                                 'id, title, about, illustration as cover_url';
            
            const { data, error } = await supabase
              .from(tableName)
              .select(selectFields)
              .in('id', typeEntryIds);
              
            if (error) throw error;
            return { type, data: data || [] };
          })
        );
        
        // Map user courses with their corresponding entry details
        coursesList = userCoursesData.map(userCourse => {
          // Find entry data matching this course's type and ID
          const entriesForType = entriesData.find(e => e.type === userCourse.entry_type)?.data || [];
          const entry = entriesForType.find(e => e.id === userCourse.entry_id);
          
          return {
            id: userCourse.id,
            title: entry?.title || "Unknown Course",
            description: entry?.about || "Course description unavailable",
            progress: userCourse.progress,
            image: entry?.cover_url || "/lovable-uploads/f3e6dce2-7c4d-4ffd-8e3c-c25c8abd1207.png",
            conversation_id: userCourse.conversation_id,
            completed: userCourse.completed,
            entry_id: userCourse.entry_id,
            entry_type: userCourse.entry_type
          };
        });
      } else {
        // Use sample course data if no courses exist for the user
        coursesList = [
          {
            id: "course1",
            title: "Ethics & Morality",
            description: "Foundations of ethical reasoning and moral philosophy",
            progress: 35,
            image: "/lovable-uploads/f3e6dce2-7c4d-4ffd-8e3c-c25c8abd1207.png",
            completed: false,
            entry_id: "",
            entry_type: "book"
          },
          {
            id: "course2",
            title: "Critical Thinking",
            description: "Developing analytical skills and logical reasoning",
            progress: 20,
            image: "/lovable-uploads/f3e6dce2-7c4d-4ffd-8e3c-c25c8abd1207.png",
            completed: false,
            entry_id: "",
            entry_type: "book"
          },
          {
            id: "course3",
            title: "Political Philosophy",
            description: "Understanding systems of governance and power structures",
            progress: 50,
            image: "/lovable-uploads/f3e6dce2-7c4d-4ffd-8e3c-c25c8abd1207.png",
            completed: false,
            entry_id: "",
            entry_type: "book"
          }
        ];
      }
      
      setCourses(coursesList);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const updateCourseProgress = async (courseId: string, progress: number) => {
    try {
      const completed = progress >= 100;
      
      const { error } = await supabase
        .from('user_courses')
        .update({ 
          progress,
          completed,
          updated_at: new Date().toISOString()
        })
        .eq('id', courseId);
        
      if (error) throw error;
      
      // Update local state
      setCourses(prevCourses => 
        prevCourses.map(course => 
          course.id === courseId 
            ? { ...course, progress, completed } 
            : course
        )
      );
      
      return { success: true };
    } catch (error) {
      console.error("Error updating course progress:", error);
      toast.error("Failed to update course progress");
      return { success: false, error };
    }
  };

  // Create a new course for a user
  const createCourse = async (entryId: string, entryType: string) => {
    try {
      console.log("Creating course with entryId:", entryId, "entryType:", entryType);
      
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error("User not authenticated");
        throw new Error("User not authenticated");
      }
      
      console.log("User session:", session.user.id);
      
      // Get user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, user_id')
        .eq('user_id', session.user.id)
        .single();
        
      if (profileError) {
        console.error("Profile error:", profileError);
        throw profileError;
      }
      
      console.log("Profile data:", profileData);
      
      // Create new course
      const { data, error } = await supabase
        .from('user_courses')
        .insert({
          user_id: session.user.id,
          profile_id: profileData?.id,
          entry_id: entryId,
          entry_type: entryType,
          progress: 0,
          completed: false
        })
        .select()
        .single();
        
      if (error) {
        console.error("Insert error:", error);
        throw error;
      }
      
      console.log("Course created:", data);
      
      // Refresh courses
      await fetchCourses();
      
      return { success: true, data };
    } catch (error: any) {
      console.error("Error creating course:", error);
      toast.error(`Failed to create course: ${error.message || "Unknown error"}`);
      return { success: false, error };
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return {
    courses,
    loading,
    fetchCourses,
    updateCourseProgress,
    createCourse
  };
};
