/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useState } from 'react';
import config from '../../../config';
import layout from '../../../styles/layouts/constraints';
import { colors } from '../../../styles/theme/colors';
import { typography } from '../../../styles/theme/typography';


function UserMenu({ user }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showExports, setShowExports] = useState(false);
  const [exports, setExports] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleExportsClick = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${config.apiUrl}/api/user/exports?user_id=${user.id}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setExports(data);
        setShowExports(true);
        setShowDropdown(false);
      }
    } catch (error) {
      console.error('Error fetching exports:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.reload();
  };

  return (
    <div css={styles.userMenu}>
      <div css={styles.menu}>
        <button 
          css={styles.userButton}
          onClick={() => setShowDropdown(!showDropdown)}
        >
          {user.picture_url ? (
            <img 
              src={user.picture_url} 
              alt="Profile" 
              css={styles.avatar}
            />
          ) : (
            <div css={styles.avatarPlaceholder}>
              {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
            </div>
          )}
          <span css={styles.userName}>
            {user.name || user.email.split('@')[0]}
          </span>
        </button>

        {showDropdown && (
          <div css={styles.dropdown}>
            <button 
              css={styles.dropdownItem}
              onClick={handleExportsClick}
            >
              My Exports
            </button>
            <button 
              css={styles.dropdownItem}
              onClick={handleLogout}
            >
              Sign Out
            </button>
          </div>
        )}
      </div>

      {showExports && (
        <div css={styles.exportsOverlay}>
          <div css={styles.exportsModal}>
            <div css={styles.exportsHeader}>
              <h2>My Exports</h2>
              <button 
                css={styles.closeButton}
                onClick={() => setShowExports(false)}
                aria-label="Close exports"
              >
                ×
              </button>
            </div>
            
            <div css={styles.exportsContent}>
              {loading ? (
                <div css={styles.loading}>Loading exports...</div>
              ) : exports.length > 0 ? (
                <div css={styles.exportsList}>
                  {exports.map((exportItem) => (
                    <div key={exportItem.id} css={styles.exportItem}>
                      <div css={styles.exportInfo}>
                        <span css={styles.exportName}>{exportItem.file_name}</span>
                        <span css={styles.exportType}>{exportItem.export_type}</span>
                        <span css={styles.exportDate}>
                          {formatDate(exportItem.created_at)}
                        </span>
                      </div>
                      <a 
                        href={exportItem.file_url}
                        download
                        css={styles.downloadButton}
                      >
                        Download
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div css={styles.noExports}>
                  No exports found. When you export inventory or documents, they&apos;ll appear here.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  userMenu: css`
    position: relative;
    display: inline-block;
  `,

  userButton: css`
    display: flex;
    align-items: center;
    gap: ${layout.spacing.sm};
    padding: ${layout.spacing.sm} ${layout.spacing.md};
    background: linear-gradient(135deg, ${colors.richPurple}60 0%, ${colors.deepNavy}40 100%);
    border: 1px solid ${colors.neonGold}40;
    border-radius: ${layout.borderRadius.lg};
    color: ${colors.textLight};
    cursor: pointer;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
    
    &:hover {
      border-color: ${colors.neonGold}80;
      background: linear-gradient(135deg, ${colors.richPurple}80 0%, ${colors.deepNavy}60 100%);
      box-shadow: 0 4px 20px ${colors.neonGold}20;
      transform: translateY(-1px);
    }
  `,

  userAvatar: css`
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, ${colors.neonTeal} 0%, ${colors.neonGold} 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: ${typography.weights.bold};
    color: ${colors.charcoal};
    font-size: ${typography.sizes.sm};
  `,

  userName: css`
    font-family: ${typography.fonts.primary};
    font-weight: ${typography.weights.medium};
    color: ${colors.textLight};
  `,

  dropdown: css`
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: ${layout.spacing.sm};
    background: linear-gradient(145deg, ${colors.richPurple}90 0%, ${colors.deepNavy}70 100%);
    border: 1px solid ${colors.neonTeal}40;
    border-radius: ${layout.borderRadius.lg};
    box-shadow: 
      0 20px 40px ${colors.charcoal}40,
      inset 0 1px 0 ${colors.neonTeal}20;
    backdrop-filter: blur(15px);
    min-width: 200px;
    z-index: 1000;
    overflow: hidden;
  `,

  dropdownItem: css`
    display: block;
    width: 100%;
    padding: ${layout.spacing.md} ${layout.spacing.lg};
    background: none;
    border: none;
    color: ${colors.textLight};
    text-align: left;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: ${typography.fonts.primary};
    font-size: ${typography.sizes.sm};
    text-decoration: none;
    
    &:hover {
      background: ${colors.neonTeal}20;
      color: ${colors.neonTeal};
    }
    
    &:not(:last-child) {
      border-bottom: 1px solid ${colors.neonTeal}20;
    }
  `,

  exportsOverlay: css`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${colors.charcoal}80;
    backdrop-filter: blur(5px);
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
  `,

  exportsModal: css`
    background: linear-gradient(145deg, ${colors.richPurple}95 0%, ${colors.deepNavy}90 100%);
    border: 2px solid ${colors.neonGold}60;
    border-radius: ${layout.borderRadius.xl};
    width: 90%;
    max-width: 600px;
    max-height: 80vh;
    overflow: hidden;
    box-shadow: 
      0 25px 50px ${colors.charcoal}60,
      inset 0 1px 0 ${colors.neonGold}30;
  `,

  exportsHeader: css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${layout.spacing.lg} ${layout.spacing.xl};
    border-bottom: 1px solid ${colors.neonTeal}30;
    
    h2 {
      font-family: ${typography.fonts.decorative};
      font-size: ${typography.sizes.xl};
      color: ${colors.neonGold};
      margin: 0;
    }
  `,

  closeButton: css`
    background: none;
    border: none;
    color: ${colors.textMuted};
    font-size: ${typography.sizes['2xl']};
    cursor: pointer;
    padding: ${layout.spacing.sm};
    border-radius: ${layout.borderRadius.md};
    transition: all 0.2s ease;
    
    &:hover {
      background: ${colors.neonRed}20;
      color: ${colors.neonRed};
    }
  `,

  exportsContent: css`
    padding: ${layout.spacing.xl};
    max-height: 60vh;
    overflow-y: auto;
  `,

  loading: css`
    text-align: center;
    color: ${colors.textMuted};
    font-style: italic;
    padding: ${layout.spacing.xl};
  `,

  exportsList: css`
    display: flex;
    flex-direction: column;
    gap: ${layout.spacing.md};
  `,

  exportItem: css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${layout.spacing.md};
    background: ${colors.charcoal}30;
    border: 1px solid ${colors.neonTeal}20;
    border-radius: ${layout.borderRadius.md};
    transition: all 0.2s ease;
    
    &:hover {
      border-color: ${colors.neonTeal}40;
      background: ${colors.charcoal}50;
    }
  `,

  exportInfo: css`
    display: flex;
    flex-direction: column;
    gap: ${layout.spacing.xs};
    flex: 1;
  `,

  exportName: css`
    font-weight: ${typography.weights.medium};
    color: ${colors.textLight};
    font-size: ${typography.sizes.sm};
  `,

  exportType: css`
    font-size: ${typography.sizes.xs};
    color: ${colors.neonTeal};
    text-transform: uppercase;
    letter-spacing: 0.05em;
  `,

  exportDate: css`
    font-size: ${typography.sizes.xs};
    color: ${colors.textMuted};
    font-family: ${typography.fonts.mono};
  `,

  downloadButton: css`
    padding: ${layout.spacing.sm} ${layout.spacing.md};
    background: linear-gradient(135deg, ${colors.neonGold} 0%, ${colors.neonTeal} 100%);
    color: ${colors.charcoal};
    text-decoration: none;
    border-radius: ${layout.borderRadius.md};
    font-weight: ${typography.weights.medium};
    font-size: ${typography.sizes.xs};
    transition: all 0.2s ease;
    
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 15px ${colors.neonGold}30;
    }
  `,

  noExports: css`
    text-align: center;
    color: ${colors.textMuted};
    font-style: italic;
    padding: ${layout.spacing.xl};
    border: 1px dashed ${colors.neonTeal}30;
    border-radius: ${layout.borderRadius.md};
    background: ${colors.charcoal}20;
  `,
};

export default UserMenu;
