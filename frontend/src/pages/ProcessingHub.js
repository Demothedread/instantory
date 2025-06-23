import { css } from '@emotion/react';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/auth/index';
import { neoDecorocoBase } from '../styles/components/neo-decoroco/base';
import layout from '../styles/layouts/constraints';

// Constants for file validation
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ACCEPTED_TYPES = {
  'application/pdf': '.pdf',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'text/plain': '.txt',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx'
};

const ProcessingHub = () => {
  const { user } = useContext(AuthContext);
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState([]);
  const [processingProgress, setProcessingProgress] = useState(0);

  // Cleanup file URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      files.forEach(fileItem => {
        if (fileItem.previewUrl) {
          URL.revokeObjectURL(fileItem.previewUrl);
        }
      });
    };
  }, [files]);

  // Validate individual file
  const validateFile = useCallback((file) => {
    const errors = [];
    
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      errors.push(`File "${file.name}" exceeds maximum size of 20MB`);
    }
    
    // Check file type
    if (!ACCEPTED_TYPES[file.type]) {
      errors.push(`File "${file.name}" has unsupported type: ${file.type}`);
    }
    
    return errors;
  }, []);

  // Enhanced file handling with validation and deduplication
  const handleFiles = useCallback((fileList) => {
    const newErrors = [];
    const validFiles = [];
    const existingFileNames = new Set(files.map(f => f.name));

    Array.from(fileList).forEach(file => {
      // Check for duplicates
      if (existingFileNames.has(file.name)) {
        newErrors.push(`File "${file.name}" is already in the list`);
        return;
      }

      // Validate file
      const fileErrors = validateFile(file);
      if (fileErrors.length > 0) {
        newErrors.push(...fileErrors);
        return;
      }

      // Create file object with enhanced metadata
      const fileItem = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'ready',
        progress: 0,
        error: null,
        lastModified: file.lastModified
      };

      // Add preview URL for images
      if (file.type.startsWith('image/')) {
        fileItem.previewUrl = URL.createObjectURL(file);
      }

      validFiles.push(fileItem);
      existingFileNames.add(file.name);
    });

    // Update state
    if (newErrors.length > 0) {
      setErrors(prev => [...prev, ...newErrors]);
    }

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
    }
  }, [files, validateFile]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragActive(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFiles(droppedFiles);
    }
  }, [handleFiles]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    // Only set inactive if we're leaving the drop zone entirely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragActive(false);
    }
  }, []);

  const handleFileInput = useCallback((e) => {
    const selectedFiles = e.target.files;
    if (selectedFiles.length > 0) {
      handleFiles(selectedFiles);
    }
    // Reset input to allow selecting the same file again
    e.target.value = '';
  }, [handleFiles]);

  // Enhanced processing with proper state management and error handling
  const processFiles = useCallback(async () => {
    if (files.length === 0) return;

    setProcessing(true);
    setProcessingProgress(0);
    setErrors([]);

    try {
      const readyFiles = files.filter(f => f.status === 'ready');
      const totalFiles = readyFiles.length;

      for (let i = 0; i < readyFiles.length; i++) {
        const fileItem = readyFiles[i];
        
        try {
          // Update file status to processing
          setFiles(prev => prev.map(f => 
            f.id === fileItem.id 
              ? { ...f, status: 'processing', progress: 0 }
              : f
          ));

          // TODO: Replace with actual API call
          // const result = await processFileAPI(fileItem.file);
          
          // Simulate processing with progress updates
          for (let progress = 0; progress <= 100; progress += 20) {
            await new Promise(resolve => setTimeout(resolve, 200));
            setFiles(prev => prev.map(f => 
              f.id === fileItem.id 
                ? { ...f, progress }
                : f
            ));
          }

          // Mark as completed
          setFiles(prev => prev.map(f => 
            f.id === fileItem.id 
              ? { ...f, status: 'completed', progress: 100 }
              : f
          ));

        } catch (fileError) {
          console.error(`Failed to process file ${fileItem.name}:`, fileError);
          
          // Mark file as failed
          setFiles(prev => prev.map(f => 
            f.id === fileItem.id 
              ? { ...f, status: 'failed', error: fileError.message }
              : f
          ));
          
          setErrors(prev => [...prev, `Failed to process "${fileItem.name}": ${fileError.message}`]);
        }

        // Update overall progress
        setProcessingProgress(((i + 1) / totalFiles) * 100);
      }

    } catch (error) {
      console.error('Processing batch failed:', error);
      setErrors(prev => [...prev, `Batch processing failed: ${error.message}`]);
    } finally {
      setProcessing(false);
      setProcessingProgress(0);
    }
  }, [files]);

  const removeFile = useCallback((id) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove?.previewUrl) {
        URL.revokeObjectURL(fileToRemove.previewUrl);
      }
      return prev.filter(f => f.id !== id);
    });
  }, []);

  const retryFile = useCallback((id) => {
    setFiles(prev => prev.map(f => 
      f.id === id 
        ? { ...f, status: 'ready', error: null, progress: 0 }
        : f
    ));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const clearCompletedFiles = useCallback(() => {
    setFiles(prev => {
      const completedFiles = prev.filter(f => f.status === 'completed');
      completedFiles.forEach(file => {
        if (file.previewUrl) {
          URL.revokeObjectURL(file.previewUrl);
        }
      });
      return prev.filter(f => f.status !== 'completed');
    });
  }, []);

  return (
    <div css={styles.container}>
      <div css={[layout.constrainedWidth, styles.content]}>
        <h1 css={styles.title}>
          🔄 Processing Hub
        </h1>
        
        <p css={styles.subtitle}>
          Upload and process your documents and images with AI
        </p>

        {/* Error Messages */}
        {errors.length > 0 && (
          <div css={styles.errorContainer}>
            <div css={styles.errorHeader}>
              <span>⚠️ Errors ({errors.length})</span>
              <button onClick={clearErrors} css={styles.clearButton}>
                Clear All
              </button>
            </div>
            <div css={styles.errorList}>
              {errors.map((error, index) => (
                <div key={index} css={styles.errorItem}>
                  {error}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* File Drop Zone */}
        <div 
          css={[styles.dropZone, dragActive && styles.dropZoneActive]}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          role="button"
          tabIndex={0}
          aria-label="File upload area"
        >
          <div css={styles.dropContent}>
            <div css={styles.uploadIcon}>📁</div>
            <h3>Drop files here or click to browse</h3>
            <p>Supports: PDF, Images (JPG, PNG), Text files (Max: 20MB each)</p>
            <input
              type="file"
              multiple
              onChange={handleFileInput}
              css={styles.fileInput}
              accept=".pdf,.jpg,.jpeg,.png,.txt,.doc,.docx"
              aria-label="Choose files to upload"
            />
          </div>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div css={styles.fileList}>
            <div css={styles.fileListHeader}>
              <h3>Files for Processing ({files.length})</h3>
              {files.some(f => f.status === 'completed') && (
                <button 
                  onClick={clearCompletedFiles}
                  css={styles.clearButton}
                >
                  Clear Completed
                </button>
              )}
            </div>
            
            {files.map(file => (
              <div key={file.id} css={styles.fileItem}>
                <div css={styles.fileInfo}>
                  {file.previewUrl && (
                    <img 
                      src={file.previewUrl} 
                      alt={`Preview of ${file.name}`}
                      css={styles.filePreview}
                    />
                  )}
                  <div css={styles.fileDetails}>
                    <span css={styles.fileName}>{file.name}</span>
                    <span css={styles.fileSize}>
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                    {file.error && (
                      <span css={styles.errorText}>{file.error}</span>
                    )}
                  </div>
                </div>

                <div css={styles.fileActions}>
                  {/* Progress Bar for Processing Files */}
                  {file.status === 'processing' && (
                    <div css={styles.progressContainer}>
                      <div css={styles.progressBar}>
                        <div 
                          css={[styles.progressFill, { width: `${file.progress}%` }]}
                        />
                      </div>
                      <span css={styles.progressText}>{file.progress}%</span>
                    </div>
                  )}

                  <span css={[styles.status, styles[`status_${file.status}`]]}>
                    {file.status === 'ready' ? '⏳ Ready' :
                     file.status === 'processing' ? '⚙️ Processing' :
                     file.status === 'completed' ? '✅ Done' :
                     file.status === 'failed' ? '❌ Failed' : file.status}
                  </span>

                  {file.status === 'ready' && (
                    <button 
                      onClick={() => removeFile(file.id)}
                      css={styles.removeButton}
                      aria-label={`Remove ${file.name}`}
                    >
                      ✕
                    </button>
                  )}

                  {file.status === 'failed' && (
                    <button 
                      onClick={() => retryFile(file.id)}
                      css={styles.retryButton}
                      aria-label={`Retry processing ${file.name}`}
                    >
                      🔄 Retry
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div css={styles.actionButtons}>
          {files.length > 0 && files.some(f => f.status === 'ready') && !processing && (
            <button 
              onClick={processFiles}
              css={[neoDecorocoBase.button, styles.processButton]}
              disabled={processing}
            >
              🚀 Process Files ({files.filter(f => f.status === 'ready').length})
            </button>
          )}
        </div>

        {/* Processing Indicator */}
        {processing && (
          <div css={styles.processingIndicator}>
            <div css={neoDecorocoBase.spinner} />
            <div css={styles.processingDetails}>
              <span>Processing files...</span>
              <div css={styles.overallProgress}>
                <div css={styles.progressBar}>
                  <div 
                    css={[styles.progressFill, { width: `${processingProgress}%` }]}
                  />
                </div>
                <span css={styles.progressText}>
                  {processingProgress.toFixed(0)}% Complete
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: css`
    min-height: 100vh;
    background: linear-gradient(135deg, #1a1a1a 0%, #2c1f3e 100%);
    padding: 2rem 1rem;
  `,
  
  content: css`
    max-width: 800px;
    margin: 0 auto;
  `,
  
  title: css`
    text-align: center;
    margin-bottom: 1rem;
    color: #ffffff;
    font-size: 2.5rem;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  `,
  
  subtitle: css`
    text-align: center;
    color: #cccccc;
    margin-bottom: 3rem;
    font-size: 1.1rem;
  `,

  // Error handling styles
  errorContainer: css`
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid #ef4444;
    border-radius: 8px;
    margin-bottom: 2rem;
    overflow: hidden;
  `,

  errorHeader: css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: rgba(239, 68, 68, 0.2);
    border-bottom: 1px solid #ef4444;
    color: #ffffff;
    font-weight: 600;
  `,

  errorList: css`
    padding: 1rem;
    max-height: 200px;
    overflow-y: auto;
  `,

  errorItem: css`
    color: #fecaca;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
    line-height: 1.4;

    &:last-child {
      margin-bottom: 0;
    }
  `,

  clearButton: css`
    background: none;
    border: 1px solid currentColor;
    border-radius: 4px;
    color: inherit;
    cursor: pointer;
    font-size: 0.75rem;
    padding: 0.25rem 0.75rem;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  `,
  
  dropZone: css`
    border: 2px dashed #4a5568;
    border-radius: 12px;
    padding: 3rem 2rem;
    text-align: center;
    background: #2d3748;
    transition: all 0.3s ease;
    position: relative;
    margin-bottom: 2rem;
    cursor: pointer;
    
    &:hover {
      border-color: #63b3ed;
      background: #4a5568;
      box-shadow: 0 4px 12px rgba(99, 179, 237, 0.15);
    }

    &:focus {
      outline: 2px solid #63b3ed;
      outline-offset: 2px;
    }
  `,
  
  dropZoneActive: css`
    border-color: #63b3ed;
    background: #4a5568;
    transform: scale(1.02);
    box-shadow: 0 8px 25px rgba(99, 179, 237, 0.25);
  `,
  
  dropContent: css`
    pointer-events: none;
    color: #ffffff;

    h3 {
      margin: 1rem 0 0.5rem 0;
      font-size: 1.2rem;
    }

    p {
      margin: 0;
      color: #a0aec0;
      font-size: 0.9rem;
    }
  `,
  
  uploadIcon: css`
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.8;
  `,
  
  fileInput: css`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
    pointer-events: auto;
  `,
  
  fileList: css`
    background: #2d3748;
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  `,

  fileListHeader: css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #4a5568;

    h3 {
      margin: 0;
      color: #ffffff;
      font-size: 1.1rem;
    }
  `,
  
  fileItem: css`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 1rem;
    border-bottom: 1px solid #4a5568;
    transition: background-color 0.2s ease;
    
    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background: rgba(74, 85, 104, 0.3);
    }
  `,
  
  fileInfo: css`
    display: flex;
    align-items: center;
    gap: 1rem;
    flex: 1;
    min-width: 0;
  `,

  filePreview: css`
    width: 48px;
    height: 48px;
    object-fit: cover;
    border-radius: 6px;
    border: 1px solid #4a5568;
    flex-shrink: 0;
  `,

  fileDetails: css`
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
  `,
  
  fileName: css`
    font-weight: 500;
    color: #ffffff;
    word-break: break-word;
  `,
  
  fileSize: css`
    font-size: 0.875rem;
    color: #a0aec0;
  `,

  errorText: css`
    font-size: 0.75rem;
    color: #fca5a5;
    font-style: italic;
  `,
  
  fileActions: css`
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-shrink: 0;
  `,

  progressContainer: css`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-width: 120px;
  `,

  progressBar: css`
    width: 80px;
    height: 6px;
    background: #4a5568;
    border-radius: 3px;
    overflow: hidden;
  `,

  progressFill: css`
    height: 100%;
    background: linear-gradient(90deg, #63b3ed, #4299e1);
    transition: width 0.3s ease;
    border-radius: 3px;
  `,

  progressText: css`
    font-size: 0.75rem;
    color: #a0aec0;
    font-weight: 500;
    min-width: 35px;
  `,
  
  status: css`
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 500;
    white-space: nowrap;
    min-width: 80px;
    text-align: center;
  `,
  
  status_ready: css`
    background: #3182ce;
    color: white;
  `,
  
  status_processing: css`
    background: #ed8936;
    color: white;
  `,
  
  status_completed: css`
    background: #38a169;
    color: white;
  `,

  status_failed: css`
    background: #e53e3e;
    color: white;
  `,
  
  removeButton: css`
    background: none;
    border: none;
    color: #e53e3e;
    cursor: pointer;
    font-size: 1.2rem;
    padding: 0.25rem;
    border-radius: 4px;
    transition: all 0.2s ease;
    
    &:hover {
      color: #c53030;
      background: rgba(229, 62, 62, 0.1);
    }
  `,

  retryButton: css`
    background: #4299e1;
    border: none;
    color: white;
    cursor: pointer;
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    transition: all 0.2s ease;
    
    &:hover {
      background: #3182ce;
    }
  `,

  actionButtons: css`
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin: 2rem 0;
  `,
  
  processButton: css`
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0;
    padding: 1rem 2rem;
    font-size: 1.1rem;
    font-weight: 600;
    transition: all 0.3s ease;

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(99, 179, 237, 0.3);
    }
  `,
  
  processingIndicator: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 2rem;
    color: #ffffff;
    font-weight: 500;
    background: #2d3748;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  `,

  processingDetails: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    text-align: center;
  `,

  overallProgress: css`
    display: flex;
    align-items: center;
    gap: 1rem;
    min-width: 200px;
  `
};

export default ProcessingHub;
