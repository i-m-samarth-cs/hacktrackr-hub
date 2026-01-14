import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Lazy load pages for code splitting
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Hackathons = lazy(() => import("./pages/Hackathons"));
const Quizzes = lazy(() => import("./pages/Quizzes"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const Certificates = lazy(() => import("./pages/Certificates"));
const CalendarPage = lazy(() => import("./pages/Calendar"));
const Settings = lazy(() => import("./pages/Settings"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/hackathons" element={<Hackathons />} />
            <Route path="/quizzes" element={<Quizzes />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/certificates" element={<Certificates />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
