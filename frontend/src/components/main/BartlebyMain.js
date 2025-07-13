import React, { useState, useEffect, useContext } from 'react';
import { css } from '@emotion/react';
import { motion, AnimatePresence } from 'framer-motion';

import { AuthContext } from '../../contexts/auth/index';
import EnhancedRolodex from '../display/EnhancedRolodex';
import { neoDecorocoBase } from '../../styles/components/neo-decoroco/base';
import layout from '../../styles/layouts/constraints';
import { colors } from '../../styles/theme/colors';
import { typography } from '../../styles/theme/typography';

/**
 * BartlebyMain Component
 * Component Genealogy: Control Room -> Command Bridge -> Data Observatory
 * Tripartitioned layout following Bartleby's design philosophy
 * 
 * Layout Structure:
 * ┌─────────────────────────────────────┐
 * │           TOP PARTITION             │ - Status & Navigation
 * │         (Observatory Header)        │
 * ├─────────────────────────────────────┤
 * │                                     │
 * │         MIDDLE PARTITION            │ - Enhanced Rolodex
 * │        (Data Observatory)           │
 * │                                     │
 * ├─────────────────────────────────────┤
 * │          BOTTOM PARTITION           │ - Insights & Controls
 * │       (Intelligence Console)        │
 * └─────────────────────────────────────┘
 */
