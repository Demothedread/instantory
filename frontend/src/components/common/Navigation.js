import { Link, useLocation } from 'react-router-dom';
import { neoDecorocoBase } from '../../styles/components/neo-decoroco/base';
import layout from '../../styles/layouts/constraints';
import { colors } from '../../styles/theme/colors';
import { css } from '@emotion/react';

const Navigation = () => {
  const location = useLocation();

  const navigationItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/workspace', label: 'Workspace', icon: '⚡' },
    { path: '/process', label: 'Process', icon: '⚙️' },
    { path: '/inventory', label: 'Inventory', icon: '📦' },
    { path: '/documents', label: 'Documents', icon: '📄' },
    { path: '/media-hub', label: 'Media', icon: '🎬' },
    { path: '/kaboodles', label: 'Kaboodles', icon: '🗂️' },
    { path: '/about', label: 'About', icon: 'ℹ️' },
    { path: '/resources', label: 'Resources', icon: '📚' }
  ];

  return (
    <nav css={styles.nav}>
      <div css={styles.logo}>
        <Link to="/" css={styles.logoLink}>
          <div css={styles.logoIcon}>B</div>
          <span css={styles.logoText}>Bartleby</span>
        </Link>
      </div>

      <div css={styles.navItems}>
        {navigationItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            css={[
              neoDecorocoBase.navLink,
              location.pathname === item.path && styles.activeLink
            ]}
          >
            <span css={styles.navIcon}>{item.icon}</span>
            <span css={styles.navLabel}>{item.label}</span>
          </Link>
        ))}
      </div>

      <div css={styles.footer}>
        <div css={styles.version}>v0.2.0</div>
      </div>
    </nav>
  );
};

const styles = {
  nav: css`
    grid-area: nav;
    width: 240px;
    background: ${colors.surface};
    border-right: 1px solid ${colors.border};
    display: flex;
    flex-direction: column;
    padding: ${layout.spacing.lg};
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);

    ${layout.media.mobile} {
      width: 60px;
      padding: ${layout.spacing.md} ${layout.spacing.sm};
    }
  `,

  logo: css`
    margin-bottom: ${layout.spacing.xl};
    padding-bottom: ${layout.spacing.lg};
    border-bottom: 1px solid ${colors.border};
  `,

  logoLink: css`
    display: flex;
    align-items: center;
    gap: ${layout.spacing.md};
    text-decoration: none;
    color: ${colors.textLight};
    
    &:hover {
      color: ${colors.neonGold};
    }
  `,

  logoIcon: css`
    width: 40px;
    height: 40px;
    border-radius: ${layout.borderRadius.lg};
    background: linear-gradient(135deg, ${colors.neonTeal}, ${colors.neonGold});
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 1.25rem;
    color: ${colors.background};
    box-shadow: ${layout.shadows.neon.teal};
  `,

  logoText: css`
    font-family: "Cinzel Decorative", serif;
    font-size: 1.25rem;
    font-weight: 600;
    
    ${layout.media.mobile} {
      display: none;
    }
  `,

  navItems: css`
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: ${layout.spacing.xs};
  `,

  navIcon: css`
    font-size: 1.25rem;
    width: 1.5rem;
    text-align: center;
  `,

  navLabel: css`
    font-weight: 500;
    
    ${layout.media.mobile} {
      display: none;
    }
  `,

  activeLink: css`
    background: ${colors.active} !important;
    color: ${colors.neonTeal} !important;
    border-left: 3px solid ${colors.neonTeal};
    box-shadow: ${layout.shadows.neon.teal};
  `,

  footer: css`
    padding-top: ${layout.spacing.lg};
    border-top: 1px solid ${colors.border};
    margin-top: auto;
  `,

  version: css`
    text-align: center;
    font-size: ${layout.spacing.sm};
    color: ${colors.textMuted};
    
    ${layout.media.mobile} {
      display: none;
    }
  `
};

export default Navigation;
