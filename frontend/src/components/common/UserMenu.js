import React, { useState, useContext } from 'react';
import { css } from '@emotion/react';
import { AuthContext } from '../../contexts/auth';
import { colors } from '../../styles/theme/colors';
import { neoDecorocoBase } from '../../styles/components/neo-decoroco/base';
import layout from '../../styles/layouts/constraints';

const UserMenu = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useContext(AuthContext);

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };

  return (
    <div css={styles.container}>
      <button
        css={styles.userButton}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div css={styles.avatar}>
          {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <span css={styles.userName}>
          {user?.name || user?.email || 'User'}
        </span>
        <span css={styles.chevron}>
          {isOpen ? '▲' : '▼'}
        </span>
      </button>

      {isOpen && (
        <>
          <div css={styles.backdrop} onClick={() => setIsOpen(false)} />
          <div css={styles.dropdown}>
            <div css={styles.userInfo}>
              <div css={styles.userDetails}>
                <div css={styles.displayName}>
                  {user?.name || 'Anonymous User'}
                </div>
                <div css={styles.email}>
                  {user?.email || 'No email'}
                </div>
              </div>
            </div>
            
            <div css={styles.divider} />
            
            <div css={styles.menuItems}>
              <button css={styles.menuItem}>
                <span css={styles.menuIcon}>⚙️</span>
                Settings
              </button>
              <button css={styles.menuItem}>
                <span css={styles.menuIcon}>👤</span>
                Profile
              </button>
              <button css={styles.menuItem}>
                <span css={styles.menuIcon}>❓</span>
                Help
              </button>
            </div>
            
            <div css={styles.divider} />
            
            <button 
              css={[styles.menuItem, styles.logoutItem]}
              onClick={handleLogout}
            >
              <span css={styles.menuIcon}>🚪</span>
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const styles = {
  container: css`
    position: relative;
  `,

  userButton: css`
    ${neoDecorocoBase.button};
    background: ${colors.surface};
    border: 1px solid ${colors.border};
    padding: 0.5rem 1rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    min-width: 160px;
    
    &:hover {
      background: ${colors.hover};
      border-color: ${colors.neonTeal};
    }
  `,

  avatar: css`
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, ${colors.neonTeal}, ${colors.neonGold});
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    color: ${colors.background};
    font-size: 0.875rem;
  `,

  userName: css`
    flex: 1;
    text-align: left;
    font-weight: 500;
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  `,

  chevron: css`
    font-size: 0.75rem;
    opacity: 0.7;
    transition: transform 0.2s ease;
  `,

  backdrop: css`
    position: fixed;
    inset: 0;
    z-index: ${layout.zIndex.dropdown - 1};
  `,

  dropdown: css`
    position: absolute;
    top: calc(100% + 0.5rem);
    right: 0;
    width: 240px;
    background: ${colors.surface};
    border: 1px solid ${colors.border};
    border-radius: ${layout.borderRadius.lg};
    box-shadow: ${layout.shadows.lg};
    z-index: ${layout.zIndex.dropdown};
    overflow: hidden;
    backdrop-filter: blur(10px);
  `,

  userInfo: css`
    padding: 1rem;
    background: ${colors.glass};
  `,

  userDetails: css`
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  `,

  displayName: css`
    font-weight: 600;
    color: ${colors.textLight};
    font-size: 0.875rem;
  `,

  email: css`
    font-size: 0.75rem;
    color: ${colors.textMuted};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  `,

  divider: css`
    height: 1px;
    background: ${colors.border};
    margin: 0;
  `,

  menuItems: css`
    padding: 0.5rem 0;
  `,

  menuItem: css`
    width: 100%;
    padding: 0.75rem 1rem;
    background: none;
    border: none;
    color: ${colors.textLight};
    font-size: 0.875rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      background: ${colors.hover};
      color: ${colors.neonTeal};
    }
  `,

  menuIcon: css`
    font-size: 1rem;
    width: 1.25rem;
    text-align: center;
  `,

  logoutItem: css`
    color: ${colors.neonRed};
    margin: 0.5rem 0 0 0;
    
    &:hover {
      background: rgba(255, 7, 58, 0.1);
      color: ${colors.neonRed};
    }
  `
};

export default UserMenu;
