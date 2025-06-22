// File: frontend/src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

// ============================================================================
// DASHBOARD COMPONENT - Main dashboard for inventory management
// ============================================================================
const Dashboard = () => {
  // State management
  const [user, setUser] = useState(null);
  const [inventoryStats, setInventoryStats] = useState({ 
    totalItems: 0, 
    recentUploads: 0, 
    categories: 0 
  });
  const navigate = useNavigate();

  // ========================================================================
  // AUTHENTICATION & DATA FETCHING EFFECTS
  // ========================================================================
  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/');
      return;
    }
    setUser(JSON.parse(userData));
    fetchInventoryStats();
  }, [navigate]);

  // ========================================================================
  // API FUNCTIONS
  // ========================================================================
  const fetchInventoryStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/stats/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const stats = await response.json();
        setInventoryStats(stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // ========================================================================
  // EVENT HANDLERS
  // ========================================================================
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/');
  };

  // ========================================================================
  // LOADING STATE
  // ========================================================================
  if (!user) {
    return (
      <div className="loading-container">
        <p>Loading...</p>
      </div>
    );
  }

  // ========================================================================
  // MAIN RENDER
  // ========================================================================
  return (
    <div className="dashboard">
      {/* Header Section */}
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Instantory Dashboard</h1>
          <div className="user-info">
            <span>Welcome, {user.name}</span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Statistics Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Items</h3>
            <p className="stat-number">{inventoryStats.totalItems}</p>
          </div>
          <div className="stat-card">
            <h3>Recent Uploads</h3>
            <p className="stat-number">{inventoryStats.recentUploads}</p>
          </div>
          <div className="stat-card">
            <h3>Categories</h3>
            <p className="stat-number">{inventoryStats.categories}</p>
          </div>
        </div>

        {/* Action Cards Grid */}
        <div className="action-grid">
          <div className="action-card" onClick={() => navigate('/upload')}>
            <h3>📤 Upload Documents</h3>
            <p>Upload new inventory documents or images</p>
          </div>
          <div className="action-card" onClick={() => navigate('/inventory')}>
            <h3>📋 View Inventory</h3>
            <p>Browse and search your inventory items</p>
          </div>
          <div className="action-card" onClick={() => navigate('/search')}>
            <h3>🔍 Search</h3>
            <p>Find specific items using AI-powered search</p>
          </div>
          <div className="action-card" onClick={() => navigate('/export')}>
            <h3>💾 Export Data</h3>
            <p>Export your inventory in various formats</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

// ============================================================================
// END OF DASHBOARD COMPONENT
// ============================================================================
