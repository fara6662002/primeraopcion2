import { useState, Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import AuthScreen from '@/components/AuthScreen';
import LicenseScreen from '@/components/LicenseScreen';
import Navbar, { type Page } from '@/components/Navbar';
import Dashboard from '@/components/Dashboard';
import SimulacroModule from '@/components/SimulacroModule';
import ResultsScreen from '@/components/ResultsScreen';
import ProfilePage from '@/components/ProfilePage';
import OfflineBanner from '@/components/OfflineBanner';
import { addResult, updateStreakOnActivity, updateRanking } from '@/lib/store';
import type { Question } from '@/data/questionBank';
import { Loader2 } from 'lucide-react';

const StudyModule = lazy(() => import('@/components/StudyModule'));
const AdminPanel = lazy(() => import('@/components/AdminPanel'));
const TheoryModule = lazy(() => import('@/components/TheoryModule'));
const GlossaryModule = lazy(() => import('@/components/GlossaryModule'));
const MarathonModule = lazy(() => import('@/components/MarathonModule'));
const ErrorBankModule = lazy(() => import('@/components/ErrorBankModule'));
const CertaintyDashboard = lazy(() => import('@/components/CertaintyDashboard'));

type ExamResultState = {
  correctAnswers: number;
  totalQuestions: number;
  durationSeconds: number;
  answers: (number | null)[];
  questions: Question[];
};

function LazyFallback() {
  return (
    <div className="flex justify-center py-20">
      <Loader2 className="w-8 h-8 text-academic-600 animate-spin" />
    </div>
  );
}

function AppContent() {
  const { user, isAdmin, loading, licenseStatus } = useAuth();
  const [page, setPage] = useState<Page>('dashboard');
  const [examResult, setExamResult] = useState<ExamResultState | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-academic-600 animate-spin" />
      </div>
    );
  }

  if (licenseStatus) {
    return <LicenseScreen reason={licenseStatus} />;
  }

  if (!user && !isAdmin) {
    return <AuthScreen />;
  }

  if (isAdmin) {
    return (
      <Suspense fallback={<LazyFallback />}>
        <AdminPanel />
      </Suspense>
    );
  }

  const handleExamFinish = (result: ExamResultState) => {
    const { correctAnswers, totalQuestions, durationSeconds, questions, answers } = result;
    const percentage = (correctAnswers / totalQuestions) * 100;

    const breakdownMap: Record<string, { subject: string; total: number; correct: number }> = {};
    questions.forEach((q, i) => {
      const subject = q.subject;
      if (!breakdownMap[subject]) breakdownMap[subject] = { subject, total: 0, correct: 0 };
      breakdownMap[subject].total++;
      if (answers[i] === q.correctIndex) breakdownMap[subject].correct++;
    });
    const subjectBreakdown = Object.values(breakdownMap);

    if (user) {
      addResult({ userId: user.id, totalQuestions, correctAnswers, percentage, durationSeconds, subjectBreakdown }).catch(() => {});
      updateStreakOnActivity(user.id).catch(() => {});
      updateRanking(user.id, user.full_name, percentage).catch(() => {});
    }

    setExamResult(result);
  };

  if (examResult) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
        <OfflineBanner />
        <Navbar current={'dashboard'} onNavigate={() => { setExamResult(null); setPage('dashboard'); }} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ResultsScreen
            result={examResult}
            onRetry={() => { setExamResult(null); setPage('simulacro'); }}
            onHome={() => { setExamResult(null); setPage('dashboard'); }}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      <OfflineBanner />
      <Navbar current={page} onNavigate={setPage} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {page === 'dashboard' && <Dashboard onNavigate={setPage} />}
        {page === 'study' && <Suspense fallback={<LazyFallback />}><StudyModule /></Suspense>}
        {page === 'simulacro' && <SimulacroModule onFinish={handleExamFinish} />}
        {page === 'marathon' && <Suspense fallback={<LazyFallback />}><MarathonModule /></Suspense>}
        {page === 'errorbank' && <Suspense fallback={<LazyFallback />}><ErrorBankModule /></Suspense>}
        {page === 'certainty' && <Suspense fallback={<LazyFallback />}><CertaintyDashboard /></Suspense>}
        {page === 'theory' && <Suspense fallback={<LazyFallback />}><TheoryModule /></Suspense>}
        {page === 'glossary' && <Suspense fallback={<LazyFallback />}><GlossaryModule /></Suspense>}
        {page === 'profile' && <ProfilePage />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
