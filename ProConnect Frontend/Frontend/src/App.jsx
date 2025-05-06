import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './components/context/AuthContext';
import HomePage from './components/HomePage/HomePage';
import ClientLogin from './components/ClientLogin/ClientLogin';
import FreelancerLogin from './components/FreelancerLogin/FreelancerLogin';
import ClientSignup from './components/ClientSignup/ClientSignup';
import FreelancerSignup from './components/FreelancerSignup/FreelancerSignup';
import LoginSelection from './components/LoginSelection/LoginSelection';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Navbar from './components/Navbar/Navbar';
import './App.css';
import Contact from './components/Contact/Contact';
import AboutUs from './components/AboutUs/AboutUs';
import ClientDashboard from './components/Client-Dashboard/Client-Dashboard';
import FreelancerDashboard from './components/FreelancerDashboard/FreelancerDashboard';
import { AuthProvider } from './components/context/AuthContext';
import Footer from './components/Footer/Footer';

// Protected Route Component
const ProtectedRoute = ({ children, allowedUserType }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login-selection" replace />;
  }

  if (allowedUserType && user.userType !== allowedUserType) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Public Route Component
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<Contact />} />

        {/* Auth Routes - Accessible only when not logged in */}
        <Route path="/login-selection" element={
          <PublicRoute>
            <LoginSelection />
          </PublicRoute>
        } />

        <Route path="/client-login" element={
          <PublicRoute>
            <ClientLogin />
          </PublicRoute>
        } />

        <Route path="/freelancer-login" element={
          <PublicRoute>
            <FreelancerLogin />
          </PublicRoute>
        } />

        <Route path="/client-signup" element={
          <PublicRoute>
            <ClientSignup />
          </PublicRoute>
        } />

        <Route path="/freelancer-signup" element={
          <PublicRoute>
            <FreelancerSignup />
          </PublicRoute>
        } />

        {/* Protected Routes - Client Only */}
        <Route path="/client-dashboard" element={
          <ProtectedRoute allowedUserType="client">
            <ClientDashboard />
          </ProtectedRoute>
        } />

        {/* Protected Routes - Freelancer Only */}
        <Route path="/freelancer-dashboard" element={
          <ProtectedRoute allowedUserType="freelancer">
            <FreelancerDashboard />
          </ProtectedRoute>
        } />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
  );
}

function App() {
  return (
      <AuthProvider>
        <GoogleOAuthProvider clientId="your-client-id">
          <Router>
            <div className="app-container">
              <Navbar />
              <main className="main-content">
                <AppRoutes />
              </main>
              <FooterWithCondition />
            </div>
          </Router>
        </GoogleOAuthProvider>
      </AuthProvider>
  );
}

const FooterWithCondition = () => {
  const location = useLocation();
  const showFooterPaths = ['/', '/about', '/contact'];

  return showFooterPaths.includes(location.pathname) ? <Footer /> : null;
};

export default App;