import { css } from '@emotion/react';
import { useState } from 'react';
import Navigation from '../common/Navigation';
import UserMenu from '../common/UserMenu';
import HowToUseOverlay from '../common/HowToUseOverlay';
import { neoDecorocoBase } from '../../styles/components/neo-decoroco/base';
import layout from '../../styles/layouts/constraints';
import { colors } from '../../styles/theme/colors';
import { typography } from '../../styles/theme/typography';

/**
 * Authenticated Layout Component
 * Layout for logged-in users with navigation and user menu
 */
const AuthenticatedLayout = ({ children, user, error }) => {
  const [showHowTo, setShowHowTo] = useState(false);

  return (
    <div css={styles.layout}>
      <Navigation />
      
      <header css={styles.header}>
        {user && <UserMenu user={user} />}
      </header>

      <main css={styles.main}>
        {error && (
          <div css={styles.errorAlert}>
            {error}
          </div>
        )}
        {children}
      </main>

      <footer css={styles.footer}>
        <button 
          css={styles.howToButton}
          onClick={() => setShowHowTo(true)}
        >
          How to Use Bartleby
        </button>
      </footer>

      <HowToUseOverlay isOpen={showHowTo} onClose={() => setShowHowTo(false)} />
    </div>
  );
};

const styles = {
  layout: css`
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
  `,

  header: css`
    grid-area: header;
    ${neoDecorocoBase.panel};
    height: ${layout.heights.header};
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 0 ${layout.spacing.md};
  `,

  main: css`
    grid-area: main;
    padding: ${layout.spacing.lg};
    overflow-y: auto;
    position: relative;
  `,

  footer: css`
    grid-area: footer;
    ${neoDecorocoBase.panel};
    height: ${layout.heights.footer || '60px'};
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 ${layout.spacing.md};
  `,

  errorAlert: css`
    ${neoDecorocoBase.alert};
    margin-bottom: ${layout.spacing.lg};
  `,

  howToButton: css`
    ${neoDecorocoBase.button};
    background: none;
    border: none;
    color: ${colors.neonTeal};
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      color: ${colors.neonGold};
      text-shadow: 0 0 10px ${colors.neonGold};
    }
  `,
};

export default AuthenticatedLayout;
