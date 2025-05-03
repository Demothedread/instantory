import React, { useContext, useEffect, useState } from 'react';

import { AuthContext } from '../../../contexts/auth';
import ProcessImagesButton from '../ProcessImagesButton';
import { css } from '@emotion/react';
import styles from './styles';
import { useNavigate } from 'react-router-dom';

const ProcessingHub = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upload');
  const [processingComplete, setProcessingComplete] = useState(false);
  const [processedItems, setProcessedItems] = useState([]);

  // Handle successful processing completion
  const handleProcessComplete = async (results) => {
    setProcessedItems(results || []);
    setProcessingComplete(true);
    // Auto-navigate to results after a delay
    setTimeout(() => { 
      if (results && results.length > 0) {
      // Navigate based on what was processed
      const hasInventory = results.some(item => item.type === 'inventory');
      const hasDocuments = results.some(item => item.type === 'document');
      
      if (hasInventory && !hasDocuments) {
        navigate('/inventory');
      } else if (hasDocuments && !hasInventory) {
        navigate('/documents');
      } else {
        navigate('/dashboard'); // Both types or no results
      }
    } else {
      navigate('/dashboard');
    } 
  }, 3000);
};

  return (
    <div css={styles.container}>
      <div css={styles.header}>
        <h1 css={styles.title}>Bartleby Processing Studio</h1>
        <p css={styles.subtitle}>Upload documents and images for AI-powered analysis and organization</p>
      </div>

      <div css={styles.tabContainer}>
        <button 
          css={[styles.tabButton, activeTab === 'upload' && styles.activeTab]}
          onClick={() => setActiveTab('upload')}
        >
          Upload & Process
        </button>
        <button 
          css={[styles.tabButton, activeTab === 'batch' && styles.activeTab]}
          onClick={() => setActiveTab('batch')}
        >
          Batch Processing
        </button>
        <button 
          css={[styles.tabButton, activeTab === 'history' && styles.activeTab]}
          onClick={() => setActiveTab('history')}
        >
          Processing History
        </button>
      </div>

      <div css={styles.contentContainer}>
        {activeTab === 'upload' && (
          <div css={styles.uploadContainer}>
            <div css={styles.uploadSection}>
              <h2 css={styles.sectionTitle}>Upload Files</h2>
              <ProcessImagesButton 
                isAuthenticated={!!user} 
                onProcess={handleProcessComplete} 
              />
            </div>
            
            <div css={styles.instructionsPanel}>
              <h3 css={styles.instructionsTitle}>Processing Instructions</h3>
              <div css={styles.instructionsList}>
                <div css={styles.instructionItem}>
                  <span css={styles.instructionIcon}>📄</span>
                  <div css={styles.instructionText}>
                    <h4>Documents</h4>
                    <p>Upload PDFs, DOCx, and text files for automatic information extraction</p>
                  </div>
                </div>
                
                <div css={styles.instructionItem}>
                  <span css={styles.instructionIcon}>🖼️</span>
                  <div css={styles.instructionText}>
                    <h4>Images</h4>
                    <p>Upload images of products or items for inventory categorization</p>
                  </div>
                </div>
                
                <div css={styles.instructionItem}>
                  <span css={styles.instructionIcon}>💡</span>
                  <div css={styles.instructionText}>
                    <h4>Processing</h4>
                    <p>Our AI will analyze content, extract details, and organize your uploads</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'batch' && (
          <div css={styles.batchContainer}>
            <h2 css={styles.sectionTitle}>Batch Processing</h2>
            <p css={styles.comingSoon}>Advanced batch processing coming soon...</p>
          </div>
        )}

        {activeTab === 'history' && (
          <div css={styles.historyContainer}>
            <h2 css={styles.sectionTitle}>Processing History</h2>
            <p css={styles.comingSoon}>Processing history coming soon...</p>
          </div>
        )}
      </div>

      {processingComplete && (
        <div css={styles.successMessage}>
          <span css={styles.successIcon}>✓</span>
          Processing complete! Redirecting to inventory...
        </div>
      )}
    </div>
  );
};

export default ProcessingHub;