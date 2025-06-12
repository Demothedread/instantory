import React from 'react';
import { css } from '@emotion/react';
import { colors } from '../../styles/theme/colors';
import { neoDecorocoBase } from '../../styles/components/neo-decoroco/base';
import layout from '../../styles/layouts/constraints';

const Dashboard = () => {
  return (
    <div css={styles.container}>
      <div css={styles.header}>
        <h1 css={styles.title}>Dashboard</h1>
        <p css={styles.subtitle}>
          Welcome to your Bartleby workspace
        </p>
      </div>

      <div css={styles.grid}>
        <div css={[neoDecorocoBase.card, styles.card]}>
          <div css={styles.cardHeader}>
            <h3 css={styles.cardTitle}>📊 Quick Stats</h3>
          </div>
          <div css={styles.stats}>
            <div css={styles.stat}>
              <span css={styles.statNumber}>0</span>
              <span css={styles.statLabel}>Documents</span>
            </div>
            <div css={styles.stat}>
              <span css={styles.statNumber}>0</span>
              <span css={styles.statLabel}>Items</span>
            </div>
            <div css={styles.stat}>
              <span css={styles.statNumber}>0</span>
              <span css={styles.statLabel}>Processed</span>
            </div>
          </div>
        </div>

        <div css={[neoDecorocoBase.card, styles.card]}>
          <div css={styles.cardHeader}>
            <h3 css={styles.cardTitle}>🚀 Quick Actions</h3>
          </div>
          <div css={styles.actions}>
            <button css={[neoDecorocoBase.button, styles.actionButton]}>
              📄 Upload Documents
            </button>
            <button css={[neoDecorocoBase.button, styles.actionButton]}>
              📦 Add Inventory
            </button>
            <button css={[neoDecorocoBase.button, styles.actionButton]}>
              ⚙️ Process Files
            </button>
          </div>
        </div>

        <div css={[neoDecorocoBase.card, styles.card, styles.fullWidth]}>
          <div css={styles.cardHeader}>
            <h3 css={styles.cardTitle}>📈 Recent Activity</h3>
          </div>
          <div css={styles.activity}>
            <div css={styles.emptyState}>
              <span css={styles.emptyIcon}>📭</span>
              <p css={styles.emptyText}>No recent activity</p>
              <p css={styles.emptySubtext}>
                Upload some documents or add inventory items to get started
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: css`
    max-width: 1200px;
    margin: 0 auto;
    padding: ${layout.spacing.lg};
  `,

  header: css`
    margin-bottom: ${layout.spacing['2xl']};
    text-align: center;
  `,

  title: css`
    ${neoDecorocoBase.heading};
    font-size: 2.5rem;
    margin: 0 0 ${layout.spacing.md} 0;
  `,

  subtitle: css`
    color: ${colors.textMuted};
    font-size: 1.125rem;
    margin: 0;
  `,

  grid: css`
    display: grid;
    gap: ${layout.spacing.xl};
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  `,

  card: css`
    height: fit-content;
  `,

  fullWidth: css`
    grid-column: 1 / -1;
  `,

  cardHeader: css`
    margin-bottom: ${layout.spacing.lg};
  `,

  cardTitle: css`
    color: ${colors.neonTeal};
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0;
    display: flex;
    align-items: center;
    gap: ${layout.spacing.sm};
  `,

  stats: css`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: ${layout.spacing.lg};
  `,

  stat: css`
    text-align: center;
    padding: ${layout.spacing.lg};
    background: ${colors.glass};
    border-radius: ${layout.borderRadius.lg};
    border: 1px solid ${colors.border};
  `,

  statNumber: css`
    display: block;
    font-size: 2rem;
    font-weight: 700;
    color: ${colors.neonGold};
    margin-bottom: ${layout.spacing.sm};
  `,

  statLabel: css`
    color: ${colors.textLight};
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  `,

  actions: css`
    display: flex;
    flex-direction: column;
    gap: ${layout.spacing.md};
  `,

  actionButton: css`
    justify-content: flex-start;
    text-align: left;
  `,

  activity: css`
    min-height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
  `,

  emptyState: css`
    text-align: center;
    color: ${colors.textMuted};
  `,

  emptyIcon: css`
    font-size: 3rem;
    display: block;
    margin-bottom: ${layout.spacing.lg};
  `,

  emptyText: css`
    font-size: 1.125rem;
    font-weight: 500;
    margin: 0 0 ${layout.spacing.sm} 0;
    color: ${colors.textLight};
  `,

  emptySubtext: css`
    margin: 0;
    font-size: 0.875rem;
  `
};

export default Dashboard;
