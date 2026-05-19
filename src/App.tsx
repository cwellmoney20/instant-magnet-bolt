import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PlanProvider } from './context/PlanContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import DashboardPage from './pages/DashboardPage';
import CreateEventPage from './pages/CreateEventPage';
import EventDetailPage from './pages/EventDetailPage';
import GuestUploadPage from './pages/GuestUploadPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import UpgradePage from './pages/UpgradePage';
import BillingPage from './pages/BillingPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PlanProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/upload/:slug" element={<GuestUploadPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />

            {/* Protected admin routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <DashboardPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/events/create"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <CreateEventPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/events/:id"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <EventDetailPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/upgrade"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <UpgradePage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/billing"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <BillingPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </PlanProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
