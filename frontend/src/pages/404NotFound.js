import React from 'react';
import { Link } from 'react-router-dom';
import { css } from '@emotion/react';
import { colors } from '../styles/theme/colors';
import { neoDecorocoBase } from '../styles/components/neo-decoroco/base';
import layout from '../styles/layouts/constraints';

const NotFound = () => {
  return (
    <div css={styles.container}>
      <div css={styles.content}>
        <div css={styles.errorCode}>404</div>
        <h1 css={styles.title}>Page Not Found</h1>
        <p css={styles.message}>
          The page you're looking for doesn't exist in the Bartleby universe.
        </p>
        <div css={styles.actions}>
          <Link to="/" css={[neoDecorocoBase.button, styles.homeButton]}>
            🏠 Go Home
          </Link>
          <Link to="/dashboard" css={[neoDecorocoBase.button, styles.dashboardButton]}>
            📊 Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: css`
    min-height: 80vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: ${layout.spacing.lg};
  `,

  content: css`
    text-align: center;
    max-width: 500px;
  `,

  errorCode: css`
    font-size: 6rem;
    font-weight: 700;
    color: ${colors.neonTeal};
    text-shadow: 0 0 30px ${colors.neonTeal}60;
    margin-bottom: ${layout.spacing.lg};
    font-family: "Cinzel Decorative", serif;
  `,

  title: css`
    ${neoDecorocoBase.heading};
    font-size: 2rem;
    margin: 0 0 ${layout.spacing.lg} 0;
  `,

  message: css`
    color: ${colors.textLight};
    font-size: 1.125rem;
    margin: 0 0 ${layout.spacing['2xl']} 0;
    opacity: 0.8;
    line-height: 1.6;
  `,

  actions: css`
    display: flex;
    gap: ${layout.spacing.lg};
    justify-content: center;
    flex-wrap: wrap;
  `,

  homeButton: css`
    background: linear-gradient(135deg, ${colors.neonTeal}, ${colors.primary});
    border: none;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px ${colors.neonTeal}40;
    }
  `,

  dashboardButton: css`
    background: linear-gradient(135deg, ${colors.neonGold}, #DAA520);
    border: none;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px ${colors.neonGold}40;
    }
  `
};

export default NotFound;
