import AuthContext, { AuthProvider } from './contexts/auth/index';
import React, { useContext, useEffect, useState } from 'react';

import HowToUseOverlay from './components/common/HowToUseOverlay';
import LoginOverlay from './components/auth/LoginOverlay';
import Navigation from './components/common/Navigation';
import ProcessImagesButton from './components/upload/ProcessImagesButton';
import RolodexToggle from './components/display/RolodexToggle';
import { BrowserRouter as Router } from 'react-router-dom';
import { SpeedInsights } from "@vercel/speed-insights/react";
import UserMenu from './components/common/UserMenu';
import { animations } from './styles/theme/animations';
import { colors } from './styles/theme/colors';
import config from './config';
import { css } from '@emotion/react';
import { layout } from './styles/layouts/constraints';
import { neoDecorocoBase } from './styles/components/neo-decoroco/base';
import { typography } from './styles/theme/typography';

const styles = {
  appContainer: css`
    min-height: 100vh;
    max-height: ${layout.viewport.maxHeight};
    display: flex;
    flex-direction: column;
    background: ${colors.darkGradient};
    color: ${colors.textLight};
    font-family: ${typography.fonts.primary};
    overflow: hidden;
  `,

  header: css`
    ${neoDecorocoBase.panel}
    height: ${layout.heights.header};
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 0 ${layout.spacing.lg};
    z-index: ${layout.zIndex.sticky};
  `,

  mainSection: css`
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: ${layout.spacing.lg};
    padding: ${layout.spacing.lg};
    overflow-y: auto;
    position: relative;
    
    /* Custom scrollbar */
    scrollbar-width: thin;
    scrollbar-color: ${colors.neonTeal} transparent;
    
    &::-webkit-scrollbar {
      width: 6px;
    }
    
    &::-webkit-scrollbar-track {
      background: transparent;
    }
    
    &::-webkit-scrollbar-thumb {
      background-color: ${colors.neonTeal};
      border-radius: 3px;
    }
  `,

  uploadSection: css`
    transition: ${animations.transitions.all};
    
    &.expanded {
      flex: 1;
    }
    
    &.minimized {
      height: ${layout.heights.minimizedUpload};
    }
  `,

  contentDisplayWrapper: css`
    flex: 1;
    min-height: 0;
    opacity: 0;
    transform: translateY(20px);
    animation: ${animations.fadeIn} 0.5s ${animations.easing.elegant} forwards;
  `,

  errorMessage: css`
    ${neoDecorocoBase.panel}
    padding: ${layout.spacing.md} ${layout.spacing.lg};
    background: rgba(255, 82, 82, 0.1);
    border-color: ${colors.error};
    color: ${colors.error};
    margin-bottom: ${layout.spacing.lg};
  `,

  loadingContainer: css`
    ${neoDecorocoBase.panel}
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: ${layout.spacing.lg};
    padding: ${layout.spacing.xl};
    
    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid ${colors.border};
      border-top-color: ${colors.neonTeal};
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    .loading-text {
      font-family: ${typography.fonts.modern};
      font-size: ${typography.sizes.lg};
    }
  `,
};

function App() {
  const { user, loading } = useContext(AuthContext);
  const [showRolodex, setShowRolodex] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [inventory, setInventory] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [showHowTo, setShowHowTo] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const response = await fetch(`${config.apiUrl}/api/inventory`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        setInventory(Array.isArray(data) ? data : [data]);
      } else {
        console.log('No inventory data available');
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }

    try {
      const response = await fetch(`${config.apiUrl}/api/documents`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        setDocuments(Array.isArray(data) ? data : [data]);
      } else {
        console.log('No documents data available');
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const handleProcessFiles = async () => {
    await fetchData();
    setShowRolodex(true);
    setIsExpanded(false);
  };

  if (loading) {
    return (
      <div css={styles.loadingContainer}>
        <div className="loading-spinner"></div>
        <div className="loading-text">Loading...</div>
      </div>
    );
  }

  return (
    <div css={styles.appContainer}>
      <Navigation />
      <header css={styles.header}>
        {user && <UserMenu user={user} />}
      </header>

      <main css={styles.mainSection}>
        {error && <div css={styles.errorMessage}>{error}</div>}

        <LoginOverlay isVisible={!user} />

        {user && (
          <>
            <div css={styles.uploadSection} className={!showRolodex ? 'expanded' : 'minimized'}>
              <ProcessImagesButton 
                onProcess={handleProcessFiles} 
                isAuthenticated={true}
                isMinimized={!isExpanded}
              />
            </div>

            {showRolodex && (
              <div css={styles.contentDisplayWrapper}>
                <RolodexToggle inventory={inventory} documents={documents} />
              </div>
            )}
          </>
        )}
      </main>

      <HowToUseOverlay isOpen={showHowTo} onClose={() => setShowHowTo(false)} />
      <SpeedInsights />
    </div>
  );
}

// Wrap the app with necessary providers
function AppWrapper() {
  return (
    <Router>
      <AuthProvider>
        <App />
      </AuthProvider>
    </Router>
  );
}

export default AppWrapper;
