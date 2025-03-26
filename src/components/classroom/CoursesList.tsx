
import React from "react";

const CoursesList: React.FC = () => {
  // Sample course data - would normally come from an API
  const courses = [
    {
      id: "course1",
      title: "Ethics & Morality",
      description: "Foundations of ethical reasoning and moral philosophy",
      progress: 35
    },
    {
      id: "course2",
      title: "Critical Thinking",
      description: "Developing analytical skills and logical reasoning",
      progress: 20
    },
    {
      id: "course3",
      title: "Political Philosophy",
      description: "Understanding systems of governance and power structures",
      progress: 50
    }
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header with border above the heading */}
      <div className="mb-4">
        <div className="border-b border-[#E9E7E2]/10 mb-4"></div>
        <h2 className="font-baskerville text-lg font-bold text-[#E9E7E2] px-1">
          My Courses
        </h2>
      </div>

      {/* Course list - styled like profile page buttons */}
      <div className="flex flex-col space-y-4">
        {courses.map((course) => (
          <button
            key={course.id}
            className="w-full rounded-xl overflow-hidden bg-[#19352F]/70 shadow-md hover:bg-[#19352F] transition-colors p-4 text-left"
          >
            <h3 className="text-lg font-baskerville font-bold text-[#E9E7E2] mb-2">
              {course.title}
            </h3>
            <p className="text-[#E9E7E2]/70 font-baskerville text-sm mb-3">
              {course.description}
            </p>
            
            {/* Progress bar */}
            <div className="w-full bg-[#E9E7E2]/20 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-[#CCFF23] h-full rounded-full"
                style={{ width: `${course.progress}%` }}
              />
            </div>
            <p className="text-[#E9E7E2]/50 text-xs font-oxanium mt-2 uppercase tracking-wider">
              {course.progress}% Complete
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CoursesList;
