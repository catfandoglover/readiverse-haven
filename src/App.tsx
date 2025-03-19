
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/OutsetaAuthContext";
import DiscoverLayout from "@/components/discover/DiscoverLayout"; 
import Home from "@/components/Home";
import Bookshelf from "@/components/Bookshelf";
import IntellectualDNA from "./pages/IntellectualDNA";
import DNAAssessment from "./pages/DNAAssessment";
import DNACompletionScreen from "./pages/DNACompletionScreen";
import DNAEmailConfirmationScreen from "./pages/DNAEmailConfirmationScreen";
import GreatQuestions from "@/pages/GreatQuestions";
import { Reader } from "@/components/Reader";
import { useBook } from '@/hooks/useBook';
import Dashboard from "./pages/Dashboard";
import DomainDetail from "./pages/DomainDetail";
import BecomeWhoYouAre from "./pages/BecomeWhoYouAre";
import DNAPriming from "./pages/DNAPriming";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const ReaderWrapper = () => {
  const location = useLocation();
  const slug = location.pathname.split('/read/')[1];
  const state = location.state as { bookUrl: string; metadata: { Cover_super: string | null } };
  
  const { data: book, isLoading } = useBook(slug);

  const bookUrl = state?.bookUrl || book?.epub_file_url;
  const coverSuper = state?.metadata?.Cover_super || book?.Cover_super;

  return (
    <Reader 
      metadata={{ Cover_super: coverSuper }}
      preloadedBookUrl={bookUrl}
      isLoading={isLoading}
    />
  );
};

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
                <Route path="/" element={<DiscoverLayout />} /> 
                <Route path="/view/:type/:slug" element={<DiscoverLayout />} />
                <Route path="/home-old" element={<Home />} /> 
                <Route path="/bookshelf" element={<Bookshelf />} />
                <Route path="/dna" element={<IntellectualDNA />} />
                <Route path="/dna/priming" element={<DNAPriming />} />
                <Route path="/dna/:category" element={<DNAAssessment />} />
                <Route path="/dna/completion" element={<DNACompletionScreen />} />
                <Route path="/dna/confirm-email" element={<DNAEmailConfirmationScreen />} />
                <Route path="/great-questions" element={<GreatQuestions />} />
                <Route path="/read/:slug" element={<ReaderWrapper />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/dashboard/domain/:domainId" element={<DomainDetail />} />
                <Route path="/become-who-you-are" element={<BecomeWhoYouAre />} />
              </Routes>
            </ErrorBoundary>
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
