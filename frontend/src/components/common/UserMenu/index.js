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
    <div css={styles.container}>
      <div css={styles.menu}>
        <button 
          css={styles.button}
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
          <span css={styles.name}>
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

export default UserMenu;
