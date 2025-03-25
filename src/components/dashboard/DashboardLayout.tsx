import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/OutsetaAuthContext";
import { Header } from "@/components/ui/header";
import { saveLastVisited, getLastVisited, sections } from "@/utils/navigationHistory";
import { Home, User, Compass, BookOpenCheck, LayoutDashboard, GraduationCap } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

interface NavigationTabProps {
  tab: "profile" | "dna" | "discover" | "bookshelf" | "dashboard" | "virgil";
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, signOut, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const currentPath = location.pathname;
    for (const key in sections) {
      if (sections.hasOwnProperty(key) && sections[key] === currentPath) {
        saveLastVisited(key as "profile" | "dna" | "discover" | "bookshelf" | "dashboard");
        break;
      }
    }
  }, [location.pathname]);

  const handleTabChange = (tab: "profile" | "dna" | "discover" | "bookshelf" | "dashboard" | "virgil") => {
    if (tab === "virgil") {
      navigate("/virgil");
      return;
    }
    
    // For all other tabs, use the existing logic
    saveLastVisited(tab as "profile" | "dna" | "discover" | "bookshelf" | "dashboard");
    navigate(getLastVisited(tab as "profile" | "dna" | "discover" | "bookshelf" | "dashboard"));
  };

  const renderNavigationTab = ({ tab }: NavigationTabProps) => {
    let IconComponent: React.ComponentType;
    let label: string;

    switch (tab) {
      case "profile":
        IconComponent = User;
        label = "Profile";
        break;
      case "dna":
        IconComponent = GraduationCap;
        label = "DNA";
        break;
      case "discover":
        IconComponent = Compass;
        label = "Discover";
        break;
      case "bookshelf":
        IconComponent = BookOpenCheck;
        label = "Bookshelf";
        break;
      case "dashboard":
        IconComponent = LayoutDashboard;
        label = "Dashboard";
        break;
      default:
        IconComponent = Home;
        label = "Home";
        break;
    }

    return (
      <Button
        variant="ghost"
        className="justify-start px-4"
        onClick={() => handleTabChange(tab)}
      >
        <IconComponent className="mr-2 h-4 w-4" />
        <span>{label}</span>
      </Button>
    );
  };

  const handleLogout = () => {
    logout(); // Use the logout function from OutsetaAuthContext
  };

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1">
        <aside className="hidden md:block w-64 border-r h-full">
          <div className="p-4">
            <div className="mb-4">
              <Button
                variant="ghost"
                className="justify-start px-4"
                onClick={() => navigate("/")}
              >
                <Home className="mr-2 h-4 w-4" />
                <span>Home</span>
              </Button>
            </div>
            <ScrollArea>
              {renderNavigationTab({ tab: "profile" })}
              {renderNavigationTab({ tab: "dna" })}
              {renderNavigationTab({ tab: "discover" })}
              {renderNavigationTab({ tab: "bookshelf" })}
              {renderNavigationTab({ tab: "dashboard" })}
            </ScrollArea>
          </div>
        </aside>
        <main className="flex-1 p-4">
          {children ? children : <Outlet />}
        </main>
      </div>
      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="md:hidden fixed top-4 left-4 z-50">
            Menu
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <div className="flex flex-col h-full">
            <div className="p-4 flex items-center justify-between border-b">
              <div className="flex items-center gap-2">
                <Avatar className="h-12 w-12 mr-4">
                  <AvatarImage src={user?.ProfileImageS3Url} alt={`${user?.FirstName} ${user?.LastName}`} />
                  <AvatarFallback>{user?.FirstName?.charAt(0) || 'U'}{user?.LastName?.charAt(0) || ''}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold">{user?.FirstName} {user?.LastName}</h3>
                  <p className="text-sm text-gray-600">{user?.Email}</p>
                </div>
              </div>
              <Button variant="destructive" size="sm" onClick={handleLogout}>Sign Out</Button>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-4">
                <Button
                  variant="ghost"
                  className="justify-start px-4"
                  onClick={() => navigate("/")}
                >
                  <Home className="mr-2 h-4 w-4" />
                  <span>Home</span>
                </Button>
                {renderNavigationTab({ tab: "profile" })}
                {renderNavigationTab({ tab: "dna" })}
                {renderNavigationTab({ tab: "discover" })}
                {renderNavigationTab({ tab: "bookshelf" })}
                {renderNavigationTab({ tab: "dashboard" })}
              </div>
            </ScrollArea>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default DashboardLayout;
