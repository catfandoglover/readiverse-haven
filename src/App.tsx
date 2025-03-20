import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorScreen from '@/pages/ErrorScreen';
import Discover from '@/pages/Discover';
import IntellectualDNA from '@/pages/IntellectualDNA';
import DNAPriming from '@/pages/DNAPriming';
import DNAAssessment from '@/pages/DNAAssessment';
import DNACompletionScreen from '@/pages/DNACompletionScreen';
import DNAEmailConfirmationScreen from '@/pages/DNAEmailConfirmationScreen';
import DNAWelcomeScreen from '@/pages/DNAWelcomeScreen';
import VirgilWelcome from '@/pages/VirgilWelcome';
import VirgilOffice from '@/pages/VirgilOffice';
import Bookshelf from '@/pages/Bookshelf';
import BookDetails from '@/pages/BookDetails';
import Dashboard from '@/pages/Dashboard';
import { AuthProvider } from '@/contexts/OutsetaAuthContext';

function App() {
  return (
    <Router>
      <div className="App relative">
        <ErrorBoundary fallback={<ErrorScreen />}>
          <AuthProvider>
            <Routes>
              {/* Core Routes */}
              <Route path="/" element={<Discover />} />
              <Route path="/discover" element={<Discover />} />
              <Route path="/bookshelf" element={<Bookshelf />} />
              <Route path="/bookshelf/view/:bookId" element={<BookDetails />} />
              <Route path="/dashboard" element={<Dashboard />} />
              
              {/* DNA Assessment Routes */}
              <Route path="/dna" element={<IntellectualDNA />} />
              <Route path="/dna/priming" element={<DNAPriming />} />
              <Route path="/dna/assessment" element={<DNAAssessment />} />
              <Route path="/dna/assessment/:category" element={<DNAAssessment />} />
              <Route path="/dna/completion" element={<DNACompletionScreen />} />
              <Route path="/dna/confirm-email" element={<DNAEmailConfirmationScreen />} />
              <Route path="/dna/welcome" element={<DNAWelcomeScreen />} />
              
              {/* Virgil Routes */}
              <Route path="/virgil/welcome" element={<VirgilWelcome />} />
              <Route path="/virgil/office" element={<VirgilOffice />} />
            </Routes>
          </AuthProvider>
        </ErrorBoundary>
        <Toaster position="top-center" />
      </div>
    </Router>
  );
}

export default App;
