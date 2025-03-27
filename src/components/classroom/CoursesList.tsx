
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Hexagon } from "lucide-react";
import { ProgressDisplay } from "@/components/reader/ProgressDisplay";

const CoursesList: React.FC = () => {
  const navigate = useNavigate();
  
  // Sample course data - would normally come from an API
  const courses = [
    {
      id: "course1",
      title: "Ethics & Morality",
      description: "Foundations of ethical reasoning and moral philosophy",
      progress: 35,
      image: "/lovable-uploads/f3e6dce2-7c4d-4ffd-8e3c-c25c8abd1207.png"
    },
    {
      id: "course2",
      title: "Critical Thinking",
      description: "Developing analytical skills and logical reasoning",
      progress: 20,
      image: "/lovable-uploads/f3e6dce2-7c4d-4ffd-8e3c-c25c8abd1207.png"
    },
    {
      id: "course3",
      title: "Political Philosophy",
      description: "Understanding systems of governance and power structures",
      progress: 50,
      image: "/lovable-uploads/f3e6dce2-7c4d-4ffd-8e3c-c25c8abd1207.png"
    }
  ];
  
  const handleCourseClick = (course: any) => {
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

      {/* Course list - styled like the kindred/challenging cards */}
      <div className="space-y-6 mt-4">
        {courses.map((course) => (
          <div key={course.id}>
            <div 
              className="rounded-xl p-4 pb-1.5 bg-[#383741]/80 shadow-inner cursor-pointer"
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
                
                <button className="h-8 w-8 rounded-full bg-[#E9E7E2]/10 flex items-center justify-center ml-4">
                  <ArrowRight className="h-4 w-4 text-[#E9E7E2]" />
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
    </div>
  );
};

export default CoursesList;
