
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Course {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  progress: number;
  completed: boolean;
}

export function useCourses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) {
      setCourses([]);
      setIsLoading(false);
      return;
    }

    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get user's courses from user_courses table
        const { data: userCoursesData, error: userCoursesError } = await supabase
          .from('user_courses')
          .select('entry_id, progress, completed, entry_type')
          .eq('user_id', user.id);

        if (userCoursesError) {
          throw new Error(`Failed to fetch user courses: ${userCoursesError.message}`);
        }

        if (!userCoursesData || userCoursesData.length === 0) {
          setCourses([]);
          setIsLoading(false);
          return;
        }

        // Separate by entry type
        const iconIds = userCoursesData
          .filter(course => course.entry_type === 'icon')
          .map(course => course.entry_id);

        const conceptIds = userCoursesData
          .filter(course => course.entry_type === 'concept')
          .map(course => course.entry_id);

        // Prepare results array
        const results: Course[] = [];

        // Fetch icons data if we have any icon courses
        if (iconIds.length > 0) {
          const { data: iconsData, error: iconsError } = await supabase
            .from('icons')
            .select('id, name, about, illustration')
            .in('id', iconIds);

          if (iconsError) {
            console.error('Error fetching icons data:', iconsError);
          } else if (iconsData) {
            // Map icons to courses
            const iconCourses = iconsData.map(icon => {
              const userCourse = userCoursesData.find(uc => uc.entry_id === icon.id);
              return {
                id: icon.id,
                title: icon.name || 'Unknown Icon',
                description: icon.about || 'No description available',
                coverImage: icon.illustration || '',
                progress: userCourse?.progress || 0,
                completed: userCourse?.completed || false
              };
            });

            results.push(...iconCourses);
          }
        }

        // Fetch concepts data if we have any concept courses
        if (conceptIds.length > 0) {
          const { data: conceptsData, error: conceptsError } = await supabase
            .from('concepts')
            .select('id, title, about, illustration')
            .in('id', conceptIds);

          if (conceptsError) {
            console.error('Error fetching concepts data:', conceptsError);
          } else if (conceptsData) {
            // Map concepts to courses
            const conceptCourses = conceptsData.map(concept => {
              const userCourse = userCoursesData.find(uc => uc.entry_id === concept.id);
              return {
                id: concept.id,
                title: concept.title || 'Unknown Concept',
                description: concept.about || 'No description available',
                coverImage: concept.illustration || '',
                progress: userCourse?.progress || 0,
                completed: userCourse?.completed || false
              };
            });

            results.push(...conceptCourses);
          }
        }

        setCourses(results);
      } catch (error) {
        console.error('Error in useCourses hook:', error);
        setError(error instanceof Error ? error : new Error(String(error)));
        toast.error('Failed to load your courses');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [user]);

  return { courses, isLoading, error };
}

export default useCourses;
