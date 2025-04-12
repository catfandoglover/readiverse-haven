import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { ProgressDisplay } from "@/components/reader/ProgressDisplay";
import { useCourses, Course } from "@/hooks/useCourses";

const CoursesList: React.FC = () => {
  const navigate = useNavigate();
  const { courses, loading } = useCourses();
  
  const handleCourseClick = (course: Course) => {
    navigate('/classroom-virgil-chat', { 
      state: { 
        courseData: {
          ...course,
          isDNA: false // These are regular courses, not DNA courses
        } 
      } 
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with divider */}
      <div className="mb-6">
        <div className="h-px w-full my-6 bg-[#9F9EA1]/20"></div>
        <h2 className="font-oxanium text-base font-bold text-[#E9E7E2] px-1 uppercase tracking-wider">
          My Courses
        </h2>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="text-[#E9E7E2]/70">Loading courses...</div>
        </div>
      ) : (
        /* Course list - styled like the kindred/challenging cards */
        <div className="space-y-6 mt-4">
          {courses.map((course) => (
            <div key={course.id}>
              <div 
                className="rounded-xl p-4 pb-1.5 bg-[#19352F]/80 shadow-inner cursor-pointer hover:bg-[#19352F] transition-colors"
                onClick={() => handleCourseClick(course)}
              >
                <div className="flex items-center mb-3">
                  <div className="flex items-center flex-1">
                    <div className="relative mr-4">
                      <div className="h-9 w-9 rounded-full overflow-hidden">
                        <img 
                          src={course.image} 
                          alt={course.title}
                          className="h-9 w-9 object-cover"
                        />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm text-[#E9E7E2] font-oxanium uppercase font-bold">{course.title}</h3>
                      <p className="text-xs text-[#E9E7E2]/70 font-oxanium mt-0.5 line-clamp-2">{course.description || 'No description available.'}</p>
                    </div>
                  </div>
                  
                  <button className={`h-9 w-9 rounded-full flex items-center justify-center ml-4 ${course.completed ? 'bg-[#CCFF23]' : 'bg-[#E9E7E2]/75'}`}>
                    {course.completed ? (
                      <Check className="h-4 w-4 text-[#19352F]" />
                    ) : (
                      <ArrowRight className="h-4 w-4 text-[#19352F]" />
                    )}
                  </button>
                </div>
                
                {/* Progress bar using the same component as in IntellectualDNACourse */}
                <ProgressDisplay 
                  progress={course.progress} 
                  showLabel={false} 
                  className="mb-3" 
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CoursesList;
