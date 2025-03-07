
import React from "react";
import { useNavigate } from "react-router-dom";
import { getLastVisited } from "@/utils/navigationHistory";

interface BottomNavProps {
  activeTab: "discover" | "dna" | "study";
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab }) => {
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    if (path === '/dna' && activeTab !== "dna") {
      navigate(getLastVisited('dna') || '/dna');
    } else if (path === '/') {
      navigate(getLastVisited('discover') || '/');
    } else if (path === '/bookshelf') {
      navigate(getLastVisited('bookshelf') || '/bookshelf');
    } else {
      navigate(path);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-[#1A1A1A] py-2 z-50">
      <div className="flex justify-center items-center h-full">
        <div className="flex justify-between items-center w-full max-w-xs">
          <button 
            className={`flex flex-col items-center justify-center w-1/3 gap-1 text-[#E9E7E2]`}
            onClick={() => handleNavigation('/')}
          >
            <div className={`rounded-full ${activeTab === "discover" ? "bg-[#E9E7E2]" : ""} p-2`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke={activeTab === "discover" ? "#1A1A1A" : "#E9E7E2"} 
                  strokeWidth="2" 
                  fill={activeTab === "discover" ? "#1A1A1A" : "none"} 
                />
                <circle 
                  cx="12" 
                  cy="12" 
                  r="3" 
                  fill={activeTab === "discover" ? "#1A1A1A" : "#E9E7E2"} 
                  stroke={activeTab === "discover" ? "#1A1A1A" : "#E9E7E2"} 
                  strokeWidth="0.5" 
                />
                <path 
                  d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" 
                  fill={activeTab === "discover" ? "#1A1A1A" : "#E9E7E2"} 
                  stroke={activeTab === "discover" ? "#1A1A1A" : "#E9E7E2"} 
                  strokeWidth="0.5" 
                />
              </svg>
            </div>
            <span className="text-xs uppercase font-oxanium">Discover</span>
          </button>
          
          <button 
            className={`flex flex-col items-center justify-center w-1/3 gap-1 text-[#E9E7E2]`}
            onClick={() => handleNavigation('/dna')}
          >
            <div className={`rounded-full ${activeTab === "dna" ? "bg-[#E9E7E2]" : ""} p-2`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path 
                  d="M21 16.0001V8.00006C20.9986 7.6493 20.9723 7.29977 20.922 6.95506C20.7741 6.03606 20.3051 5.19738 19.5998 4.58273C18.8946 3.96808 17.9951 3.61248 17.063 3.58006C16.689 3.52757 16.3108 3.50106 15.932 3.50006H8.06801C7.68712 3.50058 7.30697 3.52674 6.93001 3.57906C6.00092 3.61402 5.10506 3.97099 4.40203 4.58552C3.699 5.20006 3.22987 6.03725 3.08001 6.95406C3.02829 7.2984 3.00022 7.64774 2.99701 7.99806V16.0001C2.99795 16.3532 3.02452 16.7052 3.07901 17.0521C3.22876 17.9689 3.69789 18.8061 4.40092 19.4206C5.10394 20.0352 5.9998 20.3921 6.92889 20.4271C7.30584 20.4794 7.686 20.5056 8.06689 20.5061H15.933C16.3138 20.5056 16.694 20.4794 17.071 20.4271C18.0023 20.3947 18.9018 20.0391 19.607 19.4244C20.3123 18.8098 20.7813 17.9711 20.9291 17.0521C20.9747 16.7057 20.9998 16.3538 21 16.0001Z" 
                  stroke={activeTab === "dna" ? "#1A1A1A" : "#E9E7E2"} 
                  strokeWidth="2" 
                  fill={activeTab === "dna" ? "#E9E7E2" : "none"} 
                />
                <circle 
                  cx="12" 
                  cy="12" 
                  r="3" 
                  fill={activeTab === "dna" ? "#1A1A1A" : "#E9E7E2"} 
                  transform="rotate(45 12 12)" 
                />
              </svg>
            </div>
            <span className="text-xs uppercase font-oxanium">My DNA</span>
          </button>
          
          <button 
            className={`flex flex-col items-center justify-center w-1/3 gap-1 text-[#E9E7E2]`}
            onClick={() => handleNavigation('/bookshelf')}
          >
            <div className={`rounded-full ${activeTab === "study" ? "bg-[#E9E7E2]" : ""} p-2`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path 
                  d="M4 19.5C4 18.837 4.26339 18.2011 4.73223 17.7322C5.20107 17.2634 5.83696 17 6.5 17H20" 
                  stroke={activeTab === "study" ? "#1A1A1A" : "#E9E7E2"} 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                <path 
                  d="M6.5 2H20V22H6.5C5.83696 22 5.20107 21.7366 4.73223 21.2678C4.26339 20.7989 4 20.163 4 19.5V4.5C4 3.83696 4.26339 3.20107 4.73223 2.73223C5.20107 2.26339 5.83696 2 6.5 2Z" 
                  stroke={activeTab === "study" ? "#1A1A1A" : "#E9E7E2"} 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  fill={activeTab === "study" ? "#E9E7E2" : "none"}
                />
              </svg>
            </div>
            <span className="text-xs uppercase font-oxanium">Study</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
