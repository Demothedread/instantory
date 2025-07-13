import React, { useEffect, useState, useRef, useId } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';

import DocumentsTable from '../DocumentsTable';
import ImageList from '../ImageList';
import InventoryTable from '../InventoryTable';
import layout from '../../../styles/layouts/constraints';
import styles from './styles';

/**
 * Enhanced Rolodex Component
 * Component Genealogy: Physical Rolodex -> Digital Carousel -> Data Observatory
 * Integrates MagicUI-inspired 3D transforms with neo-decoroco aesthetics
 * 
 * @param {Object} props - Component properties
 * @param {Array} props.inventory - Inventory data array
 * @param {Array} props.documents - Documents data array
 * @param {Function} props.onViewChange - Callback when view changes
 * @param {boolean} props.autoRotate - Enable auto-rotation
 * @param {number} props.autoRotateInterval - Auto-rotation interval in ms
 */
const EnhancedRolodex = ({ 
  inventory = [], 
  documents = [], 
  onViewChange = () => {},
  autoRotate = false,
  autoRotateInterval = 5000
}) => {
  const [currentView, setCurrentView] = useState(0);
  const [availableViews, setAvailableViews] = useState([]);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const containerRef = useRef(null);
  const rotationRef = useRef(0);
  const frameRef = useRef();
  const autoRotateRef = useRef(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-300, 300], [30, -30]);
  const rotateY = useTransform(x, [-300, 300], [-30, 30]);
  
  const componentId = useId();

  // Determine available views based on data
  useEffect(() => {
    const views = [];
    
    if (Array.isArray(inventory) && inventory.length > 0) {
      views.push({
        id: 'inventory',
        name: 'Data Archives',
        subtitle: `${inventory.length} items catalogued`,
        component: <InventoryTable inventory={inventory} />,
        hasData: true,
        icon: '📊',
        color: '#00D4FF', // neonTeal
        description: 'Structured inventory database with intelligent categorization',
        stats: {
          total: inventory.length,
          processed: inventory.filter(item => item.status === 'processed').length,
          pending: inventory.filter(item => item.status === 'pending').length
        }
      });
      
      // Only show images view if there are items with image_url
      const hasImages = inventory.some(item => item.image_url);
      if (hasImages) {
        const imageCount = inventory.filter(item => item.image_url).length;
        views.push({
          id: 'images',
          name: 'Visual Intelligence',
          subtitle: `${imageCount} images analyzed`,
          component: <ImageList inventory={inventory} />,
          hasData: true,
          icon: '🖼️',
          color: '#FF00A5', // neonPurple
          description: 'Computer vision analysis and pattern recognition',
          stats: {
            total: imageCount,
            analyzed: imageCount,
            formats: [...new Set(inventory.filter(item => item.image_url).map(item => item.file_type))].length
          }
        });
      }
    }

    if (Array.isArray(documents) && documents.length > 0) {
      views.push({
        id: 'documents',
        name: 'Knowledge Vault',
        subtitle: `${documents.length} documents indexed`,
        component: <DocumentsTable documents={documents} />,
        hasData: true,
        icon: '📚',
        color: '#FFD700', // neonGold
        description: 'Semantic search and document intelligence pipeline',
        stats: {
          total: documents.length,
          indexed: documents.filter(doc => doc.indexed).length,
          categories: [...new Set(documents.map(doc => doc.category))].length
        }
      });
    }

    // If no data is available, show welcome state
    if (views.length === 0) {
      views.push({
        id: 'welcome',
        name: 'Data Observatory',
        subtitle: 'Ready for initialization',
        component: (
          <div css={styles.welcomeState}>
            <motion.div 
              css={styles.welcomeIcon}
              animate={{ 
                rotate: [0, 360], 
                scale: [1, 1.1, 1] 
              }}
              transition={{ 
                duration: 10, 
                repeat: Infinity, 
                ease: "linear" 
              }}
            >
              🌟
            </motion.div>
            <div css={styles.welcomeContent}>
              <h3 css={styles.welcomeTitle}>Intelligence System Ready</h3>
              <p css={styles.welcomeMessage}>
                Upload documents and images to begin data analysis and knowledge extraction
              </p>
              <div css={styles.welcomeFeatures}>
                <div css={styles.featureItem}>
                  <span css={styles.featureIcon}>🧠</span>
                  <span>AI Analysis</span>
                </div>
                <div css={styles.featureItem}>
                  <span css={styles.featureIcon}>🔍</span>
                  <span>Vector Search</span>
                </div>
                <div css={styles.featureItem}>
                  <span css={styles.featureIcon}>📈</span>
                  <span>Data Insights</span>
                </div>
              </div>
            </div>
          </div>
        ),
        hasData: false,
        icon: '🌟',
        color: '#00FF39', // neonGreen
        description: 'Initialize your data intelligence pipeline'
      });
    }

    setAvailableViews(views);
    onViewChange(views[currentView] || null);
  }, [inventory, documents, currentView, onViewChange]);

  // Auto-rotation logic
  useEffect(() => {
    if (autoRotate && !isHovered && availableViews.length > 1) {
      autoRotateRef.current = setInterval(() => {
        setCurrentView(prev => (prev + 1) % availableViews.length);
      }, autoRotateInterval);
    } else {
      if (autoRotateRef.current) {
        clearInterval(autoRotateRef.current);
        autoRotateRef.current = null;
      }
    }

    return () => {
      if (autoRotateRef.current) {
        clearInterval(autoRotateRef.current);
      }
    };
  }, [autoRotate, isHovered, availableViews.length, autoRotateInterval]);

  // Mouse tracking for 3D effects
  useEffect(() => {
    const animate = () => {
      if (containerRef.current && isHovered) {
        x.set(mousePosition.x);
        y.set(mousePosition.y);
      } else {
        x.set(0);
        y.set(0);
      }
      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [isHovered, mousePosition, x, y]);

  const handleMouseMove = (event) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    setMousePosition({
      x: (event.clientX - centerX) * 0.3,
      y: (event.clientY - centerY) * 0.3
    });
  };

  const handleNext = () => {
    setCurrentView((prev) => (prev + 1) % availableViews.length);
  };

  const handlePrev = () => {
    setCurrentView((prev) => (prev - 1 + availableViews.length) % availableViews.length);
  };

  const handleViewSelect = (index) => {
    setCurrentView(index);
  };

  if (availableViews.length === 0) {
    return null;
  }

  const currentViewData = availableViews[currentView];

  return (
    <div css={styles.container}>
      {/* Background elements */}
      <div css={styles.backgroundPattern}>
        <motion.div 
          css={styles.geometricElement1}
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity, 
            ease: "linear" 
          }}
        />
        <motion.div 
          css={styles.geometricElement2}
          animate={{ 
            rotate: [360, 0],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ 
            duration: 15, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
      </div>

      {/* Control Header */}
      <motion.div 
        css={styles.controlHeader}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.button 
          css={[styles.navigationButton, styles.prevButton]}
          onClick={handlePrev}
          disabled={availableViews.length <= 1}
          whileHover={{ scale: 1.05, x: -2 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Previous view"
        >
          <span css={styles.buttonIcon}>◀</span>
        </motion.button>

        <div css={styles.titleSection}>
          <motion.h2 
            css={styles.viewTitle}
            key={currentViewData.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span css={styles.titleIcon}>{currentViewData.icon}</span>
            {currentViewData.name}
          </motion.h2>
          <motion.p 
            css={styles.viewSubtitle}
            key={currentViewData.subtitle}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            {currentViewData.subtitle}
          </motion.p>
        </div>

        <motion.button 
          css={[styles.navigationButton, styles.nextButton]}
          onClick={handleNext}
          disabled={availableViews.length <= 1}
          whileHover={{ scale: 1.05, x: 2 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Next view"
        >
          <span css={styles.buttonIcon}>▶</span>
        </motion.button>
      </motion.div>

      {/* View Indicators */}
      <div css={styles.viewIndicators}>
        {availableViews.map((view, index) => (
          <motion.button
            key={view.id}
            css={[
              styles.indicator,
              currentView === index && styles.indicatorActive
            ]}
            onClick={() => handleViewSelect(index)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            style={{ '--indicator-color': view.color }}
            aria-label={`Switch to ${view.name}`}
          >
            <span css={styles.indicatorIcon}>{view.icon}</span>
          </motion.button>
        ))}
      </div>

      {/* Main Rolodex Viewport */}
      <motion.div 
        ref={containerRef}
        css={styles.rolodexViewport}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          perspective: 1200,
          rotateX,
          rotateY,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            css={styles.viewCard}
            style={{ '--view-color': currentViewData.color }}
            initial={{ 
              opacity: 0, 
              rotateY: 90, 
              scale: 0.8,
              z: -100 
            }}
            animate={{ 
              opacity: 1, 
              rotateY: 0, 
              scale: 1,
              z: 0 
            }}
            exit={{ 
              opacity: 0, 
              rotateY: -90, 
              scale: 0.8,
              z: -100 
            }}
            transition={{ 
              duration: 0.8, 
              ease: [0.4, 0.0, 0.2, 1],
              opacity: { duration: 0.4 }
            }}
          >
            {/* Card Header */}
            <div css={styles.cardHeader}>
              <div css={styles.cardTitleSection}>
                <span css={styles.cardIcon}>{currentViewData.icon}</span>
                <div>
                  <h3 css={styles.cardTitle}>{currentViewData.name}</h3>
                  <p css={styles.cardDescription}>{currentViewData.description}</p>
                </div>
              </div>
              
              {currentViewData.stats && (
                <div css={styles.statsSection}>
                  {Object.entries(currentViewData.stats).map(([key, value]) => (
                    <div key={key} css={styles.statItem}>
                      <span css={styles.statValue}>{value}</span>
                      <span css={styles.statLabel}>{key}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Card Content */}
            <div css={styles.cardContent}>
              {currentViewData.component}
            </div>

            {/* Card decorative elements */}
            <div css={styles.cardDecorations}>
              <motion.div 
                css={styles.cornerDecoration}
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <motion.div 
                css={styles.borderGlow}
                animate={{ 
                  boxShadow: [
                    `0 0 20px ${currentViewData.color}30`,
                    `0 0 40px ${currentViewData.color}50`,
                    `0 0 20px ${currentViewData.color}30`
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Status Bar */}
      <motion.div 
        css={styles.statusBar}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <div css={styles.statusInfo}>
          <span css={styles.statusLabel}>View:</span>
          <span css={styles.statusValue}>
            {currentView + 1} of {availableViews.length}
          </span>
        </div>
        
        {autoRotate && (
          <div css={styles.statusInfo}>
            <span css={styles.statusIndicator}>🔄</span>
            <span css={styles.statusLabel}>Auto-rotating</span>
          </div>
        )}
        
        <div css={styles.statusInfo}>
          <span css={styles.statusIndicator}>⚡</span>
          <span css={styles.statusLabel}>Intelligence Active</span>
        </div>
      </motion.div>
    </div>
  );
};

export default EnhancedRolodex;
