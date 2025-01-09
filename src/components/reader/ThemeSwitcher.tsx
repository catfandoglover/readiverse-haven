import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun, BookOpen } from "lucide-react";

const ThemeSwitcher = () => {
  const { themeType, setThemeType } = useTheme();

  const handleThemeChange = () => {
    switch (themeType) {
      case 'light':
        setThemeType('dark');
        break;
      case 'dark':
        setThemeType('sepia');
        break;
      case 'sepia':
        setThemeType('light');
        break;
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleThemeChange}
      className="fixed bottom-4 right-4 z-50"
    >
      {themeType === 'light' && <Sun className="h-[1.2rem] w-[1.2rem]" />}
      {themeType === 'dark' && <Moon className="h-[1.2rem] w-[1.2rem]" />}
      {themeType === 'sepia' && <BookOpen className="h-[1.2rem] w-[1.2rem]" />}
    </Button>
  );
};

export default ThemeSwitcher;