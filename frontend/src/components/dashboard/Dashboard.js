import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { css } from '@emotion/react';
import { AuthContext } from '../../contexts/auth';
import HowToUseOverlay from '../common/HowToUseOverlay';
import { dataApi } from '../../services/api';


const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showHowTo, setShowHowTo] = useState(false);
  const [stats, setStats] = useState({
    documentsProcessed: 0,
    inventoryItems: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch real statistics when component mounts
  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const response = await dataApi.getDashboardStats(user.id);
        setStats(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError('Failed to load statistics');
        // Keep placeholder stats on error
        setStats({
          documentsProcessed: 0,
          inventoryItems: 0,
          recentActivity: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user?.id]);

  return (
    <div css={styles.container}>
      <div css={styles.welcomeSection}>
        <h1 css={styles.welcomeTitle}>
          Welcome back, <span css={styles.userName}>{user?.name || 'User'}</span>
        </h1>
        <p css={styles.welcomeSubtitle}>
          Your AI-powered document and inventory assistant is ready to help
        </p>
      </div>

      <div css={styles.quickActions}>
        <h2 css={styles.sectionTitle}>Quick Actions</h2>
        
        <div css={styles.actionCards}>
          <div 
            css={styles.actionCard}
            onClick={() => navigate('/process')}
          >
            <div css={styles.actionIcon}>⚙️</div>
            <h3 css={styles.actionTitle}>Process Files</h3>
            <p css={styles.actionDescription}>
              Upload and process documents or images
            </p>
            <button css={styles.actionButton}>Start Processing</button>
          </div>
          
          <div 
            css={styles.actionCard}
            onClick={() => navigate('/inventory')}
          >
            <div css={styles.actionIcon}>📦</div>
            <h3 css={styles.actionTitle}>View Inventory</h3>
            <p css={styles.actionDescription}>
              Browse your catalog of processed items
            </p>
            <button css={styles.actionButton}>Open Inventory</button>
          </div>
          
          <div 
            css={styles.actionCard}
            onClick={() => navigate('/documents')}
          >
            <div css={styles.actionIcon}>📄</div>
            <h3 css={styles.actionTitle}>View Documents</h3>
            <p css={styles.actionDescription}>
              Access your processed document library
            </p>
            <button css={styles.actionButton}>Open Documents</button>
          </div>
          
          <div 
            css={styles.actionCard}
            onClick={() => setShowHowTo(true)}
          >
            <div css={styles.actionIcon}>❓</div>
            <h3 css={styles.actionTitle}>How To Use</h3>
            <p css={styles.actionDescription}>
              Learn how to make the most of Bartleby
            </p>
            <button css={styles.actionButton}>View Guide</button>
          </div>
        </div>
      </div>

      <div css={styles.statsSection}>
        <h2 css={styles.sectionTitle}>Your Statistics</h2>
        
        {loading ? (
          <div css={styles.loadingContainer}>
            <div css={styles.loadingSpinner}></div>
            <p css={styles.loadingText}>Loading statistics...</p>
          </div>
        ) : error ? (
          <div css={styles.errorContainer}>
            <p css={styles.errorText}>{error}</p>
          </div>
        ) : (
          <div css={styles.statsGrid}>
            <div css={styles.statCard}>
              <h3 css={styles.statTitle}>Documents Processed</h3>
              <div css={styles.statValue}>{stats.documentsProcessed}</div>
            </div>
            
            <div css={styles.statCard}>
              <h3 css={styles.statTitle}>Inventory Items</h3>
              <div css={styles.statValue}>{stats.inventoryItems}</div>
            </div>
          </div>
        )}
      </div>

      <div css={styles.recentSection}>
        <h2 css={styles.sectionTitle}>Recent Activity</h2>
        
        {loading ? (
          <div css={styles.loadingContainer}>
            <div css={styles.loadingSpinner}></div>
            <p css={styles.loadingText}>Loading recent activity...</p>
          </div>
        ) : stats.recentActivity.length === 0 ? (
          <div css={styles.emptyState}>
            <p css={styles.emptyMessage}>
              No recent activity. Start by processing some files!
            </p>
            <Link to="/process" css={styles.emptyActionButton}>
              Process Files Now
            </Link>
          </div>
        ) : (
          <div css={styles.activityList}>
            {stats.recentActivity.map((activity, index) => (
              <div key={index} css={styles.activityItem}>
                <div css={styles.activityIcon}>
                  {activity.type === 'document' ? '📄' : '📦'}
                </div>
                <div css={styles.activityContent}>
                  <div css={styles.activityName}>{activity.name}</div>
                  <div css={styles.activityType}>
                    {activity.type === 'document' ? 'Document' : 'Inventory Item'}
                  </div>
                  <div css={styles.activityDate}>
                    {activity.created_at ? new Date(activity.created_at).toLocaleDateString() : 'Unknown date'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <HowToUseOverlay isOpen={showHowTo} onClose={() => setShowHowTo(false)} />
    </div>
  );
};

const styles = {
  container: css`
    position: relative;
    min-height: calc(100vh - 80px); /* Adjust for header/navigation height */
    padding: 2rem;
    background: linear-gradient(135deg, #1A1A1A 0%, #2C1F3E 100%);
    overflow: hidden;
  `,
  
  // Decorative elements
  decorElement1: css`
    position: absolute;
    top: 0;
    right: 0;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle at center, rgba(64, 224, 208, 0.1) 0%, transparent 60%);
    z-index: 0;
  `,
  
  decorElement2: css`
    position: absolute;
    bottom: 0;
    left: 0;
    width: 500px;
    height: 500px;
    background: radial-gradient(circle at center, rgba(212, 175, 55, 0.1) 0%, transparent 60%);
    z-index: 0;
  `,
  
  header: css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    position: relative;
    z-index: 1;
    
    @media (max-width: 768px) {
      flex-direction: column;
      align-items: flex-start;
      gap: 1.5rem;
    }
  `,
  
  welcomeTitle: css`
    display: flex;
    flex-direction: column;
  `,
  
  titleTop: css`
    font-family: 'Playfair Display', serif;
    font-size: 1.5rem;
    font-style: italic;
    color: #F5F2E9;
  `,
  
  userName: css`
    font-family: 'Cinzel Decorative', serif;
    font-size: 2.5rem;
    font-weight: 700;
    color: transparent;
    background: linear-gradient(45deg, #D4AF37 30%, #FFF5D4 50%, #D4AF37 70%);
    background-clip: text;
    -webkit-background-clip: text;
    filter: drop-shadow(0 0 5px rgba(212, 175, 55, 0.5));
  `,
  
  quickStats: css`
    display: flex;
    gap: 1.5rem;
  `,
  
  statCard: css`
    background: rgba(26, 26, 26, 0.6);
    backdrop-filter: blur(5px);
    border-radius: 10px;
    padding: 1.2rem 1.8rem;
    border: 1px solid rgba(64, 224, 208, 0.3);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
    align-items: center;
    
    h3 {
      font-family: 'Josefin Sans', sans-serif;
      font-size: 0.9rem;
      font-weight: 400;
      color: #F5F2E9;
      margin: 0 0 0.5rem 0;
    }
    
    p {
      font-family: 'Josefin Sans', sans-serif;
      font-size: 2rem;
      font-weight: 600;
      color: #40E0D0;
      margin: 0;
      text-shadow: 0 0 10px rgba(64, 224, 208, 0.5);
    }
  `,
  
  errorMessage: css`
    background: rgba(146, 71, 71, 0.2);
    border: 1px solid #924747;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1.5rem;
    color: #F5F2E9;
    text-align: center;
    position: relative;
    z-index: 1;
  `,
  
  loadingContainer: css`
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 300px;
    position: relative;
    z-index: 1;
  `,
  
  loadingSpinner: css`
    position: relative;
    width: 150px;
    height: 150px;
    
    &::before {
      content: '';
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      border: 3px solid transparent;
      border-top-color: #40E0D0;
      animation: spin 1s linear infinite;
    }
    
    &::after {
      content: '';
      position: absolute;
      top: 10px;
      left: 10px;
      right: 10px;
      bottom: 10px;
      border-radius: 50%;
      border: 3px solid transparent;
      border-top-color: #D4AF37;
      animation: spin 1.5s linear infinite reverse;
    }
    
    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
  `,
  
  loadingText: css`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-family: 'Cinzel Decorative', serif;
    color: #F5F2E9;
    white-space: nowrap;
    text-align: center;
    font-size: 1rem;
  `,
  
  contentArea: css`
    display: flex;
    flex-direction: column;
    gap: 2rem;
    position: relative;
    z-index: 1;
  `,
  
  actionsPanel: css`
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    
    @media (max-width: 768px) {
      justify-content: center;
    }
  `,
  
  actionButton: css`
    background: rgba(26, 26, 26, 0.6);
    backdrop-filter: blur(5px);
    border: 1px solid rgba(212, 175, 55, 0.3);
    border-radius: 30px;
    padding: 0.8rem 1.5rem;
    color: #F5F2E9;
    font-family: 'Josefin Sans', sans-serif;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    
    &:hover {
      background: rgba(26, 26, 26, 0.8);
      border-color: #D4AF37;
      box-shadow: 0 0 15px rgba(212, 175, 55, 0.3);
      transform: translateY(-2px);
    }
    
    &:active {
      transform: translateY(1px);
    }
  `,
  
  rolodexContainer: css`
    background: rgba(26, 26, 26, 0.4);
    backdrop-filter: blur(10px);
    border-radius: 15px;
    padding: 2rem;
    border: 1px solid rgba(64, 224, 208, 0.2);
    box-shadow: 
      0 10px 30px rgba(0, 0, 0, 0.3),
      0 0 30px rgba(64, 224, 208, 0.1);
    min-height: 500px;
  `,
  
  loadingText: css`
    color: #40E0D0;
    font-family: 'Josefin Sans', sans-serif;
    font-size: 1.1rem;
    margin-left: 1rem;
  `,
  
  errorContainer: css`
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
    position: relative;
    z-index: 1;
  `,
  
  errorText: css`
    color: #924747;
    font-family: 'Josefin Sans', sans-serif;
    font-size: 1.1rem;
    text-align: center;
  `
};

export default Dashboard;