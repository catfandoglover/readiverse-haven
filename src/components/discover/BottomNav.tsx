
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Home, Book, User, School, Hash, Compass, Grid } from 'lucide-react';

type NavSection = 'dna' | 'discover' | 'bookshelf' | 'profile' | 'dashboard' | 'classroom' | 'counselor';

interface BottomNavProps {
  className?: string;
}

const BottomNav: React.FC<BottomNavProps> = ({ className }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const getActiveSection = (): NavSection => {
    if (currentPath.includes('/dna')) return 'dna';
    if (currentPath.includes('/discover') || currentPath.includes('/search') || 
        currentPath.includes('/icons') || currentPath.includes('/concepts') || 
        currentPath.includes('/texts')) return 'discover';
    if (currentPath.includes('/bookshelf')) return 'bookshelf';
    if (currentPath.includes('/profile')) return 'profile';
    if (currentPath.includes('/dashboard')) return 'dashboard';
    if (currentPath.includes('/classroom')) return 'classroom';
    if (currentPath.includes('/book-counselor')) return 'counselor';
    return 'discover'; // Default
  };

  const activeSection = getActiveSection();

  const navItems = [
    { 
      name: 'Discover', 
      icon: <Compass size={20} />, 
      section: 'discover' as NavSection, 
      path: '/discover' 
    },
    { 
      name: 'Library', 
      icon: <Book size={20} />, 
      section: 'bookshelf' as NavSection, 
      path: '/bookshelf' 
    },
    { 
      name: 'Classroom', 
      icon: <School size={20} />, 
      section: 'classroom' as NavSection, 
      path: '/classroom' 
    },
    { 
      name: 'Profile', 
      icon: <User size={20} />, 
      section: 'profile' as NavSection, 
      path: '/profile' 
    },
  ];

  return (
    <div className={cn("fixed bottom-0 left-0 right-0 bg-[#121212] border-t border-[#333] z-50", className)}>
      <nav className="flex justify-around max-w-lg mx-auto">
        {navItems.map((item) => (
          <button
            key={item.name}
            onClick={() => navigate(item.path)}
            className={cn(
              "flex flex-col items-center py-3 flex-1 text-xs transition-colors",
              activeSection === item.section ? "text-white" : "text-gray-400"
            )}
          >
            {item.icon}
            <span className="mt-1">{item.name}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default BottomNav;
