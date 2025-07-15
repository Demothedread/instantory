import React, { useState, useContext } from 'react';
import { css } from '@emotion/react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../../contexts/auth/index';
import Navigation from '../common/Navigation';
import UserMenu from '../common/UserMenu';
import HowToUseOverlay from '../common/HowToUseOverlay';
import { neoDecorocoBase } from '../../styles/components/neo-decoroco/base';
import layout from '../../styles/layouts/constraints';
import { colors } from '../../styles/theme/colors';
import { typography } from '../../styles/theme/typography';

/**
 * Adaptive Layout Component
 * A unified layout that adapts based on authentication state
 * Component Genealogy: Layout System → Adaptive Framework → Context-Aware Interface
 * 
 * Features:
 * - Seamless transitions between authenticated and public states
 * - Context-aware navigation (shows/hides based on auth state)
 * - Consistent visual design language
 * - Responsive behavior across devices
 * - Smooth animations for state changes
 */
const AdaptiveLayout = ({ children, error }) => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [showHowTo, setShowHowTo] = useState(false);
  const [isNavExpanded, setIsNavExpanded] = useState(false);

  // Layout variants based on authentication state
  const getLayoutVariant = () => {
    if (isAuthenticated && user) {
      return 'authenticated';
    }
    return 'public';
  };

  const layoutVariant = getLayoutVariant();

  return (
    <motion.div 
      css={[styles.layout, styles[layoutVariant]]}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Background Elements */}
      <div css={styles.backgroundElements}>
        <motion.div 
          css={styles.geometricElement1}
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.05, 1]
          }}
          transition={{ 
            duration: 30, 
            repeat: Infinity, 
            ease: "linear" 
          }}
        />
        <motion.div 
          css={styles.geometricElement2}
          animate={{ 
            rotate: [360, 0],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ 
            duration: 25, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
      </div>

      {/* Navigation - Only show for authenticated users */}
      <AnimatePresence>
        {isAuthenticated && (
          <motion.nav
            css={styles.navigation}
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <Navigation 
              isExpanded={isNavExpanded}
              onToggle={() => setIsNavExpanded(!isNavExpanded)}
            />
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Header - Adaptive based on auth state */}
      <motion.header 
        css={[styles.header, isAuthenticated && styles.headerAuthenticated]}
        layout
        transition={{ duration: 0.3 }}
      >
        {/* Mobile menu button for authenticated users */}
        {isAuthenticated && (
          <motion.button
            css={styles.mobileMenuButton}
            onClick={() => setIsNavExpanded(!isNavExpanded)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span css={[styles.hamburgerLine, isNavExpanded && styles.hamburgerActive]} />
            <span css={[styles.hamburgerLine, isNavExpanded && styles.hamburgerActive]} />
            <span css={[styles.hamburgerLine, isNavExpanded && styles.hamburgerActive]} />
          </motion.button>
        )}

        {/* Logo/Title - Always visible */}
        <motion.div 
          css={styles.headerLogo}
          whileHover={{ scale: 1.02 }}
        >
          <span css={styles.logoIcon}>🧠</span>
          {!isAuthenticated && (
            <h1 css={styles.logoTitle}>Bartleby</h1>
          )}
        </motion.div>

        {/* User menu - Only for authenticated users */}
        <AnimatePresence>
          {isAuthenticated && user && (
            <motion.div
              css={styles.userMenuContainer}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
            >
              <UserMenu user={user} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Main content area */}
      <motion.main 
        css={[styles.main, isAuthenticated && styles.mainAuthenticated]}
        layout
        transition={{ duration: 0.3 }}
      >
        {/* Error display */}
        <AnimatePresence>
          {error && (
            <motion.div 
              css={styles.errorAlert}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <span css={styles.errorIcon}>⚠️</span>
              <span css={styles.errorText}>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Children content */}
        <div css={styles.contentWrapper}>
          {children}
        </div>
      </motion.main>

      {/* Footer - Adaptive based on auth state */}
      <AnimatePresence>
        {isAuthenticated && (
          <motion.footer 
            css={styles.footer}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.5 }}
          >
            <div css={styles.footerContent}>
              <motion.button 
                css={styles.howToButton}
                onClick={() => setShowHowTo(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span css={styles.buttonIcon}>💡</span>
                <span>How to Use Bartleby</span>
              </motion.button>

              <div css={styles.footerInfo}>
                <span css={styles.statusIndicator}>⚡</span>
                <span css={styles.statusText}>Intelligence Active</span>
              </div>
            </div>
          </motion.footer>
        )}
      </AnimatePresence>

      {/* Mobile navigation overlay */}
      <AnimatePresence>
        {isAuthenticated && isNavExpanded && (
          <motion.div
            css={styles.mobileNavOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsNavExpanded(false)}
          >
            <motion.div
              css={styles.mobileNavContent}
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Navigation 
                isExpanded={true}
                onToggle={() => setIsNavExpanded(false)}
                isMobile={true}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* How-to overlay */}
      <HowToUseOverlay isOpen={showHowTo} onClose={() => setShowHowTo(false)} />
    </motion.div>
  );
};

const styles = {
  // Base layout
  layout: css`
    min-height: 100vh;
    background: ${colors.darkGradient};
    color: ${colors.textLight};
    font-family: ${typography.fonts.primary};
    position: relative;
    overflow-x: hidden;
  `,

  // Layout variants
  public: css`
    display: flex;
    flex-direction: column;
  `,

  authenticated: css`
    display: grid;
    grid-template-columns: auto 1fr;
    grid-template-rows: auto 1fr auto;
    grid-template-areas:
      "nav header"
      "nav main"
      "nav footer";

    ${layout.media.mobile} {
      grid-template-columns: 1fr;
      grid-template-areas:
        "header"
        "main"
        "footer";
    }
  `,

  // Background elements
  backgroundElements: css`
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 0;
  `,

  geometricElement1: css`
    position: absolute;
    top: 10%;
    right: 5%;
    width: 300px;
    height: 300px;
    background: linear-gradient(45deg, 
      ${colors.neonTeal}04 0%, 
      ${colors.neonGold}03 50%,
      transparent 100%);
    clip-path: polygon(
      25% 0%, 75% 0%, 100% 25%, 100% 75%, 
      75% 100%, 25% 100%, 0% 75%, 0% 25%
    );
    filter: blur(2px);

    ${layout.media.mobile} {
      width: 150px;
      height: 150px;
      top: 5%;
      right: 2%;
    }
  `,

  geometricElement2: css`
    position: absolute;
    bottom: 10%;
    left: 5%;
    width: 250px;
    height: 250px;
    background: linear-gradient(135deg, 
      ${colors.neonPurple}04 0%, 
      ${colors.neonPink}03 50%,
      transparent 100%);
    clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
    filter: blur(2px);

    ${layout.media.mobile} {
      width: 120px;
      height: 120px;
      bottom: 5%;
      left: 2%;
    }
  `,

  // Navigation
  navigation: css`
    grid-area: nav;
    position: relative;
    z-index: 100;

    ${layout.media.mobile} {
      display: none;
    }
  `,

  // Header
  header: css`
    position: relative;
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: ${layout.spacing.lg};
    background: linear-gradient(135deg, 
      rgba(26, 26, 46, 0.95) 0%, 
      rgba(20, 20, 40, 0.98) 100%);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid ${colors.border};
  `,

  headerAuthenticated: css`
    grid-area: header;
    justify-content: space-between;
    height: ${layout.heights.header};
    padding: 0 ${layout.spacing.lg};
  `,

  mobileMenuButton: css`
    display: none;
    flex-direction: column;
    justify-content: space-around;
    width: 30px;
    height: 30px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;

    ${layout.media.mobile} {
      display: flex;
    }
  `,

  hamburgerLine: css`
    width: 100%;
    height: 3px;
    background: ${colors.neonTeal};
    border-radius: 2px;
    transition: all 0.3s ease;
    transform-origin: center;
  `,

  hamburgerActive: css`
    &:nth-child(1) {
      transform: rotate(45deg) translate(6px, 6px);
    }
    &:nth-child(2) {
      opacity: 0;
    }
    &:nth-child(3) {
      transform: rotate(-45deg) translate(6px, -6px);
    }
  `,

  headerLogo: css`
    display: flex;
    align-items: center;
    gap: ${layout.spacing.md};
    cursor: pointer;
  `,

  logoIcon: css`
    font-size: ${typography.sizes['2xl']};
    color: ${colors.neonGold};
    filter: drop-shadow(0 0 10px ${colors.neonGold});
  `,

  logoTitle: css`
    font-family: ${typography.fonts.decorative};
    font-size: ${typography.sizes['3xl']};
    font-weight: ${typography.weights.black};
    color: ${colors.neonGold};
    margin: 0;
    text-shadow: 0 0 15px ${colors.neonGold}50;
    letter-spacing: 0.05em;

    ${layout.media.mobile} {
      font-size: ${typography.sizes['2xl']};
    }
  `,

  userMenuContainer: css`
    display: flex;
    align-items: center;
  `,

  // Main content
  main: css`
    position: relative;
    z-index: 10;
    flex: 1;
    padding: ${layout.spacing.lg};
    overflow-y: auto;
  `,

  mainAuthenticated: css`
    grid-area: main;
    padding: ${layout.spacing.lg};

    ${layout.media.mobile} {
      padding: ${layout.spacing.md};
    }
  `,

  contentWrapper: css`
    position: relative;
    z-index: 1;
  `,

  // Error handling
  errorAlert: css`
    ${neoDecorocoBase.alert};
    display: flex;
    align-items: center;
    gap: ${layout.spacing.sm};
    margin-bottom: ${layout.spacing.lg};
    padding: ${layout.spacing.lg};
    background: rgba(255, 7, 58, 0.15);
    border: 1px solid ${colors.neonRed};
    border-radius: ${layout.borderRadius.lg};
    color: ${colors.neonRed};
  `,

  errorIcon: css`
    font-size: ${typography.sizes.lg};
    filter: drop-shadow(0 0 5px currentColor);
  `,

  errorText: css`
    font-family: ${typography.fonts.primary};
    font-size: ${typography.sizes.base};
  `,

  // Footer
  footer: css`
    grid-area: footer;
    position: relative;
    z-index: 50;
    background: linear-gradient(135deg, 
      rgba(15, 15, 35, 0.95) 0%, 
      rgba(10, 10, 30, 0.98) 100%);
    border-top: 1px solid ${colors.border};
    backdrop-filter: blur(20px);
    padding: ${layout.spacing.md} ${layout.spacing.lg};
  `,

  footerContent: css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 1200px;
    margin: 0 auto;

    ${layout.media.mobile} {
      flex-direction: column;
      gap: ${layout.spacing.md};
    }
  `,

  howToButton: css`
    ${neoDecorocoBase.button};
    display: flex;
    align-items: center;
    gap: ${layout.spacing.sm};
    background: none;
    border: 2px solid ${colors.neonTeal};
    border-radius: ${layout.borderRadius.lg};
    color: ${colors.neonTeal};
    padding: ${layout.spacing.sm} ${layout.spacing.lg};
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      background: ${colors.neonTeal}20;
      color: ${colors.neonGold};
      border-color: ${colors.neonGold};
      box-shadow: 0 0 15px ${colors.neonGold}30;
    }
  `,

  buttonIcon: css`
    font-size: ${typography.sizes.base};
    filter: drop-shadow(0 0 5px currentColor);
  `,

  footerInfo: css`
    display: flex;
    align-items: center;
    gap: ${layout.spacing.sm};
  `,

  statusIndicator: css`
    font-size: ${typography.sizes.base};
    color: ${colors.neonGreen};
    filter: drop-shadow(0 0 5px ${colors.neonGreen});
  `,

  statusText: css`
    font-family: ${typography.fonts.mono};
    font-size: ${typography.sizes.sm};
    color: ${colors.textLight};
    text-transform: uppercase;
    letter-spacing: 0.05em;
  `,

  // Mobile navigation
  mobileNavOverlay: css`
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);
    z-index: 200;
    display: none;

    ${layout.media.mobile} {
      display: block;
    }
  `,

  mobileNavContent: css`
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 280px;
    background: linear-gradient(135deg, 
      rgba(26, 26, 46, 0.98) 0%, 
      rgba(20, 20, 40, 1) 100%);
    backdrop-filter: blur(25px);
    border-right: 2px solid ${colors.border};
    overflow-y: auto;
  `,
};

export default AdaptiveLayout;
