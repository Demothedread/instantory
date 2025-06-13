import { css } from '@emotion/react';
import { useState } from 'react';
import config from '../../config';
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
      
      // Prepare form data for file upload
      const formData = new FormData();
      
      // Add files
      files.forEach((file) => {
        formData.append(`files`, file);
      });
      
      // Add URLs
      if (urls.length > 0) {
        formData.append('urls', JSON.stringify(urls));
      }
      
      // Add instructions
      if (instructions.trim()) {
        formData.append('instructions', instructions.trim());
      }
      
      // Call backend processing API
      const response = await fetch(`${config.apiUrl}/api/process/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      
      // Clear files after processing
      setFiles([]);
      setInstructions('');
      setUrlInput('');
      
      // Notify parent component to refresh data
      onProcessComplete?.(result);
      
      // Show success message
      alert(`Processing complete! Processed ${result.processedFiles || files.length} items. Check the results table below.`);
    } catch (error) {
      console.error('Processing error:', error);
      alert(`Processing failed: ${error.message}. Please try again.`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div css={styles.processingContainer}>
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

        <div css={styles.inputSection}>
          <div css={styles.instructionsSection}>
            <label css={styles.label}>AI Instructions:</label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Customize how AI should analyze your files (e.g., 'Extract key themes and categorize by importance')..."
              css={styles.textarea}
              rows={3}
            />
          </div>

          <div css={styles.urlSection}>
            <label css={styles.label}>URLs to Process:</label>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Paste URLs here (space or line separated)..."
              css={styles.urlInput}
            />
          </div>
        </div>
      </div>

      {/* Waiting Room */}
      <div css={styles.waitingRoom}>
        <h3 css={styles.waitingTitle}>📋 Waiting Room</h3>
        
        {(files.length === 0 && !urlInput.trim()) ? (
          <p css={styles.emptyText}>No files or URLs queued for processing</p>
        ) : (
          <div css={styles.queuedItems}>
            {/* Files */}
            {files.length > 0 && (
              <div css={styles.fileList}>
                <h4 css={styles.listTitle}>Files ({files.length})</h4>
                {files.map((file, index) => (
                  <div key={index} css={styles.fileItem}>
                    <div css={styles.fileInfo}>
                      <span css={styles.fileName}>{file.name}</span>
                      <span css={styles.fileSize}>
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                    <button
                      css={styles.removeButton}
                      onClick={() => removeFile(index)}
                      title="Remove file"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* URLs */}
            {urlInput.trim() && (
              <div css={styles.urlList}>
                <h4 css={styles.listTitle}>URLs</h4>
                {parseUrlsFromInstructions(urlInput).map((url, index) => (
                  <div key={index} css={styles.urlItem}>
                    <span css={styles.urlText}>{url}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {(files.length > 0 || urlInput.trim()) && (
          <div css={styles.processSection}>
            <button
              css={[neoDecorocoBase.button, styles.processButton]}
              onClick={handleProcess}
              disabled={processing}
            >
              {processing ? (
                <>
                  <span css={styles.spinner}></span>
                  Processing...
                </>
              ) : (
                '🚀 Start Processing'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  processingContainer: css`
    display: flex;
    flex-direction: column;
    gap: ${layout.spacing.xl};
    height: 100%;
  `,

  uploadSection: css`
    display: flex;
    flex-direction: column;
    gap: ${layout.spacing.lg};
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

  inputSection: css`
    display: grid;
    gap: ${layout.spacing.md};
    grid-template-columns: 1fr 1fr;
    
    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  `,

  instructionsSection: css`
    display: flex;
    flex-direction: column;
    gap: ${layout.spacing.sm};
  `,

  urlSection: css`
    display: flex;
    flex-direction: column;
    gap: ${layout.spacing.sm};
  `,

  label: css`
    color: ${colors.textLight};
    font-weight: 500;
    font-size: 0.875rem;
  `,

  textarea: css`
    ${neoDecorocoBase.input};
    resize: vertical;
    font-family: inherit;
    min-height: 80px;
  `,

  urlInput: css`
    ${neoDecorocoBase.input};
  `,

  waitingRoom: css`
    background: ${colors.glass};
    border-radius: ${layout.borderRadius.lg};
    padding: ${layout.spacing.lg};
    border: 1px solid ${colors.border};
    flex: 1;
  `,

  waitingTitle: css`
    color: ${colors.neonGold};
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0 0 ${layout.spacing.md} 0;
  `,

  emptyText: css`
    color: ${colors.textMuted};
    text-align: center;
    font-style: italic;
    margin: ${layout.spacing.xl} 0;
  `,

  queuedItems: css`
    display: flex;
    flex-direction: column;
    gap: ${layout.spacing.lg};
    margin-bottom: ${layout.spacing.lg};
  `,

  fileList: css`
    display: flex;
    flex-direction: column;
    gap: ${layout.spacing.sm};
  `,

  urlList: css`
    display: flex;
    flex-direction: column;
    gap: ${layout.spacing.sm};
  `,

  listTitle: css`
    color: ${colors.textLight};
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 ${layout.spacing.sm} 0;
  `,

  fileItem: css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: ${layout.spacing.md};
    background: ${colors.surface};
    border-radius: ${layout.borderRadius.base};
    border: 1px solid ${colors.border};
  `,

  fileInfo: css`
    display: flex;
    flex-direction: column;
    gap: ${layout.spacing.xs};
    flex: 1;
  `,

  fileName: css`
    color: ${colors.textLight};
    font-weight: 500;
  `,

  fileSize: css`
    color: ${colors.textMuted};
    font-size: 0.875rem;
  `,

  urlItem: css`
    padding: ${layout.spacing.md};
    background: ${colors.surface};
    border-radius: ${layout.borderRadius.base};
    border: 1px solid ${colors.border};
  `,

  urlText: css`
    color: ${colors.textLight};
    word-break: break-all;
  `,

  removeButton: css`
    background: none;
    border: none;
    color: ${colors.neonRed};
    cursor: pointer;
    padding: ${layout.spacing.xs};
    border-radius: ${layout.borderRadius.base};
    font-size: 1.125rem;
    
    &:hover {
      background: rgba(255, 7, 58, 0.1);
    }
  `,

  processSection: css`
    margin-top: ${layout.spacing.lg};
  `,

  processButton: css`
    background: linear-gradient(135deg, ${colors.neonTeal}, ${colors.primary});
    border: none;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${layout.spacing.sm};
    
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

  spinner: css`
    width: 16px;
    height: 16px;
    border: 2px solid transparent;
    border-top: 2px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `
};

export default ProcessHub;
