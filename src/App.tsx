import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/OutsetaAuthContext";
import Home from "@/components/Home";
import Bookshelf from "@/components/Bookshelf";
import IntellectualDNA from "./pages/IntellectualDNA";
import DNAAssessment from "./pages/DNAAssessment";
import Index from "@/pages/Index";
import GreatQuestions from "@/pages/GreatQuestions";
import { Reader } from "@/components/Reader";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ReaderWrapper() {
  const location = useLocation();
  const state = location.state as { bookUrl: string; metadata: { coverUrl: string | null } };

  return (
    <Reader 
      metadata={{ coverUrl: state?.metadata?.coverUrl }}
      preloadedBookUrl={state?.bookUrl}
      isLoading={false}
    />
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <TooltipProvider>
            <ErrorBoundary>
              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/bookshelf" element={<Bookshelf />} />
                <Route path="/dna" element={<IntellectualDNA />} />
                <Route path="/dna/:category" element={<DNAAssessment />} />
                <Route path="/great-questions" element={<GreatQuestions />} />
                <Route path="/:bookSlug" element={<Index />} />
                <Route path="/read/:slug" element={<ReaderWrapper />} />
              </Routes>
            </ErrorBoundary>
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
