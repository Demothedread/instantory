import { css } from '@emotion/react';
import { useState } from 'react';
import { neoDecorocoBase } from '../../styles/components/neo-decoroco/base';
import layout from '../../styles/layouts/constraints';
import { colors } from '../../styles/theme/colors';

const ProcessHub = ({ onProcessComplete }) => {
  const [files, setFiles] = useState([]);
  const [instructions, setInstructions] = useState('');
  const [processing, setProcessing] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  const handleFileUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...uploadedFiles]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const parseUrlsFromInstructions = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.match(urlRegex) || [];
  };

  const handleProcess = async () => {
    setProcessing(true);
    try {
      // Parse URLs from instructions
      const urls = parseUrlsFromInstructions(instructions + ' ' + urlInput);
      
      // TODO: Implement actual processing logic
      // This would send files and URLs to the backend for AI processing
      console.log('Processing files:', files);
      console.log('Processing URLs:', urls);
      console.log('Instructions:', instructions);
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Clear files after processing
      setFiles([]);
      setInstructions('');
      setUrlInput('');
      
      // Notify parent component to refresh data
      onProcessComplete?.();
      
      // Show success message
      alert('Processing complete! Check the results table below.');
    } catch (error) {
      console.error('Processing error:', error);
      alert('Processing failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div css={styles.container}>
      <div css={styles.header}>
        <h1 css={styles.title}>Processing Hub</h1>
        <p css={styles.subtitle}>
          Upload files and customize AI instructions for intelligent analysis
        </p>
      </div>

      <div css={styles.threePartition}>
        {/* Top Partition: Rolodex & Layout Switcher */}
        <div css={[neoDecorocoBase.card, styles.topPartition]}>
          <h2 css={styles.partitionTitle}>🎛️ Rolodex & Layout Switcher</h2>
          <div css={styles.layoutOptions}>
            <button css={[neoDecorocoBase.button, styles.layoutButton]}>
              📊 Table View
            </button>
            <button css={[neoDecorocoBase.button, styles.layoutButton]}>
              🔲 Grid View
            </button>
            <button css={[neoDecorocoBase.button, styles.layoutButton]}>
              🕸️ Node Graph
            </button>
            <button css={[neoDecorocoBase.button, styles.layoutButton]}>
              📄 Document Browser
            </button>
          </div>
        </div>

        {/* Middle Partition: Processing Zone */}
        <div css={[neoDecorocoBase.card, styles.middlePartition]}>
          <h2 css={styles.partitionTitle}>⚙️ Processing Zone</h2>
          
          <div css={styles.uploadSection}>
            <div css={styles.uploadArea}>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                css={styles.fileInput}
                id="file-upload"
              />
              <label htmlFor="file-upload" css={styles.uploadLabel}>
                <div css={styles.uploadIcon}>📁</div>
                <div css={styles.uploadText}>
                  <p>Drop files here or click to upload</p>
                  <p css={styles.uploadSubtext}>
                    Supports documents, images, and more
                  </p>
                </div>
              </label>
            </div>

            <div css={styles.instructionsSection}>
              <label css={styles.label}>AI Instructions:</label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Customize how AI should analyze your files..."
                css={styles.textarea}
                rows={3}
              />
            </div>
          </div>

          {/* Waiting Room */}
          <div css={styles.waitingRoom}>
            <h3 css={styles.waitingTitle}>📋 Waiting Room</h3>
            {files.length === 0 ? (
              <p css={styles.emptyText}>No files queued for processing</p>
            ) : (
              <div css={styles.fileList}>
                {files.map((file, index) => (
                  <div key={index} css={styles.fileItem}>
                    <span css={styles.fileName}>{file.name}</span>
                    <span css={styles.fileSize}>
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                    <button
                      onClick={() => removeFile(index)}
                      css={styles.removeButton}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {files.length > 0 && (
              <button
                onClick={handleProcess}
                disabled={processing}
                css={[neoDecorocoBase.button, styles.processButton]}
              >
                {processing ? '⚙️ Processing...' : '🚀 Start Processing'}
              </button>
            )}
          </div>
        </div>

        {/* Bottom Partition: Results Preview */}
        <div css={[neoDecorocoBase.card, styles.bottomPartition]}>
          <h2 css={styles.partitionTitle}>📊 Results Table</h2>
          <div css={styles.resultsPreview}>
            <div css={styles.emptyResults}>
              <span css={styles.emptyIcon}>📭</span>
              <p css={styles.emptyText}>No results yet</p>
              <p css={styles.emptySubtext}>
                Process some files to see organized results with hashtags, colors, and relevancy scores
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
    font-size: 1.125rem;
    margin: 0;
  `,

  threePartition: css`
    display: grid;
    gap: ${layout.spacing.xl};
    grid-template-rows: auto 1fr auto;
    min-height: 60vh;
  `,

  topPartition: css`
    padding: ${layout.spacing.lg};
  `,

  middlePartition: css`
    padding: ${layout.spacing.lg};
  `,

  bottomPartition: css`
    padding: ${layout.spacing.lg};
    min-height: 200px;
  `,

  partitionTitle: css`
    color: ${colors.neonTeal};
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0 0 ${layout.spacing.lg} 0;
    display: flex;
    align-items: center;
    gap: ${layout.spacing.sm};
  `,

  layoutOptions: css`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: ${layout.spacing.md};
  `,

  layoutButton: css`
    justify-content: center;
    text-align: center;
  `,

  uploadSection: css`
    display: grid;
    gap: ${layout.spacing.lg};
    margin-bottom: ${layout.spacing.xl};
  `,

  uploadArea: css`
    position: relative;
  `,

  fileInput: css`
    position: absolute;
    opacity: 0;
    width: 100%;
    height: 100%;
    cursor: pointer;
  `,

  uploadLabel: css`
    display: flex;
    align-items: center;
    gap: ${layout.spacing.lg};
    padding: ${layout.spacing.xl};
    border: 2px dashed ${colors.border};
    border-radius: ${layout.borderRadius.lg};
    background: ${colors.glass};
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      border-color: ${colors.neonTeal};
      background: rgba(0, 255, 255, 0.05);
    }
  `,

  uploadIcon: css`
    font-size: 3rem;
    opacity: 0.7;
  `,

  uploadText: css`
    flex: 1;
    
    p {
      margin: 0;
      color: ${colors.textLight};
    }
  `,

  uploadSubtext: css`
    font-size: 0.875rem;
    opacity: 0.7;
    margin-top: ${layout.spacing.xs} !important;
  `,

  instructionsSection: css`
    display: grid;
    gap: ${layout.spacing.sm};
  `,

  label: css`
    color: ${colors.textLight};
    font-weight: 500;
  `,

  textarea: css`
    ${neoDecorocoBase.input};
    resize: vertical;
    font-family: inherit;
  `,

  waitingRoom: css`
    background: ${colors.glass};
    border-radius: ${layout.borderRadius.lg};
    padding: ${layout.spacing.lg};
    border: 1px solid ${colors.border};
  `,

  waitingTitle: css`
    color: ${colors.neonGold};
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0 0 ${layout.spacing.md} 0;
  `,

  fileList: css`
    display: grid;
    gap: ${layout.spacing.sm};
    margin-bottom: ${layout.spacing.lg};
  `,

  fileItem: css`
    display: flex;
    align-items: center;
    gap: ${layout.spacing.md};
    padding: ${layout.spacing.md};
    background: ${colors.surface};
    border-radius: ${layout.borderRadius.base};
    border: 1px solid ${colors.border};
  `,

  fileName: css`
    flex: 1;
    color: ${colors.textLight};
    font-weight: 500;
  `,

  fileSize: css`
    color: ${colors.textMuted};
    font-size: 0.875rem;
  `,

  removeButton: css`
    background: none;
    border: none;
    color: ${colors.neonRed};
    cursor: pointer;
    padding: ${layout.spacing.xs};
    border-radius: ${layout.borderRadius.base};
    
    &:hover {
      background: rgba(255, 7, 58, 0.1);
    }
  `,

  processButton: css`
    background: linear-gradient(135deg, ${colors.neonTeal}, ${colors.primary});
    border: none;
    width: 100%;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px ${colors.neonTeal}40;
    }
    
    &:disabled {
      opacity: 0.6;
      transform: none;
      cursor: not-allowed;
    }
  `,

  resultsPreview: css`
    min-height: 150px;
    display: flex;
    align-items: center;
    justify-content: center;
  `,

  emptyResults: css`
    text-align: center;
    color: ${colors.textMuted};
  `,

  emptyIcon: css`
    font-size: 2rem;
    display: block;
    margin-bottom: ${layout.spacing.md};
  `,

  emptyText: css`
    color: ${colors.textLight};
    font-weight: 500;
    margin: 0 0 ${layout.spacing.sm} 0;
  `,

  emptySubtext: css`
    margin: 0;
    font-size: 0.875rem;
    max-width: 300px;
  `
};

export default ProcessHub;
