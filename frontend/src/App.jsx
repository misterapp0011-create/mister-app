import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';

import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

import ContractorDashboard from './pages/contractor/ContractorDashboard.jsx';
import ContractorOnboarding from './pages/contractor/ContractorOnboarding.jsx';
import CustomerDashboard from './pages/customer/CustomerDashboard.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <LandingPage />;
  return <Navigate to={`/${user.role}`} replace />;
}

export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomeRedirect />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route element={<ProtectedRoute roles={['contractor']} />}>
              <Route path="/contractor" element={<ContractorDashboard />} />
              <Route path="/contractor/onboarding" element={<ContractorOnboarding />} />
            </Route>

            <Route element={<ProtectedRoute roles={['customer']} />}>
              <Route path="/customer" element={<CustomerDashboard />} />
            </Route>

            <Route element={<ProtectedRoute roles={['admin']} />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
