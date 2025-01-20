import React, { useState } from 'react';
import config from '../config';
import './UserMenu.css';

function UserMenu({ user, onLogout }) {
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

  return (
    <div className="user-menu-container">
      <div className="user-menu">
        <button 
          className="user-button neo-decoroco-button"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          {user.picture_url ? (
            <img 
              src={user.picture_url} 
              alt="Profile" 
              className="user-avatar"
            />
          ) : (
            <div className="user-avatar-placeholder">
              {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
            </div>
          )}
          <span className="user-name">
            {user.name || user.email.split('@')[0]}
          </span>
        </button>

        {showDropdown && (
          <div className="user-dropdown neo-decoroco-panel">
            <button 
              className="dropdown-item neo-decoroco-button"
              onClick={handleExportsClick}
            >
              My Exports
            </button>
            <button 
              className="dropdown-item neo-decoroco-button"
              onClick={() => {
                localStorage.removeItem('user');
                onLogout();
              }}
            >
              Sign Out
            </button>
          </div>
        )}
      </div>

      {showExports && (
        <div className="exports-overlay">
          <div className="exports-modal neo-decoroco-panel">
            <div className="exports-header">
              <h2>My Exports</h2>
              <button 
                className="close-button neo-decoroco-button"
                onClick={() => setShowExports(false)}
              >
                ×
              </button>
            </div>
            
            <div className="exports-content">
              {loading ? (
                <div className="loading">Loading exports...</div>
              ) : exports.length > 0 ? (
                <div className="exports-list">
                  {exports.map((exportItem) => (
                    <div key={exportItem.id} className="export-item neo-decoroco-panel">
                      <div className="export-info">
                        <span className="export-name">{exportItem.file_name}</span>
                        <span className="export-type">{exportItem.export_type}</span>
                        <span className="export-date">
                          {formatDate(exportItem.created_at)}
                        </span>
                      </div>
                      <a 
                        href={exportItem.file_url}
                        download
                        className="download-button neo-decoroco-button"
                      >
                        Download
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-exports">
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
