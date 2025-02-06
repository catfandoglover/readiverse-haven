import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import Home from "./components/Home";
import Bookshelf from "./components/Bookshelf";
import Reader from "./components/Reader";
import { ErrorBoundary } from "./components/ErrorBoundary";

const queryClient = new QueryClient();

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <Router>
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/bookshelf" element={<Bookshelf />} />
              <Route path="/reader" element={<Reader metadata={{ coverUrl: '', title: '', author: '' }} />} />
            </Routes>
          </ErrorBoundary>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;