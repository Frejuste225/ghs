import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Services from './pages/Services';
import Requests from './pages/Requests';
import Validation from './pages/Validation';
import Reports from './pages/Reports';
import Accounts from './pages/Accounts';
import './App.css';

// Configuration React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Composant pour protéger les routes
const ProtectedRoute = ({ children, requiredPermissions }) => {
  const { isAuthenticated, hasPermission, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredPermissions && !hasPermission(requiredPermissions)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Accès refusé</h2>
          <p className="text-gray-600">Vous n'avez pas les permissions nécessaires.</p>
        </div>
      </div>
    );
  }

  return children;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="requests" element={<Requests />} />
                <Route 
                  path="employees" 
                  element={
                    <ProtectedRoute requiredPermissions={['Administrator', 'Supervisor']}>
                      <Employees />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="services" 
                  element={
                    <ProtectedRoute requiredPermissions={['Administrator', 'Supervisor']}>
                      <Services />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="validation" 
                  element={
                    <ProtectedRoute requiredPermissions={['Administrator', 'Supervisor', 'Coordinator']}>
                      <Validation />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="reports" 
                  element={
                    <ProtectedRoute requiredPermissions={['Administrator', 'Supervisor']}>
                      <Reports />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="accounts" 
                  element={
                    <ProtectedRoute requiredPermissions={['Administrator']}>
                      <Accounts />
                    </ProtectedRoute>
                  } 
                />
              </Route>
            </Routes>
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
