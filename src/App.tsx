
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Bookshelf from "./components/Bookshelf";
import Index from "./pages/Index";
import GreatQuestions from "./pages/GreatQuestions";
import AllBooks from "./pages/AllBooks";

const App = () => (
  <TooltipProvider>
    <ErrorBoundary>
      <Toaster />
      <Sonner />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/bookshelf" element={<Bookshelf />} />
        <Route path="/great-questions" element={<GreatQuestions />} />
        <Route path="/all-books" element={<AllBooks />} />
        <Route path="/:bookSlug" element={<Index />} />
      </Routes>
    </ErrorBoundary>
  </TooltipProvider>
);

export default App;