const BartlebyMain = ({ 
  inventory = [], 
  documents = [],
  onDataRefresh = () => {},
  autoRotateRolodex = true
}) => {
  const { user } = useContext(AuthContext);
  const [currentRolodexView, setCurrentRolodexView] = useState(null);
  const [systemMetrics, setSystemMetrics] = useState({
    totalItems: 0,
    processedItems: 0,
    activeConnections: 0,
    lastUpdate: new Date()
  });
  const [isObservatoryActive, setIsObservatoryActive] = useState(true);

  // Update system metrics when data changes
  useEffect(() => {
    const totalItems = inventory.length + documents.length;
    const processedItems = inventory.filter(item => item.status === 'processed').length + 
                          documents.filter(doc => doc.indexed).length;
    
    setSystemMetrics({
      totalItems,
      processedItems,
      activeConnections: Math.min(totalItems, 8), // Simulated active connections
      lastUpdate: new Date()
    });
  }, [inventory, documents]);

  const handleRolodexViewChange = (viewData) => {
    setCurrentRolodexView(viewData);
  };

  const handleSystemToggle = () => {
    setIsObservatoryActive(!isObservatoryActive);
  };

  const formatLastUpdate = (date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getSystemStatus = () => {
    if (!isObservatoryActive) return { status: 'standby', color: colors.neonPurple };
    if (systemMetrics.totalItems === 0) return { status: 'ready', color: colors.neonGreen };
    if (systemMetrics.processedItems < systemMetrics.totalItems) return { status: 'processing', color: colors.neonGold };
    return { status: 'operational', color: colors.neonTeal };
  };

  const systemStatus = getSystemStatus();

  return (
    <motion.div 
      css={styles.container}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {/* Background Elements */}
      <div css={styles.backgroundElements}>
        <motion.div 
          css={styles.geometricBackground1}
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
          css={styles.geometricBackground2}
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

      {/* TOP PARTITION - Observatory Header */}
      <motion.header 
        css={styles.topPartition}
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <div css={styles.observatoryHeader}>
          {/* System Identity */}
          <div css={styles.systemIdentity}>
            <motion.div 
              css={styles.systemLogo}
              animate={{ 
                boxShadow: [
                  `0 0 20px ${systemStatus.color}30`,
                  `0 0 40px ${systemStatus.color}50`,
                  `0 0 20px ${systemStatus.color}30`
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span css={styles.logoIcon}>🧠</span>
            </motion.div>
            <div css={styles.systemInfo}>
              <h1 css={styles.systemTitle}>Bartleby Observatory</h1>
              <p css={styles.systemSubtitle}>
                Data Intelligence & Analysis Platform
              </p>
            </div>
          </div>

          {/* User Context */}
          {user && (
            <div css={styles.userContext}>
              <div css={styles.userInfo}>
                <span css={styles.userLabel}>Operator:</span>
                <span css={styles.userName}>
                  {user.displayName || user.email}
                </span>
              </div>
              <div css={styles.sessionInfo}>
                <span css={styles.sessionLabel}>Session:</span>
                <span css={styles.sessionTime}>
                  {formatLastUpdate(systemMetrics.lastUpdate)}
                </span>
              </div>
            </div>
          )}

          {/* System Controls */}
          <div css={styles.systemControls}>
            <motion.button
              css={[styles.controlButton, styles.refreshButton]}
              onClick={onDataRefresh}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Refresh data"
            >
              <span css={styles.controlIcon}>🔄</span>
              <span css={styles.controlLabel}>Refresh</span>
            </motion.button>
            
            <motion.button
              css={[
                styles.controlButton, 
                styles.toggleButton,
                !isObservatoryActive && styles.toggleButtonInactive
              ]}
              onClick={handleSystemToggle}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label={isObservatoryActive ? 'Deactivate system' : 'Activate system'}
            >
              <span css={styles.controlIcon}>
                {isObservatoryActive ? '⚡' : '⏸️'}
              </span>
              <span css={styles.controlLabel}>
                {isObservatoryActive ? 'Active' : 'Standby'}
              </span>
            </motion.button>
          </div>
        </div>

        {/* Status Bar */}
        <div css={styles.statusBar}>
          <div css={styles.statusGroup}>
            <div css={[styles.statusIndicator, { '--status-color': systemStatus.color }]}>
              <span css={styles.statusDot} />
              <span css={styles.statusText}>
                System {systemStatus.status.toUpperCase()}
              </span>
            </div>
          </div>

          <div css={styles.metricsGroup}>
            <div css={styles.metric}>
              <span css={styles.metricValue}>{systemMetrics.totalItems}</span>
              <span css={styles.metricLabel}>Total Items</span>
            </div>
            <div css={styles.metric}>
              <span css={styles.metricValue}>{systemMetrics.processedItems}</span>
              <span css={styles.metricLabel}>Processed</span>
            </div>
            <div css={styles.metric}>
              <span css={styles.metricValue}>{systemMetrics.activeConnections}</span>
              <span css={styles.metricLabel}>Connections</span>
            </div>
          </div>

          {currentRolodexView && (
            <div css={styles.currentViewInfo}>
              <span css={styles.currentViewIcon}>
                {currentRolodexView.icon}
              </span>
              <span css={styles.currentViewName}>
                {currentRolodexView.name}
              </span>
            </div>
          )}
        </div>
      </motion.header>

      {/* MIDDLE PARTITION - Data Observatory (Enhanced Rolodex) */}
      <motion.main 
        css={styles.middlePartition}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
      >
        <AnimatePresence mode="wait">
          {isObservatoryActive ? (
            <motion.div
              key="active-rolodex"
              css={styles.rolodexContainer}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
            >
              <EnhancedRolodex
                inventory={inventory}
                documents={documents}
                onViewChange={handleRolodexViewChange}
                autoRotate={autoRotateRolodex}
                autoRotateInterval={6000}
              />
            </motion.div>
          ) : (
            <motion.div
              key="standby-state"
              css={styles.standbyState}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div 
                css={styles.standbyIcon}
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                ⏸️
              </motion.div>
              <h2 css={styles.standbyTitle}>Observatory in Standby Mode</h2>
              <p css={styles.standbyDescription}>
                Data analysis systems are paused. Click "Active" to resume operations.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.main>

      {/* BOTTOM PARTITION - Intelligence Console */}
      <motion.footer 
        css={styles.bottomPartition}
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <div css={styles.intelligenceConsole}>
          {/* Quick Insights */}
          <div css={styles.insightsPanel}>
            <h3 css={styles.panelTitle}>System Insights</h3>
            <div css={styles.insightsList}>
              <div css={styles.insightItem}>
                <span css={styles.insightIcon}>📊</span>
                <div css={styles.insightContent}>
                  <span css={styles.insightLabel}>Data Processing</span>
                  <span css={styles.insightValue}>
                    {systemMetrics.totalItems > 0 
                      ? `${Math.round((systemMetrics.processedItems / systemMetrics.totalItems) * 100)}% Complete`
                      : 'Ready for data'
                    }
                  </span>
                </div>
              </div>

              <div css={styles.insightItem}>
                <span css={styles.insightIcon}>🔍</span>
                <div css={styles.insightContent}>
                  <span css={styles.insightLabel}>Search Index</span>
                  <span css={styles.insightValue}>
                    {documents.length > 0 ? 'Vector database active' : 'Initializing'}
                  </span>
                </div>
              </div>

              <div css={styles.insightItem}>
                <span css={styles.insightIcon}>🧠</span>
                <div css={styles.insightContent}>
                  <span css={styles.insightLabel}>AI Analysis</span>
                  <span css={styles.insightValue}>
                    {isObservatoryActive ? 'Neural networks online' : 'Standby mode'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* System Diagnostics */}
          <div css={styles.diagnosticsPanel}>
            <h3 css={styles.panelTitle}>System Diagnostics</h3>
            <div css={styles.diagnosticsList}>
              <div css={styles.diagnosticItem}>
                <span css={styles.diagnosticLabel}>Memory Usage:</span>
                <div css={styles.progressBar}>
                  <motion.div 
                    css={styles.progressFill}
                    initial={{ width: '0%' }}
                    animate={{ width: '67%' }}
                    transition={{ delay: 1, duration: 2 }}
                  />
                </div>
                <span css={styles.diagnosticValue}>67%</span>
              </div>

              <div css={styles.diagnosticItem}>
                <span css={styles.diagnosticLabel}>Processing Queue:</span>
                <div css={styles.progressBar}>
                  <motion.div 
                    css={styles.progressFill}
                    initial={{ width: '0%' }}
                    animate={{ 
                      width: systemMetrics.totalItems > 0 
                        ? `${(systemMetrics.processedItems / systemMetrics.totalItems) * 100}%`
                        : '0%'
                    }}
                    transition={{ delay: 1.2, duration: 2 }}
                  />
                </div>
                <span css={styles.diagnosticValue}>
                  {systemMetrics.totalItems > 0 
                    ? `${Math.round((systemMetrics.processedItems / systemMetrics.totalItems) * 100)}%`
                    : '0%'
                  }
                </span>
              </div>

              <div css={styles.diagnosticItem}>
                <span css={styles.diagnosticLabel}>Network Status:</span>
                <div css={styles.progressBar}>
                  <motion.div 
                    css={styles.progressFill}
                    initial={{ width: '0%' }}
                    animate={{ width: '94%' }}
                    transition={{ delay: 1.4, duration: 2 }}
                  />
                </div>
                <span css={styles.diagnosticValue}>94%</span>
              </div>
            </div>
          </div>
        </div>
      </motion.footer>
    </motion.div>
  );
};

const styles = {
  container: css`
    ${layout.patterns.threePartition}
    position: relative;
    min-height: 100vh;
    background: ${colors.darkGradient};
    color: ${colors.textLight};
    overflow: hidden;
  `,

  backgroundElements: css`
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 0;
  `,

  geometricBackground1: css`
    position: absolute;
    top: 5%;
    right: 10%;
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
      top: 2%;
      right: 5%;
    }
  `,

  geometricBackground2: css`
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

  /* TOP PARTITION */
  topPartition: css`
    grid-area: top;
    position: relative;
    z-index: 2;
    padding: ${layout.spacing.lg};
    background: linear-gradient(135deg, 
      rgba(26, 26, 46, 0.95) 0%, 
      rgba(20, 20, 40, 0.98) 100%);
    border-bottom: 2px solid ${colors.border};
    backdrop-filter: blur(20px);

    ${layout.media.mobile} {
      padding: ${layout.spacing.md};
    }
  `,

  observatoryHeader: css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: ${layout.spacing.lg};

    ${layout.media.mobile} {
      flex-direction: column;
      gap: ${layout.spacing.md};
      align-items: stretch;
    }
  `,

  systemIdentity: css`
    display: flex;
    align-items: center;
    gap: ${layout.spacing.lg};
  `,

  systemLogo: css`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, 
      ${colors.neonGold}20 0%, 
      ${colors.neonTeal}20 100%);
    border: 2px solid ${colors.neonGold};
    border-radius: 50%;
    transition: all 0.3s ease;

    ${layout.media.mobile} {
      width: 50px;
      height: 50px;
    }
  `,

  logoIcon: css`
    font-size: ${typography.sizes['2xl']};
    filter: drop-shadow(0 0 10px currentColor);

    ${layout.media.mobile} {
      font-size: ${typography.sizes.xl};
    }
  `,

  systemInfo: css`
    display: flex;
    flex-direction: column;
    gap: ${layout.spacing.xs};
  `,

  systemTitle: css`
    margin: 0;
    font-family: ${typography.fonts.decorative};
    font-size: ${typography.sizes['3xl']};
    font-weight: ${typography.weights.black};
    color: ${colors.neonGold};
    text-shadow: 0 0 15px ${colors.neonGold}50;
    letter-spacing: 0.05em;

    ${layout.media.mobile} {
      font-size: ${typography.sizes['2xl']};
    }
  `,

  systemSubtitle: css`
    margin: 0;
    font-family: ${typography.fonts.mono};
    font-size: ${typography.sizes.sm};
    color: ${colors.neonTeal};
    text-transform: uppercase;
    letter-spacing: 0.1em;
    opacity: 0.8;

    ${layout.media.mobile} {
      font-size: ${typography.sizes.xs};
    }
  `,

  userContext: css`
    display: flex;
    flex-direction: column;
    gap: ${layout.spacing.xs};
    text-align: right;

    ${layout.media.mobile} {
      text-align: left;
    }
  `,

  userInfo: css`
    display: flex;
    align-items: center;
    gap: ${layout.spacing.sm};

    ${layout.media.mobile} {
      justify-content: space-between;
    }
  `,

  userLabel: css`
    font-family: ${typography.fonts.mono};
    font-size: ${typography.sizes.xs};
    color: ${colors.textMuted};
    text-transform: uppercase;
    letter-spacing: 0.1em;
  `,

  userName: css`
    font-family: ${typography.fonts.primary};
    font-size: ${typography.sizes.sm};
    color: ${colors.neonTeal};
    font-weight: ${typography.weights.semibold};
  `,

  sessionInfo: css`
    display: flex;
    align-items: center;
    gap: ${layout.spacing.sm};

    ${layout.media.mobile} {
      justify-content: space-between;
    }
  `,

  sessionLabel: css`
    font-family: ${typography.fonts.mono};
    font-size: ${typography.sizes.xs};
    color: ${colors.textMuted};
    text-transform: uppercase;
    letter-spacing: 0.1em;
  `,

  sessionTime: css`
    font-family: ${typography.fonts.mono};
    font-size: ${typography.sizes.sm};
    color: ${colors.textLight};
    font-weight: ${typography.weights.medium};
  `,

  systemControls: css`
    display: flex;
    gap: ${layout.spacing.md};

    ${layout.media.mobile} {
      justify-content: center;
    }
  `,

  controlButton: css`
    ${neoDecorocoBase.button}
    display: flex;
    align-items: center;
    gap: ${layout.spacing.sm};
    padding: ${layout.spacing.md} ${layout.spacing.lg};
    background: linear-gradient(135deg, 
      rgba(26, 26, 46, 0.8) 0%, 
      rgba(20, 20, 40, 0.9) 100%);
    border: 2px solid ${colors.border};
    border-radius: ${layout.borderRadius.lg};
    color: ${colors.textLight};
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      border-color: ${colors.neonTeal};
      color: ${colors.neonTeal};
      box-shadow: 0 0 15px ${colors.neonTeal}30;
    }
  `,

  refreshButton: css`
    &:hover {
      border-color: ${colors.neonGold};
      color: ${colors.neonGold};
      box-shadow: 0 0 15px ${colors.neonGold}30;
    }
  `,

  toggleButton: css`
    &:hover {
      border-color: ${colors.neonGreen};
      color: ${colors.neonGreen};
      box-shadow: 0 0 15px ${colors.neonGreen}30;
    }
  `,

  toggleButtonInactive: css`
    border-color: ${colors.neonPurple};
    color: ${colors.neonPurple};
    
    &:hover {
      border-color: ${colors.neonPurple};
      color: ${colors.neonPurple};
      box-shadow: 0 0 15px ${colors.neonPurple}30;
    }
  `,

  controlIcon: css`
    font-size: ${typography.sizes.lg};
    filter: drop-shadow(0 0 8px currentColor);
  `,

  controlLabel: css`
    font-family: ${typography.fonts.mono};
    font-size: ${typography.sizes.sm};
    text-transform: uppercase;
    letter-spacing: 0.05em;
  `,

  statusBar: css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: ${layout.spacing.md} ${layout.spacing.lg};
    background: linear-gradient(
      90deg,
      rgba(0, 0, 0, 0.2) 0%,
      rgba(255, 255, 255, 0.05) 50%,
      rgba(0, 0, 0, 0.2) 100%
    );
    border: 1px solid ${colors.border};
    border-radius: ${layout.borderRadius.lg};
    backdrop-filter: blur(10px);

    ${layout.media.mobile} {
      flex-direction: column;
      gap: ${layout.spacing.md};
      padding: ${layout.spacing.md};
    }
  `,

  statusGroup: css`
    display: flex;
    align-items: center;
    gap: ${layout.spacing.lg};
  `,

  statusIndicator: css`
    display: flex;
    align-items: center;
    gap: ${layout.spacing.sm};
  `,

  statusDot: css`
    width: 12px;
    height: 12px;
    background: var(--status-color, ${colors.neonTeal});
    border-radius: 50%;
    box-shadow: 0 0 15px var(--status-color, ${colors.neonTeal});
    animation: pulse 2s infinite;

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }
  `,

  statusText: css`
    font-family: ${typography.fonts.mono};
    font-size: ${typography.sizes.sm};
    color: var(--status-color, ${colors.neonTeal});
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: ${typography.weights.semibold};

    ${layout.media.mobile} {
      font-size: ${typography.sizes.xs};
    }
  `,

  metricsGroup: css`
    display: flex;
    gap: ${layout.spacing.xl};

    ${layout.media.mobile} {
      gap: ${layout.spacing.lg};
      justify-content: space-around;
      width: 100%;
    }
  `,

  metric: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${layout.spacing.xs};
  `,

  metricValue: css`
    font-family: ${typography.fonts.mono};
    font-size: ${typography.sizes.xl};
    font-weight: ${typography.weights.bold};
    color: ${colors.neonTeal};
    text-shadow: 0 0 8px ${colors.neonTeal}40;

    ${layout.media.mobile} {
      font-size: ${typography.sizes.lg};
    }
  `,

  metricLabel: css`
    font-family: ${typography.fonts.mono};
    font-size: ${typography.sizes.xs};
    color: ${colors.textMuted};
    text-transform: uppercase;
    letter-spacing: 0.1em;
  `,

  currentViewInfo: css`
    display: flex;
    align-items: center;
    gap: ${layout.spacing.sm};
  `,

  currentViewIcon: css`
    font-size: ${typography.sizes.lg};
    filter: drop-shadow(0 0 8px currentColor);
  `,

  currentViewName: css`
    font-family: ${typography.fonts.primary};
    font-size: ${typography.sizes.sm};
    color: ${colors.textLight};
    font-weight: ${typography.weights.medium};
  `,

  /* MIDDLE PARTITION */
  middlePartition: css`
    grid-area: middle;
    position: relative;
    z-index: 1;
    padding: ${layout.spacing.lg};
    display: flex;
    align-items: center;
    justify-content: center;

    ${layout.media.mobile} {
      padding: ${layout.spacing.md};
    }
  `,

  rolodexContainer: css`
    width: 100%;
    height: 100%;
    max-width: 1200px;
  `,

  standbyState: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    gap: ${layout.spacing.xl};
    padding: ${layout.spacing['3xl']};
    background: linear-gradient(135deg, 
      rgba(26, 26, 46, 0.7) 0%, 
      rgba(20, 20, 40, 0.8) 100%);
    border: 2px solid ${colors.neonPurple};
    border-radius: ${layout.borderRadius['2xl']};
    backdrop-filter: blur(15px);

    ${layout.media.mobile} {
      padding: ${layout.spacing['2xl']};
    }
  `,

  standbyIcon: css`
    font-size: ${typography.sizes['6xl']};
    color: ${colors.neonPurple};
    filter: drop-shadow(0 0 20px ${colors.neonPurple});

    ${layout.media.mobile} {
      font-size: ${typography.sizes['4xl']};
    }
  `,

  standbyTitle: css`
    margin: 0;
    font-family: ${typography.fonts.decorative};
    font-size: ${typography.sizes['3xl']};
    font-weight: ${typography.weights.black};
    color: ${colors.neonPurple};
    text-shadow: 0 0 15px ${colors.neonPurple}50;

    ${layout.media.mobile} {
      font-size: ${typography.sizes['2xl']};
    }
  `,

  standbyDescription: css`
    margin: 0;
    font-family: ${typography.fonts.primary};
    font-size: ${typography.sizes.lg};
    color: ${colors.textLight};
    opacity: 0.8;
    max-width: 500px;

    ${layout.media.mobile} {
      font-size: ${typography.sizes.base};
    }
  `,

  /* BOTTOM PARTITION */
  bottomPartition: css`
    grid-area: bottom;
    position: relative;
    z-index: 2;
    padding: ${layout.spacing.lg};
    background: linear-gradient(135deg, 
      rgba(15, 15, 35, 0.95) 0%, 
      rgba(10, 10, 30, 0.98) 100%);
    border-top: 2px solid ${colors.border};
    backdrop-filter: blur(20px);

    ${layout.media.mobile} {
      padding: ${layout.spacing.md};
    }
  `,

  intelligenceConsole: css`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: ${layout.spacing.xl};

    ${layout.media.mobile} {
      grid-template-columns: 1fr;
      gap: ${layout.spacing.lg};
    }
  `,

  insightsPanel: css`
    padding: ${layout.spacing.lg};
    background: rgba(26, 26, 46, 0.6);
    border: 1px solid ${colors.border};
    border-radius: ${layout.borderRadius.xl};
    backdrop-filter: blur(10px);
  `,

  diagnosticsPanel: css`
    padding: ${layout.spacing.lg};
    background: rgba(26, 26, 46, 0.6);
    border: 1px solid ${colors.border};
    border-radius: ${layout.borderRadius.xl};
    backdrop-filter: blur(10px);
  `,

  panelTitle: css`
    margin: 0 0 ${layout.spacing.lg} 0;
    font-family: ${typography.fonts.heading};
    font-size: ${typography.sizes.xl};
    color: ${colors.neonTeal};
    text-shadow: 0 0 10px ${colors.neonTeal}40;

    ${layout.media.mobile} {
      font-size: ${typography.sizes.lg};
    }
  `,

  insightsList: css`
    display: flex;
    flex-direction: column;
    gap: ${layout.spacing.md};
  `,

  insightItem: css`
    display: flex;
    align-items: center;
    gap: ${layout.spacing.md};
    padding: ${layout.spacing.md};
    background: rgba(0, 0, 0, 0.2);
    border-radius: ${layout.borderRadius.lg};
    border: 1px solid ${colors.border};
  `,

  insightIcon: css`
    font-size: ${typography.sizes.xl};
    filter: drop-shadow(0 0 8px currentColor);
  `,

  insightContent: css`
    display: flex;
    flex-direction: column;
    gap: ${layout.spacing.xs};
    flex: 1;
  `,

  insightLabel: css`
    font-family: ${typography.fonts.mono};
    font-size: ${typography.sizes.sm};
    color: ${colors.textMuted};
    text-transform: uppercase;
    letter-spacing: 0.05em;

    ${layout.media.mobile} {
      font-size: ${typography.sizes.xs};
    }
  `,

  insightValue: css`
    font-family: ${typography.fonts.primary};
    font-size: ${typography.sizes.base};
    color: ${colors.textLight};
    font-weight: ${typography.weights.medium};

    ${layout.media.mobile} {
      font-size: ${typography.sizes.sm};
    }
  `,

  diagnosticsList: css`
    display: flex;
    flex-direction: column;
    gap: ${layout.spacing.lg};
  `,

  diagnosticItem: css`
    display: flex;
    align-items: center;
    gap: ${layout.spacing.md};
  `,

  diagnosticLabel: css`
    font-family: ${typography.fonts.mono};
    font-size: ${typography.sizes.sm};
    color: ${colors.textMuted};
    min-width: 120px;
    text-transform: uppercase;
    letter-spacing: 0.05em;

    ${layout.media.mobile} {
      font-size: ${typography.sizes.xs};
      min-width: 100px;
    }
  `,

  progressBar: css`
    flex: 1;
    height: 8px;
    background: rgba(0, 0, 0, 0.4);
    border-radius: 4px;
    overflow: hidden;
    border: 1px solid ${colors.border};
  `,

  progressFill: css`
    height: 100%;
    background: linear-gradient(90deg, 
      ${colors.neonTeal} 0%, 
      ${colors.neonGold} 100%);
    border-radius: inherit;
    box-shadow: 0 0 10px ${colors.neonTeal}40;
  `,

  diagnosticValue: css`
    font-family: ${typography.fonts.mono};
    font-size: ${typography.sizes.sm};
    color: ${colors.neonTeal};
    font-weight: ${typography.weights.semibold};
    min-width: 40px;
    text-align: right;

    ${layout.media.mobile} {
      font-size: ${typography.sizes.xs};
    }
  `,
};

export default BartlebyMain;
