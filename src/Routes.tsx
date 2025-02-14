
import { Routes as RouterRoutes, Route } from 'react-router-dom';
import Index from '@/pages/Index';
import GreatQuestions from '@/pages/GreatQuestions';
import DNAAssessment from '@/pages/DNAAssessment';
import AllBooks from '@/pages/AllBooks';
import AllIcons from '@/pages/AllIcons';
import IntellectualDNA from '@/pages/IntellectualDNA';

const Routes = () => {
  return (
    <RouterRoutes>
      <Route path="/" element={<Index />} />
      <Route path="/books/:bookSlug" element={<Index />} />
      <Route path="/questions" element={<GreatQuestions />} />
      <Route path="/dna-assessment" element={<DNAAssessment />} />
      <Route path="/books" element={<AllBooks />} />
      <Route path="/icons" element={<AllIcons />} />
      <Route path="/intellectual-dna" element={<IntellectualDNA />} />
    </RouterRoutes>
  );
};

export default Routes;
