/** @jsxImportSource @emotion/react */
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import { AuthContext, AuthProvider } from './contexts/auth/index';

// Page components
import About from './pages/About';
import AuthCallback from './pages/AuthCallback';
import Dashboard from './pages/Dashboard';
import DocumentsView from './pages/DocumentsView';
import EnhancedHomePage from './pages/EnhancedHome';
import EnhancedLandingPage from './pages/EnhancedNeoDecoLanding';
import InventoryView from './pages/InventoryView';
import Kaboodles from './pages/Kaboodles';
import MediaHub from './pages/MediaHub';
import NotFound from './pages/NotFound';
import ProcessingHub from './pages/ProcessingHub';
import Resources from './pages/Resources';
import Search from './pages/Search';
import Terms from './pages/Terms';
import Upload from './pages/Upload';

// Layout components
import AuthenticatedLayout from './components/layouts/AuthenticatedLayout';
import PublicLayout from './components/layouts/PublicLayout';
import ProtectedRoute from './components/routing/ProtectedRoute';

// Other components
import { css } from '@emotion/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import LoginOverlay from './components/auth/LoginOverlay';
import ClockworkLoadingPage from './components/loading/ClockworkLoadingPage';
import { neoDecorocoBase } from './styles/components/neo-decoroco/base';
import { colors } from './styles/theme/colors';

// Services
import dataApi from './services/api';


function App() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [error, setError] = useState(null);
  const hasInitializedRef = useRef(false);

  // Enhanced loading state management for ClockworkLoadingPage 
  const [authProgress, setAuthProgress] = useState(0); const [authMessage, setAuthMessage] = useState('Initializing your digital sanctuary...');

  // Centralized data fetching for authenticated users with enhanced progress tracking 
    const fetchData = useCallback(async () => {
      try { setAuthMessage('Loading user data...'); setAuthProgress(25);


        const [inventoryResponse, documentsResponse] = await Promise.all([
          dataApi.getInventory(),
          dataApi.getDocuments()
        ]);
        
    setAuthProgress(75);
    setAuthMessage('Synchronizing data...');
    
        if (!inventoryResponse || !documentsResponse) {
          throw new Error('Invalid API response');
        }
    
    setAuthProgress(100);
    setAuthMessage('Setup complete!');
    
      } catch (err) {
        console.error('Fetch data error:', err);
        setError(err.message || 'Error fetching data from backend.');
        setTimeout(() => setError(null), 5000);
    setAuthProgress(0);
    setAuthMessage('Error loading data');
      }
    }, []);

    // Initialize data when user logs in
    useEffect(() => {
      if (user && !hasInitializedRef.current) {
        fetchData();
        hasInitializedRef.current = true;
      } else if (!user) {
        hasInitializedRef.current = false;
                setAuthProgress(0); setAuthMessage('Initializing your digital sanctuary...'); } }, 
                [user, fetchData]);

  // Enhanced authentication loading with sophisticated ClockworkLoadingPage 
  useEffect(() => {
    if (authLoading) {
      return (
        <ClockworkLoadingPage 
          message="Initializing your digital sanctuary..." 
          progress={50} 
          isVisible={true} 
        />
      );
    }
  }, [authLoading]);

    return (
      <Router>
        <Routes>
          {/* Public routes with beautiful landing page layout */}
          <Route path="/" element={
            <PublicLayout>
              {user ? <Navigate to="/dashboard" replace /> : <EnhancedLandingPage />}
              {!user && <LoginOverlay isVisible={!user} />}
            </PublicLayout>
          } />
          
          <Route path="/about" element={
            <PublicLayout>
              <About />
            </PublicLayout>
          } />
          
          <Route path="/resources" element={
            <PublicLayout>
              <Resources />
            </PublicLayout>
          } />
          
          <Route path="/terms" element={
            <PublicLayout>
              <Terms />
            </PublicLayout>
          } />
          
          <Route path="/auth-callback" element={
            <PublicLayout>
              <AuthCallback />
            </PublicLayout>
          } />

          {/* Protected routes with authenticated layout */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <AuthenticatedLayout user={user} error={error}>
                <Dashboard />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />

          <Route path="/home" element={
            <ProtectedRoute>
              <AuthenticatedLayout user={user} error={error}>
                <EnhancedHomePage />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />

          <Route path="/process" element={
            <ProtectedRoute>
              <AuthenticatedLayout user={user} error={error}>
                <ProcessingHub />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />

          <Route path="/inventory" element={
            <ProtectedRoute>
              <AuthenticatedLayout user={user} error={error}>
                <InventoryView />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />

          <Route path="/documents" element={
            <ProtectedRoute>
              <AuthenticatedLayout user={user} error={error}>
                <DocumentsView />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />

          <Route path="/search" element={
            <ProtectedRoute>
              <AuthenticatedLayout user={user} error={error}>
                <Search />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />

          <Route path="/upload" element={
            <ProtectedRoute>
              <AuthenticatedLayout user={user} error={error}>
                <Upload />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />

          <Route path="/kaboodles" element={
            <ProtectedRoute>
              <AuthenticatedLayout user={user} error={error}>
                <Kaboodles />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />

          <Route path="/media-hub" element={
            <ProtectedRoute>
              <AuthenticatedLayout user={user} error={error}>
                <MediaHub />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />

          {/* 404 route */}
          <Route path="*" element={
            <PublicLayout>
              <NotFound />
            </PublicLayout>
          } />
        </Routes>
        
        <SpeedInsights />
      </Router>
    );
}

export default function AppWrapper() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
