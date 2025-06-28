import { css } from '@emotion/react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import layout from '../../../styles/layouts/constraints';
import { colors } from '../../../styles/theme/colors';
import { typography } from '../../../styles/theme/typography';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Close navigation when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const navItems = [
    { path: '/home', label: 'Home', icon: '🏠' },
    { path: '/about', label: 'About', icon: 'ℹ️' },
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/process', label: 'Process Files', icon: '⚙️' },
    { path: '/inventory', label: 'Inventory', icon: '📦' },
    { path: '/documents', label: 'Documents', icon: '📄' },
    { path: '/kaboodles', label: 'Kaboodles', icon: '🗂️' },
    { path: '/resources', label: 'Resources', icon: '📚' },
    { path: '/media-hub', label: 'Media Hub', icon: '🖼️' },
    { path: '/terms', label: 'Terms', icon: '📜' },
  ];

  return (
    <> 
      {/* Mobile navigation toggle */}
      <button 
        css={[styles.mobileToggle, isOpen && styles.mobileToggleOpen]}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle navigation"
        aria-expanded={isOpen}
      >
        <span css={styles.toggleIcon} />
        <span css={styles.toggleIcon} />
        <span css={styles.toggleIcon} />
      </button>

      {/* Navigation overlay for mobile */}
      <div css={[styles.overlay, isOpen && styles.overlayOpen]} onClick={() => setIsOpen(false)} />

      {/* Main navigation */}
      <nav css={[styles.container, isOpen && styles.containerOpen]}>
        {/* Navigation header */}
        <div css={styles.header}>
          <Link to="/home" css={styles.logo}>
            <span css={styles.logoIcon}>⚡</span>
            <span css={styles.logoText}>BARTLEBY</span>
          </Link>
        </div>

        {/* Navigation menu */}
        <div css={styles.menu}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              css={[
                styles.menuItem, 
                location.pathname === item.path && styles.menuItemActive
              ]}
              onClick={() => setIsOpen(false)}
            >
              <span css={styles.menuIcon}>{item.icon}</span>
              <span css={styles.menuLabel}>{item.label}</span>
              <div css={styles.menuGlow} />
            </Link>
          ))}
        </div>

        {/* Navigation footer with decorative elements */}
        <div css={styles.footer}>
          <div css={styles.decorativeElement} />
          <div css={styles.versionInfo}>v2.0 Neo-Deco</div>
        </div>
      </nav>
    </> 
  );
};

