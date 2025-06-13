import { GoogleOAuthProvider } from '@react-oauth/google';
import { useContext, useState } from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import config from './config';
import { AuthContext, AuthProvider } from './contexts/auth';

import About from './pages/About';
import Kaboodles from './pages/Kaboodles';
import MediaHub from './pages/MediaHub';
import Resources from './pages/Resources';
import Terms from './pages/Terms';

import AuthCallback from './components/auth/authCallback';
import HowToUseOverlay from './components/common/HowToUseOverlay';
import Dashboard from './components/dashboard/Dashboard';
import BartlebyMain from './components/main/BartlebyMain';
import DocumentsView from './pages/DocumentsView';
import InventoryView from './pages/InventoryView';
// Page components
import HomePage from './pages/HomePage';
// Layout components
import { css } from '@emotion/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import Navigation from './components/common/Navigation';
import UserMenu from './components/common/UserMenu';
import NotFound from './pages/404NotFound';
import layout from './styles/layouts/constraints';
import { colors } from './styles/theme/colors';
// Styles
import { neoDecorocoBase } from './styles/components/neo-decoroco/base';
import { typography } from './styles/theme/typography';

function App() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [showHowTo, setShowHowTo] = useState(false);

  // Show loading spinner while checking authentication
  if (authLoading) {
    return (
      <div css={css`
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        background: ${colors.darkGradient};
      `}>
        <div css={css`
          ${neoDecorocoBase.spinner}
        `}>Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      {!user ? (
        // Simple layout for homepage/login
        <div css={css`
          background: ${colors.darkGradient};
          color: ${colors.textLight};
          font-family: ${typography.fonts.primary};
          min-height: 100vh;
        `}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<About />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/auth-callback" element={<AuthCallback />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      ) : (
        // Full app layout for authenticated users
        <div css={css`
          background: ${colors.darkGradient};
          color: ${colors.textLight};
          font-family: ${typography.fonts.primary};
          min-height: 100vh;
          display: grid;
          grid-template-columns: auto 1fr;
          grid-template-rows: auto 1fr auto;
          grid-template-areas:
            "nav header"
            "nav main"
            "nav footer";
        `}>
          <Navigation />
          
          <header css={css`
            grid-area: header;
            ${neoDecorocoBase.panel};
            height: ${layout.heights.header};
            display: flex;
            align-items: center;
            justify-content: flex-end;
            padding: 0 ${layout.spacing.md};
          `}>
            <UserMenu user={user} />
          </header>

          <main css={css`
            grid-area: main;
            padding: ${layout.spacing.md};
            overflow-y: auto;
          `}>
            <Routes>
              {/* Protected routes */}
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/workspace" element={<BartlebyMain />} />
              <Route path="/process" element={<BartlebyMain />} />
              <Route path="/inventory" element={<InventoryView />} />
              <Route path="/documents" element={<DocumentsView />} />
              <Route path="/kaboodles" element={<Kaboodles />} />
              <Route path="/media-hub" element={<MediaHub />} />
              <Route path="/about" element={<About />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/auth-callback" element={<AuthCallback />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>

          <footer css={css`
            grid-area: footer;
            ${neoDecorocoBase.panel};
            height: ${layout.heights.footer || '60px'};
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0 ${layout.spacing.md};
          `}>
            <button 
              css={css`
                ${neoDecorocoBase.button};
                background: none;
                border: none;
                color: ${colors.neonTeal};
                &:hover {
                  color: ${colors.neonGold};
                  text-shadow: 0 0 10px ${colors.neonGold};
                }
              `}
              onClick={() => setShowHowTo(true)}
            >
              How to Use Bartleby
            </button>
          </footer>
        </div>
      )}

      <HowToUseOverlay isOpen={showHowTo} onClose={() => setShowHowTo(false)} />
      <SpeedInsights />
    </Router>
  );
}

export default function AppWrapper() {
  const googleClientId = config.googleClientId || process.env.REACT_APP_GOOGLE_CLIENT_ID;
  
  if (!googleClientId) {
    console.warn('Google Client ID not found. Google OAuth will not work.');
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId || "dummy-client-id"}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
