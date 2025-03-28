import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider, useAuth } from "@/contexts/OutsetaAuthContext";
import DiscoverLayout from "@/components/discover/DiscoverLayout"; 
import Home from "@/components/Home";
import NewBookshelf from "@/components/NewBookshelf";
import IntellectualDNA from "./pages/IntellectualDNA";
import IntellectualDNAShelf from "./pages/IntellectualDNAShelf";
import DNAAssessment from "./pages/DNAAssessment";
import DNACompletionScreen from "./pages/DNACompletionScreen";
import DNAEmailConfirmationScreen from "./pages/DNAEmailConfirmationScreen";
import GreatQuestions from "@/pages/GreatQuestions";
import { Reader } from "@/components/Reader";
import { useBook } from '@/hooks/useBook';
import Profile from "./pages/Profile";
import ShareableProfile from "./pages/ShareableProfile";
import ShareBadgePage from "./pages/ShareBadgePage";
import BecomeWhoYouAre from "./pages/BecomeWhoYouAre";
import DNAPriming from "./pages/DNAPriming";
import VirgilOffice from "./pages/VirgilOffice";
import VirgilWelcome from "./pages/VirgilWelcome";
import Dashboard from "./pages/Dashboard";
import DomainDetail from "./pages/DomainDetail";
import VirgilModes from "./pages/VirgilModes";
import VirgilChat from "./pages/VirgilChat";
import SearchPage from "./pages/SearchPage";
import IconsFeedPage from "./pages/IconsFeedPage";
import ConceptsFeedPage from "./pages/ConceptsFeedPage";
import ClassicsFeedPage from "./pages/ClassicsFeedPage";
import FavoritesShelf from "./pages/FavoritesShelf";
import Classroom from "./pages/Classroom";
import IntellectualDNACourse from "./pages/IntellectualDNACourse";
import IntellectualDNAExam from "./pages/IntellectualDNAExam";
import ClassroomVirgilChat from "./pages/ClassroomVirgilChat";
import ExamRoom from "./pages/ExamRoom";
import ExamWelcome from "./pages/ExamWelcome";
import ExamVirgilChat from "./pages/ExamVirgilChat";
import BookCounselor from "./pages/BookCounselor";
import BookingSuccess from "./pages/BookingSuccess";
import { LoginButtons } from "@/components/auth/LoginButtons";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// ProtectedRoute component to handle authentication and DNA requirements
interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth: boolean;
  requireDNA: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth, 
  requireDNA 
}) => {
  const { user, hasDNA } = useAuth();
  const location = useLocation();

  // Not authenticated but authentication required
  if (requireAuth && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Authenticated, DNA is required, but user doesn't have DNA
  if (requireAuth && requireDNA && user && !hasDNA) {
    return <Navigate to="/dna" state={{ from: location }} replace />;
  }

  // Requirements are satisfied, render the children
  return <>{children}</>;
};

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
                {/* Public routes - no auth required */}
                <Route path="/" element={<Navigate to="/discover" replace />} />
                <Route path="/discover" element={<DiscoverLayout />} /> 
                <Route path="/view/:type/:slug" element={<DiscoverLayout />} />
                <Route path="/discover/questions" element={<DiscoverLayout />} />
                <Route path="/discover/questions/:index" element={<DiscoverLayout />} />
                <Route path="/discover/search" element={<SearchPage />} /> 
                <Route path="/discover/search/icons" element={<IconsFeedPage />} />
                <Route path="/discover/search/concepts" element={<ConceptsFeedPage />} />
                <Route path="/discover/search/classics" element={<ClassicsFeedPage />} />
                <Route path="/discover/search/questions" element={<GreatQuestions />} />
                <Route path="/login" element={<LoginButtons />} />
                <Route path="/profile/share/:name" element={<ShareableProfile />} />
                <Route path="/share-badge/:domainId/:resourceId" element={<ShareBadgePage />} />
                <Route path="/share-badge/:domainId/:resourceId/:userName" element={<ShareBadgePage />} />
                <Route path="/badge/:domainId/:resourceId" element={<ShareBadgePage />} />
                <Route path="/badge/:domainId/:resourceId/:userName" element={<ShareBadgePage />} />
                <Route path="/dna" element={<IntellectualDNA />} />
                <Route path="/dna/completion" element={<DNACompletionScreen />} />
                <Route path="/book-counselor" element={<BookCounselor />} />
                <Route path="/booking-success" element={<BookingSuccess />} />
                
                {/* Auth required, no DNA required */}
                <Route path="/dna/priming" element={
                  <ProtectedRoute requireAuth={true} requireDNA={false}>
                    <DNAPriming />
                  </ProtectedRoute>
                } />
                <Route path="/dna/:category" element={
                  <ProtectedRoute requireAuth={true} requireDNA={false}>
                    <DNAAssessment />
                  </ProtectedRoute>
                } />
                <Route path="/dna/confirm-email" element={
                  <ProtectedRoute requireAuth={true} requireDNA={false}>
                    <DNAEmailConfirmationScreen />
                  </ProtectedRoute>
                } />
                <Route path="/read/:slug" element={
                  <ProtectedRoute requireAuth={true} requireDNA={false}>
                    <ReaderWrapper />
                  </ProtectedRoute>
                } />
                
                {/* Auth and DNA required */}
                <Route path="/dna/welcome" element={
                  <ProtectedRoute requireAuth={true} requireDNA={true}>
                    <VirgilWelcome />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute requireAuth={true} requireDNA={true}>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard" element={
                  <ProtectedRoute requireAuth={true} requireDNA={true}>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/domain/:domainId" element={
                  <ProtectedRoute requireAuth={true} requireDNA={true}>
                    <DomainDetail />
                  </ProtectedRoute>
                } />
                <Route path="/become-who-you-are" element={
                  <ProtectedRoute requireAuth={true} requireDNA={true}>
                    <BecomeWhoYouAre />
                  </ProtectedRoute>
                } />
                <Route path="/virgil" element={
                  <ProtectedRoute requireAuth={true} requireDNA={true}>
                    <VirgilOffice />
                  </ProtectedRoute>
                } />
                <Route path="/virgil-modes" element={
                  <ProtectedRoute requireAuth={true} requireDNA={true}>
                    <VirgilModes />
                  </ProtectedRoute>
                } />
                <Route path="/virgil-chat" element={
                  <ProtectedRoute requireAuth={true} requireDNA={true}>
                    <VirgilChat />
                  </ProtectedRoute>
                } />
                <Route path="/favorites-shelf" element={
                  <ProtectedRoute requireAuth={true} requireDNA={true}>
                    <FavoritesShelf />
                  </ProtectedRoute>
                } />
                <Route path="/classroom" element={
                  <ProtectedRoute requireAuth={true} requireDNA={true}>
                    <Classroom />
                  </ProtectedRoute>
                } />
                <Route path="/intellectual-dna-course" element={
                  <ProtectedRoute requireAuth={true} requireDNA={true}>
                    <IntellectualDNACourse />
                  </ProtectedRoute>
                } />
                <Route path="/intellectual-dna-exam" element={
                  <ProtectedRoute requireAuth={true} requireDNA={true}>
                    <IntellectualDNAExam />
                  </ProtectedRoute>
                } />
                <Route path="/classroom-virgil-chat" element={
                  <ProtectedRoute requireAuth={true} requireDNA={true}>
                    <ClassroomVirgilChat />
                  </ProtectedRoute>
                } />
                <Route path="/exam-room" element={
                  <ProtectedRoute requireAuth={true} requireDNA={true}>
                    <ExamRoom />
                  </ProtectedRoute>
                } />
                <Route path="/exam-welcome" element={
                  <ProtectedRoute requireAuth={true} requireDNA={true}>
                    <ExamWelcome />
                  </ProtectedRoute>
                } />
                <Route path="/exam-virgil-chat" element={
                  <ProtectedRoute requireAuth={true} requireDNA={true}>
                    <ExamVirgilChat />
                  </ProtectedRoute>
                } />
                <Route path="/bookshelf" element={
                  <ProtectedRoute requireAuth={true} requireDNA={true}>
                    <NewBookshelf />
                  </ProtectedRoute>
                } />
                <Route path="/intellectual-dna" element={
                  <ProtectedRoute requireAuth={true} requireDNA={true}>
                    <IntellectualDNAShelf />
                  </ProtectedRoute>
                } />
                <Route path="/home-old" element={
                  <ProtectedRoute requireAuth={true} requireDNA={true}>
                    <Home />
                  </ProtectedRoute>
                } />
                <Route path="/great-questions" element={
                  <ProtectedRoute requireAuth={true} requireDNA={true}>
                    <GreatQuestions />
                  </ProtectedRoute>
                } />
                <Route path="/great-questions/:id" element={
                  <ProtectedRoute requireAuth={true} requireDNA={true}>
                    <GreatQuestions />
                  </ProtectedRoute>
                } />
                
                {/* Redirects */}
                <Route path="/search" element={<Navigate to="/discover/search" replace />} />
                <Route path="/search/icons" element={<Navigate to="/discover/search/icons" replace />} />
                <Route path="/search/concepts" element={<Navigate to="/discover/search/concepts" replace />} />
                <Route path="/search/classics" element={<Navigate to="/discover/search/classics" replace />} />
                <Route path="/search/questions" element={<Navigate to="/discover/search/questions" replace />} />
                
                {/* 404 page or fallback */}
                <Route path="*" element={<Navigate to="/discover" replace />} />
              </Routes>
            </ErrorBoundary>
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
