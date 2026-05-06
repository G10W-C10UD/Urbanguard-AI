// App root — defines all routes and wraps with auth/asset context providers
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { AssetProvider } from './context/AssetContext.jsx';
import Landing from './pages/Landing.jsx';
import AdminLayout from './pages/admin/AdminLayout.jsx';
import ComplaintForm from './pages/citizen/ComplaintForm.jsx';
import ContractorDashboard from './pages/contractor/ContractorDashboard.jsx';
import JobBoard from './pages/contractor/JobBoard.jsx';
import MyJobs from './pages/contractor/MyJobs.jsx';
import Earnings from './pages/contractor/Earnings.jsx';

// Protected route wrapper
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <AssetProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/complaint" element={<ComplaintForm />} />
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/contractor"
            element={
              <ProtectedRoute allowedRoles={['contractor']}>
                <ContractorDashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="jobs" replace />} />
            <Route path="jobs" element={<JobBoard />} />
            <Route path="my-jobs" element={<MyJobs />} />
            <Route path="earnings" element={<Earnings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AssetProvider>
    </AuthProvider>
  );
}
