import React from 'react';
import styles from './styles';

function HowToUseOverlay({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div css={styles.overlay}>
      <div css={styles.modal}>
        <button css={styles.closeButton} onClick={onClose} aria-label="Close" />
        
        <div css={styles.content}>
          <div css={styles.header}>
            <h2>How to Use Bartleby</h2>
          </div>

          <div css={styles.section}>
            <h3>About</h3>
            <p>
              Bartleby is an elegant, one-click-and-done file describer tool that utilizes 
              chatGPT to automatically categorize and describe up to 20 text or image files 
              at a time. It's designed to streamline your inventory management process with 
              powerful AI assistance.
            </p>
          </div>

          <div css={styles.section}>
            <h3>Getting Started</h3>
            <div css={styles.featureList}>
              <div css={styles.featureItem}>
                <h4>Upload Files</h4>
                <p>
                  Select up to 20 files (images or documents) to process. Each file must be 
                  under 25MB.
                </p>
              </div>

              <div css={styles.featureItem}>
                <h4>Image Processing</h4>
                <p>
                  For images, Bartleby creates an elegant image gallery with SEO-optimized 
                  descriptions, dimensions, materials, and suggested MSRP.
                </p>
              </div>

              <div css={styles.featureItem}>
                <h4>Document Processing</h4>
                <p>
                  For documents, Bartleby provides summaries, extracts metadata, and organizes 
                  both category and key tags into a searchable document library.
                </p>
              </div>
            </div>
          </div>

          <div css={styles.section}>
            <h3>Advanced Features</h3>
            <div css={styles.featureList}>
              <div css={styles.featureItem}>
                <h4>Custom Tables</h4>
                <p>
                  Create your own tables with unique headers - Bartleby will adapt its 
                  analysis accordingly.
                </p>
              </div>

              <div css={styles.featureItem}>
                <h4>Semantic Search</h4>
                <p>
                  Use natural language to search through your documents and find exactly 
                  what you need.
                </p>
              </div>

              <div css={styles.featureItem}>
                <h4>Export Options</h4>
                <p>
                  Download your processed data as CSV or Excel files for easy integration 
                  with your existing systems.
                </p>
              </div>
            </div>
          </div>

          <div css={styles.section}>
            <h3>Tips & Tricks</h3>
            <p>
              • Use clear, high-quality images for better analysis<br />
              • Include relevant keywords in your file names<br />
              • Group similar items together for batch processing<br />
              • Regularly export your data for backup purposes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HowToUseOverlay;
