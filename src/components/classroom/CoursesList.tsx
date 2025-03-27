
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Hexagon, Check } from "lucide-react";
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
      {/* Header with border above the heading */}
      <div className="mb-4">
        <div className="border-b border-[#E9E7E2]/10 mb-4"></div>
        <h2 className="font-baskerville text-lg font-bold text-[#E9E7E2] px-1">
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
                className="rounded-xl p-4 pb-1.5 bg-[#E9E7E2]/10 shadow-inner cursor-pointer"
                style={{ background: 'linear-gradient(rgba(233, 231, 226, 0.1), rgba(25, 53, 47, 0.1))' }}
                onClick={() => handleCourseClick(course)}
              >
                <div className="flex items-center mb-3">
                  <div className="flex items-center flex-1">
                    <div className="relative mr-4">
                      <Hexagon className="h-10 w-10 text-[#CCFF23]" strokeWidth={3} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <img 
                          src={course.image} 
                          alt={course.title}
                          className="h-9 w-9 object-cover rounded-none"
                          style={{ 
                            clipPath: 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)',
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm text-[#E9E7E2] font-oxanium uppercase font-bold">{course.title}</h3>
                      <p className="text-xs text-[#E9E7E2]/70 font-oxanium">Course</p>
                    </div>
                  </div>
                  
                  <button className={`h-8 w-8 rounded-full flex items-center justify-center ml-4 ${course.completed ? 'bg-[#CCFF23]' : 'bg-[#E9E7E2]/10'}`}>
                    {course.completed ? (
                      <Check className="h-4 w-4 text-[#19352F]" />
                    ) : (
                      <ArrowRight className="h-4 w-4 text-[#E9E7E2]" />
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
              
              <p className="text-xs text-[#9F9EA1] ml-2 font-oxanium mt-3 mb-4">{course.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CoursesList;
