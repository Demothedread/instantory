import React, { useCallback, useEffect, useState } from 'react';
import { css } from '@emotion/react';

import ImageList from '../components/display/ImageList';
import InventoryTable from '../components/display/InventoryTable';
import { colors } from '../styles/theme/colors';
import { layout } from '../styles/layouts/constraints';
import { neoDecorocoBase } from '../styles/components/neo-decoroco/base';
import { typography } from '../styles/theme/typography';
import { animations } from '../styles/theme/animations';
import config from '../config';

const InventoryView = () => {
  const [inventory, setInventory] = useState([]);
  const [viewMode, setViewMode] = useState('gallery'); // 'gallery' or 'table'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch inventory from API
      const response = await fetch(`${config.apiUrl}/api/inventory`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setInventory(data);
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setError('Failed to load inventory. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = !searchTerm || 
      item?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item?.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item?.material?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !filterCategory || item?.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
  }, []);

  const handleFilter = useCallback((category) => {
    setFilterCategory(category);
  }, []);

  return (
    <div css={styles.container}>
      <div css={styles.headerSection}>
        <div css={styles.decorElement1}></div>
        <div css={styles.decorElement2}></div>
        <h1 css={styles.pageTitle}>Inventory Collection</h1>
        <p css={styles.pageSubtitle}>
          Browse and manage your inventory items
        </p>
      </div>

      <div css={styles.controlsSection}>
        <div css={styles.searchFilter}>
          <input
            type="text"
            placeholder="Search inventory..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            css={styles.searchInput}
          />
        </div>
        
        <div css={styles.viewToggle}>
          <button 
            css={[styles.viewButton, viewMode === 'gallery' && styles.activeViewButton]} 
            onClick={() => setViewMode('gallery')}
          >
            Gallery View
          </button>
          <button 
            css={[styles.viewButton, viewMode === 'table' && styles.activeViewButton]} 
            onClick={() => setViewMode('table')}
          >
            Table View
          </button>
        </div>
        
        <div css={styles.filterMenu}>
          <button 
            css={styles.filterButton}
            onClick={() => setFilterCategory('')}
            className={filterCategory === '' ? 'active' : ''}
          >
            All
          </button>
          {['Beads', 'Stools', 'Bowls', 'Fans', 'Totebags', 'Home Decor'].map(category => (
            <button 
              key={category}
              css={styles.filterButton}
              onClick={() => handleFilter(category)}
              className={filterCategory === category ? 'active' : ''}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div css={styles.contentSection}>
        {loading ? (
          <div css={styles.loadingContainer}>
            <div css={styles.loadingSpinner}></div>
            <p css={styles.loadingText}>Loading your inventory...</p>
          </div>
        ) : error ? (
          <div css={styles.errorContainer}>
            <p css={styles.errorText}>{error}</p>
            <button css={styles.retryButton} onClick={fetchInventory}>
              Retry
            </button>
          </div>
        ) : (
          viewMode === 'gallery' ? (
            <ImageList inventory={filteredInventory} />
          ) : (
            <InventoryTable inventory={filteredInventory} />
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
    background: radial-gradient(circle at center, ${colors.neonGold}20, transparent 70%);
    z-index: -1;
  `,
  
  decorElement2: css`
    position: absolute;
    bottom: -120px;
    left: -70px;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: radial-gradient(circle at center, ${colors.neonTeal}15, transparent 70%);
    z-index: -1;
  `,
  
  pageTitle: css`
    ${neoDecorocoBase.heading}
    font-family: ${typography.fonts.decorative};
    font-size: ${typography.sizes['4xl']};
    margin-bottom: ${layout.spacing.md};
    color: ${colors.neonGold};
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
        ${colors.neonGold}, 
        ${colors.neonTeal}, 
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
  
  controlsSection: css`
    display: flex;
    flex-direction: column;
    gap: ${layout.spacing.md};
    margin-bottom: ${layout.spacing.xl};
    
    @media (max-width: ${layout.breakpoints.md}) {
      margin-bottom: ${layout.spacing.lg};
    }
  `,
  
  searchFilter: css`
    margin-bottom: ${layout.spacing.md};
    
    @media (max-width: ${layout.breakpoints.md}) {
      margin-bottom: ${layout.spacing.sm};
    }
  `,
  
  searchInput: css`
    ${neoDecorocoBase.input}
    width: 100%;
    padding: ${layout.spacing.md};
    font-size: ${typography.sizes.lg};
    background: rgba(26, 148, 133, 0.05);
    border: 1px solid ${colors.neonTeal}30;
    
    &:focus {
      border-color: ${colors.neonTeal};
      box-shadow: 0 0 15px ${colors.neonTeal}30;
    }
  `,
  
  viewToggle: css`
    display: flex;
    gap: ${layout.spacing.md};
    margin-bottom: ${layout.spacing.md};
    
    @media (max-width: ${layout.breakpoints.md}) {
      justify-content: center;
    }
  `,
  
  viewButton: css`
    ${neoDecorocoBase.button}
    flex: 1;
    padding: ${layout.spacing.md} ${layout.spacing.lg};
    background: rgba(26, 148, 133, 0.1);
    border: 1px solid ${colors.neonTeal}30;
    transition: all 0.3s ${animations.easing.elegant};
    
    &:hover {
      background: rgba(26, 148, 133, 0.2);
      transform: translateY(-2px);
    }
    
    @media (max-width: ${layout.breakpoints.md}) {
      padding: ${layout.spacing.sm} ${layout.spacing.md};
      font-size: ${typography.sizes.sm};
    }
  `,
  
  activeViewButton: css`
    background: rgba(26, 148, 133, 0.3);
    border: 1px solid ${colors.neonTeal};
    box-shadow: 0 0 15px ${colors.neonTeal}50;
  `,
  
  filterMenu: css`
    display: flex;
    flex-wrap: wrap;
    gap: ${layout.spacing.sm};
    
    @media (max-width: ${layout.breakpoints.md}) {
      justify-content: center;
    }
  `,
  
  filterButton: css`
    ${neoDecorocoBase.button}
    padding: ${layout.spacing.sm} ${layout.spacing.md};
    background: rgba(212, 175, 55, 0.1);
    border: 1px solid ${colors.neonGold}30;
    font-size: ${typography.sizes.sm};
    transition: all 0.3s ${animations.easing.elegant};
    
    &:hover {
      background: rgba(212, 175, 55, 0.2);
      transform: translateY(-2px);
    }
    
    &.active {
      background: rgba(212, 175, 55, 0.3);
      border: 1px solid ${colors.neonGold};
      box-shadow: 0 0 15px ${colors.neonGold}50;
    }
  `,
  
  contentSection: css`
    flex: 1;
    position: relative;
    overflow: hidden;
    
    // Add a subtle art deco pattern background
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: url('/assets/patterns/art-deco-pattern.png');
      background-size: 300px;
      opacity: 0.03;
      pointer-events: none;
      z-index: -1;
    }
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
    border-top-color: ${colors.neonGold};
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
    color: ${colors.neonGold};
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

export default InventoryView;