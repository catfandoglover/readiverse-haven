
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainMenu from "../navigation/MainMenu";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { GraduationCap, Hexagon, Award, Clock, LineChart } from "lucide-react";
import TimeWithVirgil from "./TimeWithVirgil";
import BadgesPage from "./BadgesPage";

type DashboardSection = "timeWithVirgil" | "courses" | "badges" | "reports";

const DashboardLayout: React.FC = () => {
  const [activeSection, setActiveSection] = useState<DashboardSection>("timeWithVirgil");
  const navigate = useNavigate();

  const handleSectionChange = (section: DashboardSection) => {
    setActiveSection(section);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#2A282A] text-[#E9E7E2] overflow-hidden">
      {/* Header */}
      <div className="flex items-center pt-4 px-4">
        <MainMenu />
        <h2 className="font-oxanium uppercase text-[#E9E7E2]/50 tracking-wider text-sm font-bold mx-auto">
          Dashboard
        </h2>
        <div className="w-10 h-10" /> {/* Empty div for spacing balance */}
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="container max-w-4xl mx-auto px-4 py-6">
          {/* Image Card */}
          <Card className="mb-6 bg-[#383741] border-none overflow-hidden">
            <div className="relative h-48 bg-gradient-to-r from-[#332E38] to-[#2A282A]">
              <img 
                src="https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/Icon_Images/Virgil.png" 
                alt="Virgil" 
                className="absolute right-4 bottom-0 h-40 object-contain"
              />
              <div className="absolute inset-0 flex flex-col justify-center px-6">
                <h2 className="text-3xl font-baskerville text-[#E9E7E2] mb-2">Welcome Back</h2>
                <p className="text-[#E9E7E2]/70 max-w-[60%] mb-4">
                  Your intellectual journey continues with personalized insights and achievements.
                </p>
                <Button 
                  variant="virgil" 
                  className="w-fit"
                  onClick={() => navigate("/virgil")}
                >
                  Visit Virgil
                </Button>
              </div>
            </div>
          </Card>

          {/* Icon Container */}
          <div className="mb-6 flex items-center justify-between bg-[#383741] p-4 rounded-lg">
            <div className="flex items-center space-x-4">
              <div 
                className="cursor-pointer"
                onClick={() => navigate("/view/icons/virgil")}
              >
                <div className="relative">
                  <Hexagon className="h-14 w-14 text-[#CCFF23]" strokeWidth={.75} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <img 
                      src="https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/Icon_Images/Virgil.png" 
                      alt="Virgil" 
                      className="h-10 w-10 object-cover"
                      style={{ 
                        clipPath: 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)',
                      }}
                    />
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-oxanium text-[#E9E7E2]">Virgil</h3>
                <p className="text-sm text-[#E9E7E2]/70">Your philosophical guide</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              className="text-[#E9E7E2]/70 hover:text-[#E9E7E2] hover:bg-[#E9E7E2]/5"
              onClick={() => navigate("/virgil")}
            >
              <GraduationCap className="h-6 w-6" />
              <span className="ml-2 font-oxanium">Visit classroom</span>
            </Button>
          </div>

          {/* Navigation Menu */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Button
              variant="ghost"
              className={`flex flex-col py-6 ${
                activeSection === "timeWithVirgil" 
                  ? "bg-[#383741] text-[#E9E7E2]" 
                  : "bg-[#333238] text-[#E9E7E2]/60 hover:bg-[#383741] hover:text-[#E9E7E2]"
              } rounded-lg transition-all`}
              onClick={() => handleSectionChange("timeWithVirgil")}
            >
              <Clock className="h-6 w-6 mb-2" />
              <span className="font-oxanium text-sm">Time with Virgil</span>
            </Button>
            
            <Button
              variant="ghost"
              className={`flex flex-col py-6 ${
                activeSection === "courses" 
                  ? "bg-[#383741] text-[#E9E7E2]" 
                  : "bg-[#333238] text-[#E9E7E2]/60 hover:bg-[#383741] hover:text-[#E9E7E2]"
              } rounded-lg transition-all`}
              onClick={() => handleSectionChange("courses")}
            >
              <GraduationCap className="h-6 w-6 mb-2" />
              <span className="font-oxanium text-sm">Courses Completed</span>
            </Button>
            
            <Button
              variant="ghost"
              className={`flex flex-col py-6 ${
                activeSection === "badges" 
                  ? "bg-[#383741] text-[#E9E7E2]" 
                  : "bg-[#333238] text-[#E9E7E2]/60 hover:bg-[#383741] hover:text-[#E9E7E2]"
              } rounded-lg transition-all`}
              onClick={() => handleSectionChange("badges")}
            >
              <Award className="h-6 w-6 mb-2" />
              <span className="font-oxanium text-sm">Badges Earned</span>
            </Button>
            
            <Button
              variant="ghost"
              className={`flex flex-col py-6 ${
                activeSection === "reports" 
                  ? "bg-[#383741] text-[#E9E7E2]" 
                  : "bg-[#333238] text-[#E9E7E2]/60 hover:bg-[#383741] hover:text-[#E9E7E2]"
              } rounded-lg transition-all`}
              onClick={() => handleSectionChange("reports")}
            >
              <LineChart className="h-6 w-6 mb-2" />
              <span className="font-oxanium text-sm">Weekly Reports</span>
            </Button>
          </div>

          {/* Dynamic Content */}
          {activeSection === "timeWithVirgil" && <TimeWithVirgil />}
          {activeSection === "badges" && <BadgesPage />}
          {activeSection === "courses" && (
            <div className="flex flex-col items-center justify-center p-12 bg-[#383741] rounded-lg">
              <GraduationCap className="h-16 w-16 text-[#E9E7E2]/30 mb-4" />
              <h3 className="text-xl font-baskerville text-[#E9E7E2] mb-2">Coming Soon</h3>
              <p className="text-[#E9E7E2]/70 text-center">Courses are currently in development. Check back soon for updates.</p>
            </div>
          )}
          {activeSection === "reports" && (
            <div className="flex flex-col items-center justify-center p-12 bg-[#383741] rounded-lg">
              <LineChart className="h-16 w-16 text-[#E9E7E2]/30 mb-4" />
              <h3 className="text-xl font-baskerville text-[#E9E7E2] mb-2">Coming Soon</h3>
              <p className="text-[#E9E7E2]/70 text-center">Weekly reports are currently in development. Check back soon for updates.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
