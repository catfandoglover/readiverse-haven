import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { Header } from "@/components/ui/header";
import { saveLastVisited, getLastVisited, sections } from "@/utils/navigationHistory";
import { Home, User, Compass, BookOpenCheck, LayoutDashboard, GraduationCap, Headset } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

interface NavigationTabProps {
  tab: "profile" | "dna" | "discover" | "bookshelf" | "dashboard" | "virgil" | "counselor";
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const currentPath = location.pathname;
    for (const key in sections) {
      if (sections.hasOwnProperty(key) && currentPath.startsWith(sections[key as keyof typeof sections])) {
        saveLastVisited(key as keyof typeof sections, currentPath);
        break;
      }
    }
  }, [location.pathname]);

  const handleTabChange = (tab: "profile" | "dna" | "discover" | "bookshelf" | "dashboard" | "virgil" | "counselor") => {
    if (tab === "virgil") {
      navigate("/virgil");
      return;
    }
    
    if (tab === "counselor") {
      navigate("/book-counselor");
      return;
    }
    
    // For all other tabs, use the existing logic
    saveLastVisited(tab, getLastVisited(tab));
    navigate(getLastVisited(tab));
  };

  const renderNavigationTab = ({ tab }: NavigationTabProps) => {
    let IconComponent: React.ComponentType<{ className?: string }>;
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
      case "counselor":
        IconComponent = Headset;
        label = "Talk to a Human";
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
              {renderNavigationTab({ tab: "counselor" })}
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
                <Avatar>
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback>{user?.email ? user.email[0].toUpperCase() : 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">{user?.user_metadata?.full_name || user?.email}</div>
                  <div className="text-sm text-muted-foreground">{user?.email}</div>
                </div>
              </div>
              <Button variant="destructive" size="sm" onClick={() => signOut && signOut()}>Sign Out</Button>
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
                {renderNavigationTab({ tab: "counselor" })}
              </div>
            </ScrollArea>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default DashboardLayout;
