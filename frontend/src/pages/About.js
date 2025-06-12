import React from 'react';
import { css } from '@emotion/react';
import { colors } from '../styles/theme/colors';
import { neoDecorocoBase } from '../styles/components/neo-decoroco/base';
import layout from '../styles/layouts/constraints';

const About = () => {
  return (
    <div css={styles.container}>
      <div css={styles.header}>
        <h1 css={styles.title}>About Bartleby</h1>
        <p css={styles.subtitle}>
          Your AI-powered document organization assistant
        </p>
      </div>

      <div css={styles.content}>
        <div css={[neoDecorocoBase.card, styles.section]}>
          <h2 css={styles.sectionTitle}>🤖 What is Bartleby?</h2>
          <p css={styles.text}>
            Bartleby is an AI-powered "organize, summarize, analyze" database-builder 
            designed for researchers, lawyers, and entrepreneurs. It provides a 
            one-click-and-done experience that's highly adaptable to your needs.
          </p>
        </div>

        <div css={[neoDecorocoBase.card, styles.section]}>
          <h2 css={styles.sectionTitle}>🎯 Core Features</h2>
          <ul css={styles.featureList}>
            <li>AI-powered document extraction and summarization</li>
            <li>Intelligent classification with hashtags and relevancy scores</li>
            <li>Multiple view layouts: table, grid, node-graph, document browser</li>
            <li>Vector search for semantic document discovery</li>
            <li>Downloadable structured data (CSV, JSON, visual grids)</li>
            <li>Adaptive UI that adjusts to your project context</li>
          </ul>
        </div>

        <div css={[neoDecorocoBase.card, styles.section]}>
          <h2 css={styles.sectionTitle}>🏗️ Three-Partition Workflow</h2>
          <div css={styles.workflow}>
            <div css={styles.workflowStep}>
              <div css={styles.stepNumber}>1</div>
              <div css={styles.stepContent}>
                <h3>Rolodex & Layout Switcher</h3>
                <p>Switch between different visualizations and finishes</p>
              </div>
            </div>
            <div css={styles.workflowStep}>
              <div css={styles.stepNumber}>2</div>
              <div css={styles.stepContent}>
                <h3>Processing Zone</h3>
                <p>Upload files, paste URLs, customize AI instructions</p>
              </div>
            </div>
            <div css={styles.workflowStep}>
              <div css={styles.stepNumber}>3</div>
              <div css={styles.stepContent}>
                <h3>Results Table</h3>
                <p>View organized, searchable results with metadata</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: css`
    max-width: 800px;
    margin: 0 auto;
    padding: ${layout.spacing.lg};
  `,

  header: css`
    text-align: center;
    margin-bottom: ${layout.spacing['2xl']};
  `,

  title: css`
    ${neoDecorocoBase.heading};
    font-size: 2.5rem;
    margin: 0 0 ${layout.spacing.md} 0;
  `,

  subtitle: css`
    color: ${colors.textMuted};
    font-size: 1.25rem;
    margin: 0;
  `,

  content: css`
    display: flex;
    flex-direction: column;
    gap: ${layout.spacing.xl};
  `,

  section: css`
    padding: ${layout.spacing.xl};
  `,

  sectionTitle: css`
    color: ${colors.neonTeal};
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0 0 ${layout.spacing.lg} 0;
  `,

  text: css`
    color: ${colors.textLight};
    line-height: 1.6;
    margin: 0;
  `,

  featureList: css`
    color: ${colors.textLight};
    line-height: 1.6;
    margin: 0;
    padding-left: ${layout.spacing.lg};
    
    li {
      margin-bottom: ${layout.spacing.sm};
    }
  `,

  workflow: css`
    display: flex;
    flex-direction: column;
    gap: ${layout.spacing.lg};
  `,

  workflowStep: css`
    display: flex;
    gap: ${layout.spacing.lg};
    align-items: flex-start;
  `,

  stepNumber: css`
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    background: linear-gradient(135deg, ${colors.neonTeal}, ${colors.neonGold});
    color: ${colors.background};
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 1.125rem;
    flex-shrink: 0;
  `,

  stepContent: css`
    flex: 1;
    
    h3 {
      color: ${colors.neonGold};
      font-size: 1.125rem;
      font-weight: 600;
      margin: 0 0 ${layout.spacing.sm} 0;
    }
    
    p {
      color: ${colors.textLight};
      margin: 0;
      opacity: 0.9;
    }
  `
};

export default About;
