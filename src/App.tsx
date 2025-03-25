
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import AllBooks from "./pages/AllBooks";
import { Reader } from "./components/Reader";
import VirgilChat from "./pages/VirgilChat";
import DNAAssessment from "./pages/DNAAssessment";
import DNAPriming from "./pages/DNAPriming";
import DNACompletionScreen from "./pages/DNACompletionScreen";
import DNAEmailConfirmationScreen from "./pages/DNAEmailConfirmationScreen";
import IntellectualDNA from "./pages/IntellectualDNA";
import VirgilWelcome from "./pages/VirgilWelcome";
import VirgilOffice from "./pages/VirgilOffice";
import SearchPage from "./pages/SearchPage";
import DomainDetail from "./pages/DomainDetail";
import AllIcons from "./pages/AllIcons";
import GreatQuestions from "./pages/GreatQuestions";
import VirgilModes from "./pages/VirgilModes";
import BecomeWhoYouAre from "./pages/BecomeWhoYouAre";
import ClassicsFeedPage from "./pages/ClassicsFeedPage";
import IconsFeedPage from "./pages/IconsFeedPage";
import ConceptsFeedPage from "./pages/ConceptsFeedPage";
import { ErrorBoundary } from "./components/ErrorBoundary";

const App = () => {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/bookshelf" element={<AllBooks />} />
          <Route path="/read/:id" element={<Reader />} />
          <Route path="/virgil" element={<VirgilChat />} />
          <Route path="/virgil/welcome" element={<VirgilWelcome />} />
          <Route path="/virgil/office" element={<VirgilOffice />} />
          <Route path="/virgil/dna-test" element={<DNAAssessment />} />
          <Route path="/virgil/modes" element={<VirgilModes />} />
          <Route path="/dna-priming" element={<DNAPriming />} />
          <Route path="/dna-completed" element={<DNACompletionScreen />} />
          <Route path="/dna-email-confirmation" element={<DNAEmailConfirmationScreen />} />
          <Route path="/dna" element={<IntellectualDNA />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/domain/:id" element={<DomainDetail />} />
          <Route path="/icons" element={<AllIcons />} />
          <Route path="/great-questions" element={<GreatQuestions />} />
          <Route path="/great-questions/:id" element={<GreatQuestions />} />
          <Route path="/become-who-you-are" element={<BecomeWhoYouAre />} />
          <Route path="/classics" element={<ClassicsFeedPage />} />
          <Route path="/icons-feed" element={<IconsFeedPage />} />
          <Route path="/concepts-feed" element={<ConceptsFeedPage />} />
          <Route path="/discover/*" element={<Index />} />
          <Route path="/view/:type/:slug" element={<Index />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
};

export default App;
