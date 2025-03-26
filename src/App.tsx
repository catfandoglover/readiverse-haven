
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/OutsetaAuthContext";
import DiscoverLayout from "@/components/discover/DiscoverLayout"; 
import Home from "@/components/Home";
import NewBookshelf from "@/components/NewBookshelf";
import IntellectualDNA from "./pages/IntellectualDNA";
import DNAAssessment from "./pages/DNAAssessment";
import DNACompletionScreen from "./pages/DNACompletionScreen";
import DNAEmailConfirmationScreen from "./pages/DNAEmailConfirmationScreen";
import GreatQuestions from "@/pages/GreatQuestions";
import { Reader } from "@/components/Reader";
import { useBook } from '@/hooks/useBook';
import Profile from "./pages/Profile";
import ShareableProfile from "./pages/ShareableProfile";
import DomainDetail from "./pages/DomainDetail";
import BecomeWhoYouAre from "./pages/BecomeWhoYouAre";
import DNAPriming from "./pages/DNAPriming";
import VirgilOffice from "./pages/VirgilOffice";
import VirgilWelcome from "./pages/VirgilWelcome";
import Dashboard from "./pages/Dashboard";
import VirgilModes from "./pages/VirgilModes";
import VirgilChat from "./pages/VirgilChat";
import SearchPage from "./pages/SearchPage";
import IconsFeedPage from "./pages/IconsFeedPage";
import ConceptsFeedPage from "./pages/ConceptsFeedPage";
import ClassicsFeedPage from "./pages/ClassicsFeedPage";
import GreatQuestionDetailView from "./components/discover/GreatQuestionDetailedView";

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
                <Route path="/" element={<Navigate to="/dna" replace />} />
                <Route path="/discover" element={<DiscoverLayout />} /> 
                <Route path="/view/:type/:slug" element={<DiscoverLayout />} />
                <Route path="/discover/questions" element={<DiscoverLayout />} />
                <Route path="/discover/questions/:index" element={<DiscoverLayout />} />
                <Route path="/discover/search" element={<SearchPage />} /> 
                <Route path="/discover/search/icons" element={<IconsFeedPage />} />
                <Route path="/discover/search/concepts" element={<ConceptsFeedPage />} />
                <Route path="/discover/search/classics" element={<ClassicsFeedPage />} />
                <Route path="/discover/search/questions" element={<GreatQuestions />} />
                <Route path="/home-old" element={<Home />} /> 
                <Route path="/bookshelf" element={<NewBookshelf />} />
                <Route path="/dna" element={<IntellectualDNA />} />
                <Route path="/dna/priming" element={<DNAPriming />} />
                <Route path="/dna/:category" element={<DNAAssessment />} />
                <Route path="/dna/completion" element={<DNACompletionScreen />} />
                <Route path="/dna/confirm-email" element={<DNAEmailConfirmationScreen />} />
                <Route path="/dna/welcome" element={<VirgilWelcome />} />
                <Route path="/great-questions" element={<GreatQuestions />} />
                <Route path="/great-questions/:id" element={<GreatQuestions />} />
                <Route path="/read/:slug" element={<ReaderWrapper />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile/share/:name" element={<ShareableProfile />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/dashboard/domain/:domainId" element={<DomainDetail />} />
                <Route path="/become-who-you-are" element={<BecomeWhoYouAre />} />
                <Route path="/virgil" element={<VirgilOffice />} />
                <Route path="/virgil-modes" element={<VirgilModes />} />
                <Route path="/virgil-chat" element={<VirgilChat />} />
                
                {/* Redirects from old paths to new paths */}
                <Route path="/search" element={<Navigate to="/discover/search" replace />} />
                <Route path="/search/icons" element={<Navigate to="/discover/search/icons" replace />} />
                <Route path="/search/concepts" element={<Navigate to="/discover/search/concepts" replace />} />
                <Route path="/search/classics" element={<Navigate to="/discover/search/classics" replace />} />
                <Route path="/search/questions" element={<Navigate to="/discover/search/questions" replace />} />
              </Routes>
            </ErrorBoundary>
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
