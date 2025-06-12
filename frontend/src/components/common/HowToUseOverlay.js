import React from 'react';
import { css } from '@emotion/react';
import { colors } from '../../styles/theme/colors';
import { neoDecorocoBase } from '../../styles/components/neo-decoroco/base';
import layout from '../../styles/layouts/constraints';

const HowToUseOverlay = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div css={styles.backdrop} onClick={onClose}>
      <div css={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div css={styles.header}>
          <h2 css={styles.title}>How to Use Bartleby</h2>
          <button css={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <div css={styles.content}>
          <div css={styles.section}>
            <h3 css={styles.sectionTitle}>🚀 Getting Started</h3>
            <p css={styles.text}>
              Bartleby is your AI-powered document organization assistant. Upload documents, 
              images, or paste content to get started with intelligent analysis and categorization.
            </p>
          </div>

          <div css={styles.section}>
            <h3 css={styles.sectionTitle}>📁 Three-Partition Workflow</h3>
            <div css={styles.steps}>
              <div css={styles.step}>
                <div css={styles.stepNumber}>1</div>
                <div css={styles.stepContent}>
                  <strong>Top: Rolodex & Layout Switcher</strong>
                  <p>Switch between table, grid, node-graph, and document browser views</p>
                </div>
              </div>
              
              <div css={styles.step}>
                <div css={styles.stepNumber}>2</div>
                <div css={styles.stepContent}>
                  <strong>Middle: Processing Zone</strong>
                  <p>Upload files, paste URLs, and customize AI instructions for processing</p>
                </div>
              </div>
              
              <div css={styles.step}>
                <div css={styles.stepNumber}>3</div>
                <div css={styles.stepContent}>
                  <strong>Bottom: Results Table</strong>
                  <p>View organized results with hashtags, colors, and relevancy scores</p>
                </div>
              </div>
            </div>
          </div>

          <div css={styles.section}>
            <h3 css={styles.sectionTitle}>🔍 Key Features</h3>
            <div css={styles.features}>
              <div css={styles.feature}>
                <span css={styles.featureIcon}>🤖</span>
                <div>
                  <strong>AI-Powered Analysis</strong>
                  <p>Automatic text extraction, summarization, and classification</p>
                </div>
              </div>
              
              <div css={styles.feature}>
                <span css={styles.featureIcon}>🏷️</span>
                <div>
                  <strong>Smart Tagging</strong>
                  <p>Auto-generated hashtags, emoticons, and relevancy scores</p>
                </div>
              </div>
              
              <div css={styles.feature}>
                <span css={styles.featureIcon}>🔄</span>
                <div>
                  <strong>Multiple Views</strong>
                  <p>Table, grid, graph, and document browser layouts</p>
                </div>
              </div>
              
              <div css={styles.feature}>
                <span css={styles.featureIcon}>⬇️</span>
                <div>
                  <strong>Export Options</strong>
                  <p>Download as CSV, JSON, or visual grid formats</p>
                </div>
              </div>
            </div>
          </div>

          <div css={styles.section}>
            <h3 css={styles.sectionTitle}>💡 Tips</h3>
            <ul css={styles.tipsList}>
              <li>Use custom instructions to guide AI analysis for specific use cases</li>
              <li>Group similar documents by dragging them together</li>
              <li>Use vector search to find related content across all documents</li>
              <li>Switch layouts to find the best view for your workflow</li>
            </ul>
          </div>
        </div>

        <div css={styles.footer}>
          <button css={[neoDecorocoBase.button, styles.primaryButton]} onClick={onClose}>
            Got It!
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  backdrop: css`
    ${neoDecorocoBase.backdrop};
  `,

  modal: css`
    width: 90%;
    max-width: 600px;
    max-height: 90vh;
    background: ${colors.surface};
    border: 1px solid ${colors.border};
    border-radius: ${layout.borderRadius.xl};
    box-shadow: ${layout.shadows.xl};
    overflow: hidden;
    display: flex;
    flex-direction: column;
  `,

  header: css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem;
    border-bottom: 1px solid ${colors.border};
    background: ${colors.glass};
  `,

  title: css`
    ${neoDecorocoBase.heading};
    margin: 0;
    font-size: 1.5rem;
  `,

  closeButton: css`
    background: none;
    border: none;
    color: ${colors.textMuted};
    font-size: 1.25rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: ${layout.borderRadius.base};
    transition: all 0.2s ease;
    
    &:hover {
      background: ${colors.hover};
      color: ${colors.neonRed};
    }
  `,

  content: css`
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
  `,

  section: css`
    margin-bottom: 2rem;
    
    &:last-child {
      margin-bottom: 0;
    }
  `,

  sectionTitle: css`
    color: ${colors.neonTeal};
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0 0 1rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  `,

  text: css`
    color: ${colors.textLight};
    line-height: 1.6;
    margin: 0;
  `,

  steps: css`
    display: flex;
    flex-direction: column;
    gap: 1rem;
  `,

  step: css`
    display: flex;
    gap: 1rem;
    align-items: flex-start;
  `,

  stepNumber: css`
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    background: linear-gradient(135deg, ${colors.neonTeal}, ${colors.neonGold});
    color: ${colors.background};
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    flex-shrink: 0;
  `,

  stepContent: css`
    flex: 1;
    
    strong {
      color: ${colors.neonGold};
      display: block;
      margin-bottom: 0.25rem;
    }
    
    p {
      color: ${colors.textLight};
      margin: 0;
      font-size: 0.9rem;
      opacity: 0.9;
    }
  `,

  features: css`
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  `,

  feature: css`
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
  `,

  featureIcon: css`
    font-size: 1.5rem;
    flex-shrink: 0;
  `,

  tipsList: css`
    color: ${colors.textLight};
    margin: 0;
    padding-left: 1.5rem;
    
    li {
      margin-bottom: 0.5rem;
      line-height: 1.5;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  `,

  footer: css`
    padding: 1.5rem;
    border-top: 1px solid ${colors.border};
    display: flex;
    justify-content: center;
    background: ${colors.glass};
  `,

  primaryButton: css`
    background: linear-gradient(135deg, ${colors.neonTeal}, ${colors.primary});
    border: none;
    padding: 0.75rem 2rem;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px ${colors.neonTeal}40;
    }
  `
};

export default HowToUseOverlay;
