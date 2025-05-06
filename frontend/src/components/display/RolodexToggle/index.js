import React, { useEffect, useState } from 'react';

import DocumentsTable from '../DocumentsTable';
import ImageList from '../ImageList';
import InventoryTable from '../InventoryTable';
import layout from '../../../styles/layouts/constraints';
import styles from './styles';

const RolodexToggle = ({ inventory, documents }) => {
  const [currentView, setCurrentView] = useState(0);
  const [availableViews, setAvailableViews] = useState([]);

  // Determine which views should be available based on data
  useEffect(() => {
    const views = [];
    
    if (Array.isArray(inventory) && inventory.length > 0) {
      views.push({
        name: 'Inventory',
        component: <InventoryTable inventory={inventory} />,
        hasData: true
      });
      
      // Only show images view if there are items with image_url
      const hasImages = inventory.some(item => item.image_url);
      if (hasImages) {
        views.push({
          name: 'Images',
          component: <ImageList inventory={inventory} />,
          hasData: true
        });
      }
    }

    if (Array.isArray(documents) && documents.length > 0) {
      views.push({
        name: 'Documents',
        component: <DocumentsTable documents={documents} />,
        hasData: true
      });
    }

    // If no data is available, show empty states
    if (views.length === 0) {
      views.push({
        name: 'Inventory',
        component: (
          <div css={styles.emptyState}>
            <div className="icon">📊</div>
            <div className="message">No inventory data available</div>
            <div className="submessage">Upload some items to get started!</div>
          </div>
        ),
        hasData: false
      });
    }

    setAvailableViews(views);
  }, [inventory, documents]);

  const handleNext = () => {
    setCurrentView((prev) => (prev + 1) % availableViews.length);
  };

  const handlePrev = () => {
    setCurrentView((prev) => (prev - 1 + availableViews.length) % availableViews.length);
  };

  if (availableViews.length === 0) {
    return null;
  }

  return (
    <div css={styles.container}>
      <div css={styles.controls}>
        <button 
          css={styles.navigationButton}
          onClick={handlePrev}
          disabled={availableViews.length <= 1}
        >
          ◀
        </button>
        <h2 css={styles.title}>
          {availableViews[currentView].name}
        </h2>
        <button 
          css={styles.navigationButton}
          onClick={handleNext}
          disabled={availableViews.length <= 1}
        >
          ▶
        </button>
      </div>

      <div css={styles.view}>
        <div
          css={styles.carousel}
          style={{
            transform: `rotateY(${currentView * -layout.components.rolodex.rotationDegree}deg)`,
          }}
        >
          {availableViews.map((view, index) => (
            <div
              key={view.name}
              css={styles.item}
              className={currentView === index ? 'active' : ''}
              style={{
                transform: `rotateY(${index * layout.components.rolodex.rotationDegree}deg) translateZ(${layout.components.rolodex.translateZ})`,
              }}
            >
              {view.component}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RolodexToggle;
