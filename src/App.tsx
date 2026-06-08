import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Toaster } from "@/components/ui/toaster";
import { ActiveWorkoutPage } from "@/pages/ActiveWorkoutPage";
import { BuilderPage } from "@/pages/BuilderPage";
import { HistoryPage } from "@/pages/HistoryPage";
import { HomePage } from "@/pages/HomePage";
import { BenchmarksPage } from "@/pages/BenchmarksPage";
import { LandingPage } from "@/pages/LandingPage";
import { ProgramsPage } from "@/pages/ProgramsPage";
import { CoachingPage } from "@/pages/CoachingPage";
import { CalculatorsPage } from "@/pages/CalculatorsPage";
import { LibraryPage } from "@/pages/LibraryPage";
import { NutritionPage } from "@/pages/NutritionPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { AssessmentsPage } from "@/pages/AssessmentsPage";
import { AboutPage } from "@/pages/AboutPage";
import { FeedbackPage } from "@/pages/FeedbackPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public marketing / sales funnel (no app sidebar) - drives revenue */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/programs" element={<ProgramsPage />} />
        <Route path="/coaching" element={<CoachingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/calculators" element={<CalculatorsPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />

        {/* Core Tools / Tracker App (sidebar layout) — the free + premium heart of the business */}
        <Route element={<AppLayout />}>
          <Route path="/log" element={<HomePage />} />
          <Route path="/benchmarks" element={<BenchmarksPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/nutrition" element={<NutritionPage />} />
          <Route path="/builder" element={<BuilderPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/active" element={<ActiveWorkoutPage />} />
          <Route path="/calculators" element={<CalculatorsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/assessments" element={<AssessmentsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
