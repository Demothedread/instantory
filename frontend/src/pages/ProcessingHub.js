import from '@emotion/react';
import { useContext, useState } from 'react';
import { AuthContext } from '../contexts/auth/index';
import { neoDecorocoBase } from '../styles/components/neo-decoroco/base';
import layout from '../styles/layouts/constraints';

const ProcessingHub = () => {
  useContext(AuthContext);
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleFiles = (fileList) => {
    const newFiles = Array.from(fileList).map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'ready'
    }));
    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFiles(droppedFiles);
    }
  };

  const handleFileInput = (e) => {
    const selectedFiles = e.target.files;
    if (selectedFiles.length > 0) {
      handleFiles(selectedFiles);
    }
  };

  const processFiles = async () => {
    setProcessing(true);
    try {
      // TODO: Implement file processing logic
      for (let file of files) {
        file.status = 'processing';
        setFiles([...files]);
        
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        file.status = 'completed';
        setFiles([...files]);
      }
    } catch (error) {
      console.error('Processing failed:', error);
    } finally {
      setProcessing(false);
    }
  };

  const removeFile = (id) => {
    setFiles(files.filter(f => f.id !== id));
  };

  return (
    <div css={styles.container}>
      <div css={[layout.constrainedWidth, styles.content]}>
        <h1 css={styles.title}>
          🔄 Processing Hub
        </h1>
        
        <p css={styles.subtitle}>
          Upload and process your documents and images with AI
        </p>

        {/* File Drop Zone */}
        <div 
          css={[styles.dropZone, dragActive && styles.dropZoneActive]}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
        >
          <div css={styles.dropContent}>
            <div css={styles.uploadIcon}>📁</div>
            <h3>Drop files here or click to browse</h3>
            <p>Supports: PDF, Images (JPG, PNG), Text files</p>
            <input
              type="file"
              multiple
              onChange={handleFileInput}
              css={styles.fileInput}
              accept=".pdf,.jpg,.jpeg,.png,.txt,.doc,.docx"
            />
          </div>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div css={styles.fileList}>
            <h3>Files Ready for Processing</h3>
            {files.map(file => (
              <div key={file.id} css={styles.fileItem}>
                <div css={styles.fileInfo}>
                  <span css={styles.fileName}>{file.name}</span>
                  <span css={styles.fileSize}>
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </div>
                <div css={styles.fileActions}>
                  <span css={[styles.status, styles[`status_${file.status}`]]}>
                    {file.status}
                  </span>
                  {file.status === 'ready' && (
                    <button 
                      onClick={() => removeFile(file.id)}
                      css={styles.removeButton}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Process Button */}
        {files.length > 0 && !processing && (
          <button 
            onClick={processFiles}
            css={[neoDecorocoBase.button, styles.processButton]}
          >
            🚀 Process Files
          </button>
        )}

        {processing && (
          <div css={styles.processingIndicator}>
            <div css={neoDecorocoBase.spinner} />
            <span>Processing files...</span>
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
  `,
  
  subtitle: css`
    text-align: center;
    color: #cccccc;
    margin-bottom: 3rem;
    font-size: 1.1rem;
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
    
    &:hover {
      border-color: #63b3ed;
      background: #4a5568;
    }
  `,
  
  dropZoneActive: css`
    border-color: #63b3ed;
    background: #4a5568;
    transform: scale(1.02);
  `,
  
  dropContent: css`
    pointer-events: none;
  `,
  
  uploadIcon: css`
    font-size: 3rem;
    margin-bottom: 1rem;
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
  `,
  
  fileItem: css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid #4a5568;
    
    &:last-child {
      border-bottom: none;
    }
  `,
  
  fileInfo: css`
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  `,
  
  fileName: css`
    font-weight: 500;
    color: #ffffff;
  `,
  
  fileSize: css`
    font-size: 0.875rem;
    color: #a0aec0;
  `,
  
  fileActions: css`
    display: flex;
    align-items: center;
    gap: 1rem;
  `,
  
  status: css`
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: uppercase;
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
  
  removeButton: css`
    background: none;
    border: none;
    color: #e53e3e;
    cursor: pointer;
    font-size: 1.2rem;
    padding: 0.25rem;
    
    &:hover {
      color: #c53030;
    }
  `,
  
  processButton: css`
    display: block;
    margin: 2rem auto;
    padding: 1rem 2rem;
    font-size: 1.1rem;
    font-weight: 600;
  `,
  
  processingIndicator: css`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 2rem;
    color: #ffffff;
    font-weight: 500;
  `
};

export default ProcessingHub;
