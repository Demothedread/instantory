import React, { useCallback, useEffect, useState } from 'react';
import { css } from '@emotion/react';

import DocumentSearch from '../components/display/DocumentSearch';
import DocumentsTable from '../components/display/DocumentsTable';
import { colors } from '../styles/theme/colors';
import { layout } from '../styles/layouts/constraints';
import { neoDecorocoBase } from '../styles/components/neo-decoroco/base';
import { typography } from '../styles/theme/typography';
import { animations } from '../styles/theme/animations';

const DocumentsView = () => {
  const [documents, setDocuments] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'search'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch documents from API
      const response = await fetch(`${config.apiUrl}/api/documents`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setDocuments(data);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError('Failed to load documents. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleSearch = useCallback((results, query) => {
    setSearchResults(results);
    setSearchQuery(query);
    setViewMode('search');
  }, []);

  const handleResetSearch = useCallback(() => {
    setSearchResults(null);
    setSearchQuery('');
    setViewMode('table');
  }, []);

  return (
    <div css={styles.container}>
      <div css={styles.headerSection}>
        <div css={styles.decorElement1}></div>
        <div css={styles.decorElement2}></div>
        <h1 css={styles.pageTitle}>Document Vault</h1>
        <p css={styles.pageSubtitle}>
          Search, browse, and manage your document collection
        </p>
      </div>

      <div css={styles.searchSection}>
        <DocumentSearch onSearchResults={handleSearch} />
      </div>

      <div css={styles.viewToggle}>
        <button 
          css={[styles.viewButton, viewMode === 'table' && styles.activeViewButton]} 
          onClick={handleResetSearch}
        >
          Document Library
        </button>
        {searchResults && (
          <button 
            css={[styles.viewButton, viewMode === 'search' && styles.activeViewButton]} 
            onClick={() => setViewMode('search')}
          >
            Search Results {searchQuery ? `for "${searchQuery}"` : ''}
          </button>
        )}
      </div>

      <div css={styles.contentSection}>
        {loading ? (
          <div css={styles.loadingContainer}>
            <div css={styles.loadingSpinner}></div>
            <p css={styles.loadingText}>Loading your documents...</p>
          </div>
        ) : error ? (
          <div css={styles.errorContainer}>
            <p css={styles.errorText}>{error}</p>
            <button css={styles.retryButton} onClick={fetchDocuments}>
              Retry
            </button>
          </div>
        ) : (
          viewMode === 'search' && searchResults ? (
            <DocumentsTable documents={searchResults} />
          ) : (
            <DocumentsTable documents={documents} />
          )
        )}
      </div>
    </div>
  );
};

const styles = {
  container: css`
    display: flex;
    flex-direction: column;
    width: 100%;
    min-height: calc(100vh - ${layout.heights.header} - ${layout.heights.footer});
    padding: ${layout.spacing.lg};
    position: relative;
    overflow: hidden;
    
    @media (max-width: ${layout.breakpoints.md}) {
      padding: ${layout.spacing.md};
    }
  `,
  
  headerSection: css`
    position: relative;
    margin-bottom: ${layout.spacing.xl};
    text-align: center;
    padding: ${layout.spacing.lg} ${layout.spacing.xl};
    overflow: hidden;
  `,
  
  decorElement1: css`
    position: absolute;
    top: -100px;
    right: -50px;
    width: 250px;
    height: 250px;
    border-radius: 50%;
    background: radial-gradient(circle at center, ${colors.neonTeal}20, transparent 70%);
    z-index: -1;
  `,
  
  decorElement2: css`
    position: absolute;
    bottom: -120px;
    left: -70px;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: radial-gradient(circle at center, ${colors.neonGold}15, transparent 70%);
    z-index: -1;
  `,
  
  pageTitle: css`
    ${neoDecorocoBase.heading}
    font-family: ${typography.fonts.decorative};
    font-size: ${typography.sizes['4xl']};
    margin-bottom: ${layout.spacing.md};
    color: ${colors.neonTeal};
    position: relative;
    display: inline-block;
    
    &::after {
      content: '';
      position: absolute;
      bottom: -10px;
      left: 50%;
      transform: translateX(-50%);
      width: 80%;
      height: 2px;
      background: linear-gradient(
        90deg, 
        transparent, 
        ${colors.neonTeal}, 
        ${colors.neonGold}, 
        transparent
      );
    }
    
    @media (max-width: ${layout.breakpoints.md}) {
      font-size: ${typography.sizes['2xl']};
    }
  `,
  
  pageSubtitle: css`
    font-family: ${typography.fonts.elegant};
    font-size: ${typography.sizes.lg};
    color: ${colors.textLight};
    max-width: 600px;
    margin: 0 auto;
    
    @media (max-width: ${layout.breakpoints.md}) {
      font-size: ${typography.sizes.base};
    }
  `,
  
  searchSection: css`
    margin-bottom: ${layout.spacing.xl};
    
    @media (max-width: ${layout.breakpoints.md}) {
      margin-bottom: ${layout.spacing.lg};
    }
  `,
  
  viewToggle: css`
    display: flex;
    gap: ${layout.spacing.md};
    margin-bottom: ${layout.spacing.lg};
    flex-wrap: wrap;
    
    @media (max-width: ${layout.breakpoints.md}) {
      justify-content: center;
    }
  `,
  
  viewButton: css`
    ${neoDecorocoBase.button}
    padding: ${layout.spacing.sm} ${layout.spacing.lg};
    background: rgba(26, 148, 133, 0.1);
    border: 1px solid ${colors.neonTeal}30;
    transition: all 0.3s ${animations.easing.elegant};
    
    &:hover {
      background: rgba(26, 148, 133, 0.2);
      transform: translateY(-2px);
    }
  `,
  
  activeViewButton: css`
    background: rgba(26, 148, 133, 0.3);
    border: 1px solid ${colors.neonTeal};
    box-shadow: 0 0 15px ${colors.neonTeal}50;
  `,
  
  contentSection: css`
    flex: 1;
    position: relative;
  `,
  
  loadingContainer: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 300px;
  `,
  
  loadingSpinner: css`
    width: 60px;
    height: 60px;
    border: 4px solid ${colors.border};
    border-top-color: ${colors.neonTeal};
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: ${layout.spacing.md};
    
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `,
  
  loadingText: css`
    font-family: ${typography.fonts.modern};
    font-size: ${typography.sizes.lg};
    color: ${colors.neonTeal};
  `,
  
  errorContainer: css`
    ${neoDecorocoBase.panel}
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: ${layout.spacing.xl};
  `,
  
  errorText: css`
    font-family: ${typography.fonts.modern};
    font-size: ${typography.sizes.lg};
    color: ${colors.error};
    margin-bottom: ${layout.spacing.lg};
    text-align: center;
  `,
  
  retryButton: css`
    ${neoDecorocoBase.button}
  `
};

export default DocumentsView;