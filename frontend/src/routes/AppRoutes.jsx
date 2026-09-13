import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

// Public Pages (eager — critical path for first paint)
import Home from '../pages/Home';
import About from '../pages/About';
import Journey from '../pages/Journey';
import Guidelines from '../pages/Guidelines';
import Prizes from '../pages/Prizes';
import Leaderboard from '../pages/Leaderboard';
import Innovations from '../pages/Innovations';

// Auth Pages — Login is eager (common entry); registrations are lazy
import Login from '../pages/auth/Login';
const RegisterSchool = lazy(() => import('../pages/auth/RegisterSchool'));
const RegisterEvaluator = lazy(() => import('../pages/auth/RegisterEvaluator'));
const RegisterStudent = lazy(() => import('../pages/auth/RegisterStudent'));

// Dashboards (lazy — only loaded when authenticated user navigates)
const SchoolDashboard = lazy(() => import('../pages/dashboard/SchoolDashboard'));
const StudentDashboard = lazy(() => import('../pages/dashboard/StudentDashboard'));
const EvaluatorDashboard = lazy(() => import('../pages/dashboard/EvaluatorDashboard'));
const JuryDashboard = lazy(() => import('../pages/dashboard/JuryDashboard'));
const StateJuryDashboard = lazy(() => import('../pages/dashboard/StateJuryDashboard'));
const AdminDashboard = lazy(() => import('../pages/dashboard/AdminDashboard'));
const MentorDashboard = lazy(() => import('../pages/dashboard/MentorDashboard'));
const DistrictDashboard = lazy(() => import('../pages/dashboard/DistrictDashboard'));

// Guard & Errors
import ProtectedRoute from '../components/auth/ProtectedRoute';
import NotFound from '../pages/NotFound';
import Forbidden from '../pages/Forbidden';

// Loading fallback consistent with app design
const LazyFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#faf8f5]">
    <div className="flex flex-col items-center gap-3">
      <Loader2 className="w-8 h-8 text-emerald-700 animate-spin" />
      <span className="text-xs font-semibold text-slate-500 tracking-wide uppercase">Loading…</span>
    </div>
  </div>
);

const AppRoutes = () => {
  return (
    <Suspense fallback={<LazyFallback />}>
      <Routes>
        {/* Public Navigation */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/journey" element={<Journey />} />
        <Route path="/guidelines" element={<Guidelines />} />
        <Route path="/prizes" element={<Prizes />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/innovations" element={<Innovations />} />

        {/* Authentication */}
        <Route path="/login" element={<Navigate to="/login/school" replace />} />
        <Route path="/login/:role" element={<Login />} />
        <Route path="/register/school" element={<RegisterSchool />} />
        <Route path="/register/evaluator" element={<RegisterEvaluator />} />
        <Route path="/register/student" element={<RegisterStudent />} />

        {/* Protected Role Dashboards */}
        <Route
          path="/school/dashboard"
          element={
            <ProtectedRoute allowedRoles={['school', 'admin']}>
              <SchoolDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute allowedRoles={['student', 'admin']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mentor/dashboard"
          element={
            <ProtectedRoute allowedRoles={['mentor', 'admin']}>
              <MentorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/district/dashboard"
          element={
            <ProtectedRoute allowedRoles={['district', 'admin']}>
              <DistrictDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/evaluator/dashboard"
          element={
            <ProtectedRoute allowedRoles={['evaluator', 'admin']}>
              <EvaluatorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jury/dashboard"
          element={
            <ProtectedRoute allowedRoles={['jury', 'admin']}>
              <JuryDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/state-jury/dashboard"
          element={
            <ProtectedRoute allowedRoles={['state_jury', 'admin']}>
              <StateJuryDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Error Routes */}
        <Route path="/403" element={<Forbidden />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
