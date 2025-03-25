import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import Index from '@/pages/Index';
import IntellectualDNA from '@/pages/dna/IntellectualDNA';
import DNAPriming from '@/pages/dna/DNAPriming';
import DNAAssessment from '@/pages/dna/DNAAssessment';
import DNAEmailConfirmationScreen from '@/pages/dna/DNAEmailConfirmationScreen';
import DNACompletionScreen from '@/pages/dna/DNACompletionScreen';
import Bookshelf from '@/pages/Bookshelf';
import Reader from '@/pages/Reader';
import DiscoverLayout from '@/layouts/DiscoverLayout';
import GreatQuestions from '@/pages/GreatQuestions';
import Dashboard from '@/pages/Dashboard';
import DomainDetail from '@/pages/DomainDetail';
import Profile from '@/pages/Profile';
import ClassicsFeedPage from '@/pages/ClassicsFeedPage';
import ConceptsFeedPage from '@/pages/ConceptsFeedPage';
import IconsFeedPage from '@/pages/IconsFeedPage';
import AllBooks from '@/pages/AllBooks';
import AllIcons from '@/pages/AllIcons';
import SearchPage from '@/pages/SearchPage';
import VirgilOffice from '@/pages/virgil/VirgilOffice';
import VirgilWelcome from '@/pages/virgil/VirgilWelcome';
import VirgilChat from '@/pages/virgil/VirgilChat';
import VirgilModes from '@/pages/virgil/VirgilModes';
import BecomeWhoYouAre from '@/pages/virgil/BecomeWhoYouAre';
import { OutsetaProvider } from '@/contexts/OutsetaAuthContext';

function App() {
  const [isMounted, setIsMounted] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <OutsetaProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <Routes>
          {/* Home page */}
          <Route path="/" element={<Index />} />

          {/* DNA routes */}
          <Route path="/dna" element={<IntellectualDNA />} />
          <Route path="/dna/priming" element={<DNAPriming />} />
          <Route path="/dna/assessment/:category?" element={<DNAAssessment />} />
          <Route path="/dna/email-confirmation" element={<DNAEmailConfirmationScreen />} />
          <Route path="/dna/complete" element={<DNACompletionScreen />} />

          {/* Bookshelf routes */}
          <Route path="/bookshelf" element={<Bookshelf />} />
          <Route path="/read/:id" element={<Reader />} />

          {/* Discover routes */}
          <Route path="/discover" element={<DiscoverLayout initialTab="for-you" />} />
          <Route path="/discover/classics/:index?" element={<DiscoverLayout initialTab="classics" />} />
          <Route path="/discover/questions/:index?" element={<DiscoverLayout initialTab="questions" />} />
          <Route path="/discover/concepts/:index?" element={<DiscoverLayout initialTab="concepts" />} />
          <Route path="/discover/icons/:index?" element={<DiscoverLayout initialTab="icons" />} />

          {/* Detailed view routes */}
          <Route path="/view/:type/:slug" element={<DiscoverLayout initialTab="for-you" detailedView />} />
          
          {/* Great Questions page */}
          <Route path="/great-questions" element={<GreatQuestions />} />
          <Route path="/great-questions/:id" element={<GreatQuestions />} />

          {/* Dashboard routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/domain/:id" element={<DomainDetail />} />
          <Route path="/profile" element={<Profile />} />

          {/* Feed pages */}
          <Route path="/classics" element={<ClassicsFeedPage />} />
          <Route path="/concepts" element={<ConceptsFeedPage />} />
          <Route path="/icons" element={<IconsFeedPage />} />
          <Route path="/all-books" element={<AllBooks />} />
          <Route path="/all-icons" element={<AllIcons />} />

          {/* Search page */}
          <Route path="/search" element={<SearchPage />} />

          {/* Virgil chat */}
          <Route path="/virgil" element={<VirgilOffice />} />
          <Route path="/virgil/welcome" element={<VirgilWelcome />} />
          <Route path="/virgil/chat" element={<VirgilChat />} />
          <Route path="/virgil/modes" element={<VirgilModes />} />
          <Route path="/become-who-you-are" element={<BecomeWhoYouAre />} />

          {/* Catch all for unknown paths */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </ThemeProvider>
    </OutsetaProvider>
  );
}

export default App;
