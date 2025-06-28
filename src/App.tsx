import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Hero from './components/Hero';
import AuthForm from './components/AuthForm';
import ChatInterface from './components/ChatInterface';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 flex items-center justify-center transition-colors duration-300">
        <div className="text-gray-800 dark:text-gray-200 text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/auth" replace />;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 flex items-center justify-center transition-colors duration-300">
        <div className="text-gray-800 dark:text-gray-200 text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  return user ? <Navigate to="/chat" replace /> : <>{children}</>;
};

const HomePage: React.FC = () => {
  const { user } = useAuth();

  const handleGetStarted = () => {
    window.location.href = user ? '/chat' : '/auth';
  };

  return <Hero onGetStarted={handleGetStarted} />;
};

const AuthPage: React.FC = () => {
  const handleAuthSuccess = () => {
    window.location.href = '/chat';
  };

  return <AuthForm onSuccess={handleAuthSuccess} />;
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route
              path="/auth"
              element={
                <PublicRoute>
                  <AuthPage />
                </PublicRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <ChatInterface />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;