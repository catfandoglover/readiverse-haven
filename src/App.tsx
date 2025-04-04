import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate, useNavigate, useParams } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider, useAuth } from "@/contexts/SupabaseAuthContext";
import { ProfileDataProvider } from "@/contexts/ProfileDataContext";
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
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AuthCallback from "./pages/AuthCallback";
import { LoginButtons } from "@/components/auth/LoginButtons";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useEffect } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const RootRedirect: React.FC = () => {
  const { user, hasCompletedDNA } = useAuth();
  
  if (user && hasCompletedDNA) {
    return <Navigate to="/virgil" replace />;
  }
  
  return <Navigate to="/dna" replace />;
};

const DnaRouteHandler: React.FC = () => {
  const { user, hasCompletedDNA } = useAuth();
  
  if (user && hasCompletedDNA) {
    return <Navigate to="/virgil" replace />;
  }
  
  return <IntellectualDNA />;
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

const IconRedirect = ({ id }: { id: string }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { supabase } = useAuth();

  useEffect(() => {
    const fetchSlug = async () => {
      const { data, error } = await supabase
        .from('icons')
        .select('slug')
        .eq('id', id)
        .single();

      if (error || !data?.slug) {
        console.error('Error fetching icon slug:', error);
        navigate('/discover', { replace: true });
        return;
      }

      navigate(`/icons/${data.slug}`, { 
        replace: true,
        state: location.state
      });
    };

    fetchSlug();
  }, [id, navigate, supabase, location.state]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <ProfileDataProvider>
          <ThemeProvider>
            <TooltipProvider>
              <ErrorBoundary>
                <Toaster />
                <Sonner />
                <Routes>
                  <Route path="/" element={<RootRedirect />} />
                  <Route path="/discover" element={
                    <ProtectedRoute requireAuth={false} requireDNA={false}>
                      <DiscoverLayout />
                    </ProtectedRoute>
                  } /> 
                  <Route path="/view/:type/:slug" element={
                    <ProtectedRoute requireAuth={false} requireDNA={false}>
                      <DiscoverLayout />
                    </ProtectedRoute>
                  } />
                  <Route path="/discover/questions" element={
                    <ProtectedRoute requireAuth={false} requireDNA={false}>
                      <DiscoverLayout />
                    </ProtectedRoute>
                  } />
                  <Route path="/discover/questions/:index" element={
                    <ProtectedRoute requireAuth={false} requireDNA={false}>
                      <DiscoverLayout />
                    </ProtectedRoute>
                  } />
                  <Route path="/discover/search" element={<SearchPage />} /> 
                  <Route path="/discover/search/icons" element={<IconsFeedPage />} />
                  <Route path="/discover/search/concepts" element={<ConceptsFeedPage />} />
                  <Route path="/discover/search/classics" element={<ClassicsFeedPage />} />
                  <Route path="/discover/search/questions" element={<GreatQuestions />} />
                  <Route path="/view/icon/:id" element={<IconRedirect id={useParams().id || ''} />} />
                  <Route path="/view/classic/:id" element={
                    <Navigate to="/texts/:id" replace />
                  } />
                  <Route path="/icons/:slug" element={
                    <ProtectedRoute requireAuth={false} requireDNA={false}>
                      <DiscoverLayout />
                    </ProtectedRoute>
                  } />
                  <Route path="/concepts/:slug" element={
                    <ProtectedRoute requireAuth={false} requireDNA={false}>
                      <DiscoverLayout />
                    </ProtectedRoute>
                  } />
                  <Route path="/texts/:slug" element={
                    <ProtectedRoute requireAuth={false} requireDNA={false}>
                      <DiscoverLayout />
                    </ProtectedRoute>
                  } />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  <Route path="/profile/share/:name" element={<ShareableProfile />} />
                  <Route path="/share-badge/:domainId/:resourceId" element={<ShareBadgePage />} />
                  <Route path="/share-badge/:domainId/:resourceId/:userName" element={<ShareBadgePage />} />
                  <Route path="/badge/:domainId/:resourceId" element={<ShareBadgePage />} />
                  <Route path="/badge/:domainId/:resourceId/:userName" element={<ShareBadgePage />} />
                  <Route path="/dna" element={<DnaRouteHandler />} />
                  <Route path="/dna/completion" element={<DNACompletionScreen />} />
                  <Route path="/book-counselor" element={<BookCounselor />} />
                  <Route path="/booking-success" element={<BookingSuccess />} />
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
                    <ProtectedRoute requireAuth={true} requireDNA={false}>
                      <VirgilOffice />
                    </ProtectedRoute>
                  } />
                  <Route path="/virgil-modes" element={
                    <ProtectedRoute requireAuth={true} requireDNA={false}>
                      <VirgilModes />
                    </ProtectedRoute>
                  } />
                  <Route path="/virgil-chat" element={
                    <ProtectedRoute requireAuth={true} requireDNA={false}>
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
                    <ProtectedRoute requireAuth={true} requireDNA={false}>
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
                    <ProtectedRoute requireAuth={false} requireDNA={false}>
                      <GreatQuestions />
                    </ProtectedRoute>
                  } />
                  <Route path="/great-questions/:id" element={
                    <ProtectedRoute requireAuth={true} requireDNA={true}>
                      <GreatQuestions />
                    </ProtectedRoute>
                  } />
                  <Route path="/search" element={<Navigate to="/discover/search" replace />} />
                  <Route path="/search/icons" element={<Navigate to="/discover/search/icons" replace />} />
                  <Route path="/search/concepts" element={<Navigate to="/discover/search/concepts" replace />} />
                  <Route path="/search/classics" element={<Navigate to="/discover/search/classics" replace />} />
                  <Route path="/search/questions" element={<Navigate to="/discover/search/questions" replace />} />
                  <Route path="/:slug" element={
                    <ProtectedRoute requireAuth={false} requireDNA={false}>
                      <DiscoverLayout />
                    </ProtectedRoute>
                  } />
                </Routes>
              </ErrorBoundary>
            </TooltipProvider>
          </ThemeProvider>
        </ProfileDataProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
