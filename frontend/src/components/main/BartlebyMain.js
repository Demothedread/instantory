import { css } from '@emotion/react';
import { useCallback, useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../contexts/auth';
import { neoDecorocoBase } from '../../styles/components/neo-decoroco/base';
import layout from '../../styles/layouts/constraints';
import { colors } from '../../styles/theme/colors';

// Import existing components
import dataApi from '../../services/api';
import DocumentViewer from '../display/DocumentViewer';
import InventoryTable from '../display/InventoryTable';
import KnowledgeGraph from '../display/KnowledgeGraph';
import RolodexToggle from '../display/RolodexToggle';
import ProcessHub from '../upload/ProcessHubIntegrated';

const BartlebyMain = () => {
  const { user } = useContext(AuthContext);
  
  // Layout state management
  const [currentLayout, setCurrentLayout] = useState('table');
  const [activePartition, setActivePartition] = useState('middle'); // top, middle, bottom
  const [inventory, setInventory] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Data fetching
  const fetchData = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [inventoryResponse, documentsResponse] = await Promise.all([
        dataApi.getInventory(),
        dataApi.getDocuments()
      ]);
      
      setInventory(Array.isArray(inventoryResponse?.data) ? inventoryResponse.data : []);
      setDocuments(Array.isArray(documentsResponse?.data) ? documentsResponse.data : []);
    } catch (err) {
      setError(err.message || 'Error fetching data');
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLayoutChange = (layoutId) => {
    setCurrentLayout(layoutId);
    setActivePartition('bottom'); // Focus on results when layout changes
  };

  const handlePartitionFocus = (partition) => {
    setActivePartition(partition);
  };

  const renderBottomContent = () => {
    switch (currentLayout) {
      case 'table':
        return (
          <div css={styles.tabContainer}>
            <div css={styles.tabs}>
              <button css={[styles.tab, styles.activeTab]}>📊 All</button>
              <button css={styles.tab}>📄 Documents</button>
              <button css={styles.tab}>📦 Inventory</button>
              <button css={styles.tab}>🎵 Audio</button>
            </div>
            <div css={styles.tableContent}>
              <InventoryTable />
            </div>
          </div>
        );
      case 'grid':
        return (
          <div css={styles.gridView}>
            <div css={styles.masonryGrid}>
              {/* Masonry grid implementation */}
              <div css={styles.gridPlaceholder}>
                <span css={styles.placeholderIcon}>🔲</span>
                <p>Masonry Grid View</p>
                <p css={styles.placeholderText}>Visual cards layout coming soon...</p>
              </div>
            </div>
          </div>
        );
      case 'graph':
        return <KnowledgeGraph data={[...inventory, ...documents]} />;
      case 'browser':
        return (
          <DocumentViewer 
            documents={documents}
            onDocumentSelect={(doc) => console.log('Selected:', doc)}
          />
        );
      default:
        return <InventoryTable />;
    }
  };

  if (!user) {
    return (
      <div css={styles.loginPrompt}>
        <h2>Welcome to Bartleby</h2>
        <p>Please log in to access the main application.</p>
      </div>
    );
  }

  return (
    <div css={styles.container}>
      {error && (
        <div css={styles.errorBanner}>
          {error}
        </div>
      )}

      <div css={styles.threePartitionLayout}>
        {/* Top Partition: Rolodex & Layout Switcher */}
        <div 
          css={[
            styles.topPartition,
            activePartition === 'top' && styles.expandedPartition
          ]}
          onClick={() => handlePartitionFocus('top')}
        >
          <div css={styles.partitionHeader}>
            <h2 css={styles.partitionTitle}>🎛️ Rolodex & Layout Switcher</h2>
            {activePartition !== 'top' && (
              <span css={styles.expandHint}>Click to expand</span>
            )}
          </div>
          <div css={styles.partitionContent}>
            <RolodexToggle 
              onLayoutChange={handleLayoutChange}
              currentLayout={currentLayout}
            />
            <div css={styles.finishesSection}>
              <h3 css={styles.sectionTitle}>🎨 Finishes</h3>
              <div css={styles.finishesGrid}>
                <button css={styles.finishButton}>🎨 Default</button>
                <button css={styles.finishButton}>🔬 Research</button>
                <button css={styles.finishButton}>⚖️ Legal</button>
                <button css={styles.finishButton}>💼 Business</button>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Partition: Processing Zone */}
        <div 
          css={[
            styles.middlePartition,
            activePartition === 'middle' && styles.expandedPartition
          ]}
          onClick={() => handlePartitionFocus('middle')}
        >
          <div css={styles.partitionHeader}>
            <h2 css={styles.partitionTitle}>⚙️ Processing Zone</h2>
            {activePartition !== 'middle' && (
              <span css={styles.expandHint}>Click to expand</span>
            )}
          </div>
          <div css={styles.partitionContent}>
            <ProcessHub onProcessComplete={fetchData} />
          </div>
        </div>

        {/* Bottom Partition: Results Table */}
        <div 
          css={[
            styles.bottomPartition,
            activePartition === 'bottom' && styles.expandedPartition
          ]}
          onClick={() => handlePartitionFocus('bottom')}
        >
          <div css={styles.partitionHeader}>
            <h2 css={styles.partitionTitle}>📊 Results Table</h2>
            {activePartition !== 'bottom' && (
              <span css={styles.expandHint}>Click to expand</span>
            )}
          </div>
          <div css={styles.partitionContent}>
            {loading ? (
              <div css={styles.loadingContainer}>
                <div css={styles.spinner}></div>
                <p>Loading data...</p>
              </div>
            ) : (
              renderBottomContent()
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: css`
    height: 100vh;
    overflow: hidden;
    background: ${colors.darkGradient};
    position: relative;
  `,

  errorBanner: css`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: ${colors.error};
    color: white;
    padding: ${layout.spacing.md};
    text-align: center;
    z-index: ${layout.zIndex.banner};
  `,

  loginPrompt: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    color: ${colors.textLight};
    text-align: center;
    
    h2 {
      ${neoDecorocoBase.heading}
      margin-bottom: ${layout.spacing.lg};
    }
  `,

  threePartitionLayout: css`
    display: grid;
    height: 100vh;
    grid-template-rows: auto 1fr auto;
    transition: all 0.3s ease;
    overflow: hidden;
  `,

  topPartition: css`
    ${neoDecorocoBase.panel}
    border-bottom: 1px solid ${colors.border};
    transition: all 0.3s ease;
    cursor: pointer;
    min-height: 120px;
    max-height: 25vh;
    overflow-y: auto;
    
    &:hover {
      border-color: ${colors.neonTeal};
    }
  `,

  middlePartition: css`
    ${neoDecorocoBase.panel}
    border-bottom: 1px solid ${colors.border};
    transition: all 0.3s ease;
    cursor: pointer;
    overflow-y: auto;
    
    &:hover {
      border-color: ${colors.neonTeal};
    }
  `,

  bottomPartition: css`
    ${neoDecorocoBase.panel}
    transition: all 0.3s ease;
    cursor: pointer;
    overflow-y: auto;
    min-height: 200px;
    
    &:hover {
      border-color: ${colors.neonTeal};
    }
  `,

  expandedPartition: css`
    flex: 1;
    min-height: 75vh;
    border-color: ${colors.neonGold};
    background: rgba(26, 148, 133, 0.05);
    
    &:hover {
      border-color: ${colors.neonGold};
    }
  `,

  partitionHeader: css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${layout.spacing.md} ${layout.spacing.lg};
    border-bottom: 1px solid ${colors.border};
    background: rgba(255, 255, 255, 0.02);
  `,

  partitionTitle: css`
    color: ${colors.neonTeal};
    font-size: ${layout.typography?.sizes?.xl || '1.25rem'};
    font-weight: 600;
    margin: 0;
    display: flex;
    align-items: center;
    gap: ${layout.spacing.sm};
  `,

  expandHint: css`
    font-size: 0.875rem;
    color: ${colors.textMuted};
    opacity: 0.7;
  `,

  partitionContent: css`
    padding: ${layout.spacing.lg};
    height: 100%;
    overflow-y: auto;
  `,

  finishesSection: css`
    margin-top: ${layout.spacing.xl};
  `,

  sectionTitle: css`
    color: ${colors.neonGold};
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 ${layout.spacing.md} 0;
  `,

  finishesGrid: css`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: ${layout.spacing.sm};
  `,

  finishButton: css`
    ${neoDecorocoBase.button}
    padding: ${layout.spacing.sm} ${layout.spacing.md};
    font-size: 0.875rem;
  `,

  tabContainer: css`
    height: 100%;
    display: flex;
    flex-direction: column;
  `,

  tabs: css`
    display: flex;
    gap: ${layout.spacing.sm};
    margin-bottom: ${layout.spacing.lg};
    border-bottom: 1px solid ${colors.border};
    padding-bottom: ${layout.spacing.sm};
  `,

  tab: css`
    ${neoDecorocoBase.button}
    padding: ${layout.spacing.sm} ${layout.spacing.lg};
    background: transparent;
    border: 1px solid ${colors.border};
    
    &:hover {
      border-color: ${colors.neonTeal};
    }
  `,

  activeTab: css`
    background: rgba(26, 148, 133, 0.1);
    border-color: ${colors.neonTeal};
    color: ${colors.neonTeal};
  `,

  tableContent: css`
    flex: 1;
    overflow-y: auto;
  `,

  gridView: css`
    height: 100%;
    overflow-y: auto;
  `,

  masonryGrid: css`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: ${layout.spacing.lg};
    padding: ${layout.spacing.lg};
  `,

  gridPlaceholder: css`
    ${neoDecorocoBase.card}
    padding: ${layout.spacing.xl};
    text-align: center;
    grid-column: 1 / -1;
  `,

  placeholderIcon: css`
    font-size: 3rem;
    display: block;
    margin-bottom: ${layout.spacing.md};
  `,

  placeholderText: css`
    color: ${colors.textMuted};
    margin: ${layout.spacing.sm} 0 0 0;
    font-size: 0.875rem;
  `,

  loadingContainer: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;
    color: ${colors.textLight};
  `,

  spinner: css`
    width: 40px;
    height: 40px;
    border: 3px solid ${colors.border};
    border-top-color: ${colors.neonTeal};
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: ${layout.spacing.md};
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `
};

export default BartlebyMain;
