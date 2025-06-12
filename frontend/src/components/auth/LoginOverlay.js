import React from 'react';
import { css } from '@emotion/react';
import { colors } from '../../styles/theme/colors';
import { neoDecorocoBase } from '../../styles/components/neo-decoroco/base';
import layout from '../../styles/layouts/constraints';

const LoginOverlay = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div css={styles.overlay}>
      <div css={styles.message}>
        <h2 css={styles.title}>Welcome to Bartleby</h2>
        <p css={styles.text}>
          Please sign in to access your document workspace
        </p>
      </div>
    </div>
  );
};

const styles = {
  overlay: css`
    position: fixed;
    inset: 0;
    background: ${colors.overlay};
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: ${layout.zIndex.overlay};
    backdrop-filter: blur(4px);
  `,

  message: css`
    text-align: center;
    color: ${colors.textLight};
    max-width: 400px;
    padding: 2rem;
  `,

  title: css`
    ${neoDecorocoBase.heading};
    font-size: 2rem;
    margin: 0 0 1rem 0;
  `,

  text: css`
    margin: 0;
    opacity: 0.8;
    font-size: 1.125rem;
  `
};

export default LoginOverlay;
