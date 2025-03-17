import { AuthContext, AuthProvider } from './contexts/auth';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';

import HowToUseOverlay from './components/common/HowToUseOverlay';
import LoginOverlay from './components/auth/LoginOverlay';
import Navigation from './components/common/Navigation';
import RolodexToggle from './components/display/RolodexToggle';
import { BrowserRouter as Router } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';
import UserMenu from './components/common/UserMenu';
import { colors } from './styles/theme/colors';
import config from './config';
import { css } from '@emotion/react';
import { dataApi } from './services/api';
import { layout } from './styles/layouts/constraints';
import { neoDecorocoBase } from './styles/components/neo-decoroco/base';
import { typography } from './styles/theme/typography';

function App() {
  const { user, loginWithGoogle, logout } = useContext(AuthContext);
  const [inventory, setInventory] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [showHowTo, setShowHowTo] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showRolodex, setShowRolodex] = useState(false);

  const hasInitializedRef = useRef(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [inventoryResponse, documentsResponse] = await Promise.all([
        dataApi.getInventory(),
        dataApi.getDocuments()
      ]);

      // Add error checking for API responses
      if (!inventoryResponse || !documentsResponse) {
        throw new Error('Invalid API response');
      }

      // Properly handle API responses with safe fallbacks
      const inventoryData = inventoryResponse.data;
      const documentsData = documentsResponse.data;
      
      setInventory(Array.isArray(inventoryData) ? inventoryData : []);
      setDocuments(Array.isArray(documentsData) ? documentsData : []);
    } catch (err) {
      console.error('Fetch data error:', err);
      setError(err.message || 'Error fetching data from backend.');
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && !hasInitializedRef.current) {
      fetchData();
      setShowRolodex(true);
      hasInitializedRef.current = true;
    } else if (!user) {
      hasInitializedRef.current = false;
      setShowRolodex(false);
    }
  }, [user, fetchData]);

  const handleProcessFiles = useCallback(async () => {
    setLoading(true);
    try {
      await dataApi.processFiles();
      await fetchData();
    } catch (err) {
      setError('Error processing files.');
      console.error('File processing error:', err);
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  }, [fetchData]);

  const appStyles = {
    header: css`
      ${neoDecorocoBase.panel};
      height: ${layout.heights.header};
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 ${layout.spacing.md};
    `,
    mainSection: css`
      flex: 1;
      overflow-y: auto;
      padding: ${layout.spacing.lg};
    `,
    uploadSection: css`
      margin-bottom: ${layout.spacing.lg};
      opacity: 0.7;
    `,
    error: css`
      ${neoDecorocoBase.panel};
      background-color: rgba(255, 0, 0, 0.1);
      color: red;
      padding: ${layout.spacing.md};
      margin-bottom: ${layout.spacing.lg};
    `,
  };

  return (
    <Router>
      <div
        css={css`
          background: ${colors.darkGradient};
          color: ${colors.textLight};
          font-family: ${typography.fonts.primary};
          overflow: hidden;
          height: 100vh;
          display: flex;
          flex-direction: column;
        `}
      >
        <Navigation />

        <header css={appStyles.header}>
          {user && <UserMenu user={user} />}
        </header>

        <main css={appStyles.mainSection}>
          {error && <div css={appStyles.error}>{error}</div>}

          {!user && (
            <LoginOverlay
              isVisible={!user}
              onGoogleLogin={loginWithGoogle}
            />
          )}

          {user && (
            <>
              <div css={appStyles.uploadSection}>
                <button onClick={handleProcessFiles}>
                  {loading ? 'Loading...' : 'Process Files'}
                </button>
              </div>

              {showRolodex && (
                <RolodexToggle inventory={inventory} documents={documents} />
              )}
            </>
          )}
        </main>

        <footer css={appStyles.header}>
          {user && <UserMenu user={user} />}
        </footer>

        <HowToUseOverlay isOpen={showHowTo} onClose={() => setShowHowTo(false)} />
        <SpeedInsights />
      </div>
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
