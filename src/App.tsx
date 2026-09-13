import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Loader2 } from 'lucide-react';

const Dashboard = lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.Dashboard })));
const Applications = lazy(() => import('./pages/Applications').then((m) => ({ default: m.Applications })));
const ApplicationDetails = lazy(() => import('./pages/ApplicationDetails').then((m) => ({ default: m.ApplicationDetails })));
const KanbanBoard = lazy(() => import('./pages/KanbanBoard').then((m) => ({ default: m.KanbanBoard })));
const Interviews = lazy(() => import('./pages/Interviews').then((m) => ({ default: m.Interviews })));
const Companies = lazy(() => import('./pages/Companies').then((m) => ({ default: m.Companies })));
const Resumes = lazy(() => import('./pages/Resumes').then((m) => ({ default: m.Resumes })));
const InterviewPrep = lazy(() => import('./pages/InterviewPrep').then((m) => ({ default: m.InterviewPrep })));
const Analytics = lazy(() => import('./pages/Analytics').then((m) => ({ default: m.Analytics })));
const Settings = lazy(() => import('./pages/Settings').then((m) => ({ default: m.Settings })));

function PageLoader() {
  return (
    <div className="flex items-center justify-center p-12 text-slate-400">
      <Loader2 className="w-6 h-6 text-indigo-500 animate-spin mr-2" />
      <span className="text-sm font-medium">Loading page...</span>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="applications" element={<Applications />} />
            <Route path="applications/:id" element={<ApplicationDetails />} />
            <Route path="kanban" element={<KanbanBoard />} />
            <Route path="interviews" element={<Interviews />} />
            <Route path="companies" element={<Companies />} />
            <Route path="resumes" element={<Resumes />} />
            <Route path="prep" element={<InterviewPrep />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
