import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { UIProvider } from '@/context/UIContext';
import { motion, AnimatePresence } from 'framer-motion';
import { LoadingScreen } from '@/components/loading/LoadingScreen';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoginPage } from '@/pages/LoginPage';
import { AxiosTokenInjector } from '@/components/AxiosTokenInjector';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { EmissionFactorsPage } from '@/pages/environmental/EmissionFactorsPage';
import { CarbonTransactionsPage } from '@/pages/environmental/CarbonTransactionsPage';
import { EnvironmentalGoalsPage } from '@/pages/environmental/EnvironmentalGoalsPage';
import { EnvironmentalDashboardPage } from '@/pages/environmental/EnvironmentalDashboardPage';
import { CSRActivitiesPage } from '@/pages/social/CSRActivitiesPage';
import { ParticipationQueuePage } from '@/pages/social/ParticipationQueuePage';
import { DiversityPage } from '@/pages/social/DiversityPage';
import { TrainingPage } from '@/pages/social/TrainingPage';
import { PoliciesPage } from '@/pages/governance/PoliciesPage';
import { AcknowledgementsPage } from '@/pages/governance/AcknowledgementsPage';
import { AuditsPage } from '@/pages/governance/AuditsPage';
import { ComplianceIssuesPage } from '@/pages/governance/ComplianceIssuesPage';
import { ChallengesPage } from '@/pages/gamification/ChallengesPage';
import { ChallengeDetailPage } from '@/pages/gamification/ChallengeDetailPage';
import { BadgesPage } from '@/pages/gamification/BadgesPage';
import { RewardsPage } from '@/pages/gamification/RewardsPage';
import { LeaderboardPage } from '@/pages/gamification/LeaderboardPage';
import { ReportsPage } from '@/pages/reports/ReportsPage';
import { ReportBuilderPage } from '@/pages/reports/ReportBuilderPage';
import { DepartmentsPage } from '@/pages/settings/DepartmentsPage';
import { CategoriesPage } from '@/pages/settings/CategoriesPage';
import { ESGConfigPage } from '@/pages/settings/ESGConfigPage';
import { NotificationsPage } from '@/pages/settings/NotificationsPage';
import { ProfilePage } from '@/pages/ProfilePage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30000, refetchOnWindowFocus: false, retry: 1 },
  },
});

function ProtectedRoutes() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <AppLayout />;
}

function App() {
  const [showLoading, setShowLoading] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AxiosTokenInjector />
        <UIProvider>
          <AnimatePresence mode="wait">
            {showLoading ? (
              <LoadingScreen key="loader" onComplete={() => setShowLoading(false)} />
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                 className="w-full h-full min-h-screen bg-eco-gradient"
              >
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route element={<ProtectedRoutes />}>
                    <Route path="/dashboard" element={<DashboardPage />} />

                    <Route path="/environmental/emission-factors" element={<EmissionFactorsPage />} />
                    <Route path="/environmental/transactions" element={<CarbonTransactionsPage />} />
                    <Route path="/environmental/goals" element={<EnvironmentalGoalsPage />} />
                    <Route path="/environmental/dashboard" element={<EnvironmentalDashboardPage />} />

                    <Route path="/social/csr-activities" element={<CSRActivitiesPage />} />
                    <Route path="/social/participation" element={<ParticipationQueuePage />} />
                    <Route path="/social/diversity" element={<DiversityPage />} />
                    <Route path="/social/training" element={<TrainingPage />} />

                    <Route path="/governance/policies" element={<PoliciesPage />} />
                    <Route path="/governance/acknowledgements" element={<AcknowledgementsPage />} />
                    <Route path="/governance/audits" element={<AuditsPage />} />
                    <Route path="/governance/compliance-issues" element={<ComplianceIssuesPage />} />

                    <Route path="/gamification/challenges" element={<ChallengesPage />} />
                    <Route path="/gamification/challenges/:id" element={<ChallengeDetailPage />} />
                    <Route path="/gamification/badges" element={<BadgesPage />} />
                    <Route path="/gamification/rewards" element={<RewardsPage />} />
                    <Route path="/gamification/leaderboard" element={<LeaderboardPage />} />

                    <Route path="/reports" element={<ReportsPage />} />
                    <Route path="/reports/builder" element={<ReportBuilderPage />} />

                    <Route path="/settings/departments" element={<DepartmentsPage />} />
                    <Route path="/settings/categories" element={<CategoriesPage />} />
                    <Route path="/settings/esg-config" element={<ESGConfigPage />} />
                    <Route path="/settings/notifications" element={<NotificationsPage />} />

                    <Route path="/profile" element={<ProfilePage />} />
                  </Route>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </motion.div>
            )}
          </AnimatePresence>
        </UIProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