const styles = {
  // Mobile toggle button
  mobileToggle: css`
    position: fixed;
    top: ${layout.spacing.lg};
    left: ${layout.spacing.lg};
    z-index: 1000;
    width: 48px;
    height: 48px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 6px;
    background: ${colors.surface};
    border: 2px solid ${colors.neonTeal};
    border-radius: ${layout.borderRadius.lg};
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 20px rgba(0, 255, 255, 0.2);

    &:hover {
      transform: scale(1.05);
      border-color: ${colors.neonGold};
      box-shadow: 0 6px 30px rgba(255, 215, 0, 0.3);
    }

    ${layout.media.desktop} {
      display: none;
    }
  `,

  mobileToggleOpen: css`
    transform: rotate(180deg);
    border-color: ${colors.neonPink};
    box-shadow: 0 6px 30px rgba(255, 7, 58, 0.3);
  `,

  toggleIcon: css`
    width: 20px;
    height: 2px;
    background: ${colors.neonTeal};
    border-radius: 2px;
    transition: all 0.3s ease;
    transform-origin: center;

    &:nth-of-type(1) {
      transform: ${props => props.isOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none'};
    }

    &:nth-of-type(2) {
      opacity: ${props => props.isOpen ? '0' : '1'};
    }

    &:nth-of-type(3) {
      transform: ${props => props.isOpen ? 'rotate(-45deg) translate(7px, -6px)' : 'none'};
    }
  `,

  // Navigation overlay
  overlay: css`
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(4px);
    z-index: 998;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;

    ${layout.media.desktop} {
      display: none;
    }
  `,

  overlayOpen: css`
    opacity: 1;
    visibility: visible;
  `,

  // Main navigation container
  container: css`
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 320px;
    background: linear-gradient(180deg, 
      ${colors.background} 0%, 
      ${colors.surface} 30%, 
      ${colors.card} 100%);
    border-right: 2px solid ${colors.neonTeal};
    z-index: 999;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    transform: translateX(-100%);
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    
    /* Art-Deco geometric pattern overlay */
    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background-image: 
        linear-gradient(45deg, transparent 40%, ${colors.neonTeal}05 42%, ${colors.neonTeal}05 58%, transparent 60%),
        linear-gradient(-45deg, transparent 40%, ${colors.neonGold}03 42%, ${colors.neonGold}03 58%, transparent 60%);
      background-size: 40px 40px;
      pointer-events: none;
      z-index: 1;
    }

    /* Rococo ornamental border */
    &::after {
      content: '';
      position: absolute;
      top: ${layout.spacing.xl};
      bottom: ${layout.spacing.xl};
      right: 0;
      width: 4px;
      background: linear-gradient(180deg, 
        transparent 0%, 
        ${colors.neonTeal} 20%, 
        ${colors.neonGold} 50%, 
        ${colors.neonPurple} 80%, 
        transparent 100%);
      border-radius: 2px;
      z-index: 2;
    }

    ${layout.media.desktop} {
      transform: translateX(0);
    }
  `,

  containerOpen: css`
    transform: translateX(0);
  `,

  // Navigation header
  header: css`
    position: relative;
    padding: ${layout.spacing.xl} ${layout.spacing.lg};
    border-bottom: 1px solid ${colors.border};
    z-index: 3;
  `,

  logo: css`
    display: flex;
    align-items: center;
    gap: ${layout.spacing.md};
    text-decoration: none;
    transition: all 0.3s ease;

    &:hover {
      transform: scale(1.02);
    }
  `,

  logoIcon: css`
    font-size: ${typography.sizes['2xl']};
    filter: drop-shadow(0 0 10px ${colors.neonTeal});
    animation: logoGlow 3s ease-in-out infinite alternate;

    @keyframes logoGlow {
      0% { filter: drop-shadow(0 0 10px ${colors.neonTeal}); }
      100% { filter: drop-shadow(0 0 20px ${colors.neonGold}); }
    }
  `,

  logoText: css`
    font-family: ${typography.fonts.heading};
    font-size: ${typography.sizes.xl};
    font-weight: ${typography.weights.bold};
    color: ${colors.neonTeal};
    text-shadow: 0 0 15px ${colors.neonTeal}60;
    letter-spacing: 0.1em;
  `,

  // Navigation menu
  menu: css`
    flex: 1;
    padding: ${layout.spacing.lg};
    position: relative;
    z-index: 3;
  `,

  menuItem: css`
    display: flex;
    align-items: center;
    gap: ${layout.spacing.md};
    padding: ${layout.spacing.md} ${layout.spacing.lg};
    margin-bottom: ${layout.spacing.sm};
    text-decoration: none;
    color: ${colors.textLight};
    border-radius: ${layout.borderRadius.md};
    border: 1px solid transparent;
    position: relative;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    background: rgba(255, 255, 255, 0.02);

    &:hover {
      color: ${colors.neonTeal};
      border-color: ${colors.neonTeal}40;
      background: rgba(0, 255, 255, 0.05);
      transform: translateX(8px);
    }
  `,

  menuItemActive: css`
    color: ${colors.neonGold};
    border-color: ${colors.neonGold};
    background: linear-gradient(90deg, 
      rgba(255, 215, 0, 0.1) 0%, 
      rgba(255, 215, 0, 0.05) 100%);
    transform: translateX(12px);
    box-shadow: 0 4px 15px rgba(255, 215, 0, 0.2);

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background: ${colors.neonGold};
      border-radius: 0 2px 2px 0;
    }
  `,

  menuIcon: css`
    font-size: ${typography.sizes.lg};
    filter: drop-shadow(0 0 8px currentColor);
    transition: transform 0.3s ease;

    .menu-item:hover & {
      transform: scale(1.1);
    }
  `,

  menuLabel: css`
    font-family: ${typography.fonts.primary};
    font-size: ${typography.sizes.base};
    font-weight: ${typography.weights.medium};
    letter-spacing: 0.05em;
  `,

  menuGlow: css`
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, 
      transparent 0%, 
      currentColor 50%, 
      transparent 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: -1;

    .menu-item:hover & {
      opacity: 0.1;
    }
  `,

  // Navigation footer
  footer: css`
    position: relative;
    padding: ${layout.spacing.lg};
    border-top: 1px solid ${colors.border};
    z-index: 3;
  `,

  decorativeElement: css`
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, 
      transparent 0%, 
      ${colors.neonTeal} 30%, 
      ${colors.neonGold} 50%, 
      ${colors.neonPurple} 70%, 
      transparent 100%);
    margin-bottom: ${layout.spacing.md};
    border-radius: 1px;
  `,

  versionInfo: css`
    font-family: ${typography.fonts.mono};
    font-size: ${typography.sizes.xs};
    color: ${colors.textMuted};
    text-align: center;
    letter-spacing: 0.1em;
    opacity: 0.7;
  `,
};

export default Navigation;
