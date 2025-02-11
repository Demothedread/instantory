import React, { useState } from 'react';

import Masonry from 'react-masonry-css';
import styles from './styles';

const formatPrice = (price) => {
  if (price === null || price === undefined || price === 'null') return 'N/A';
  return `$${Number(price).toFixed(2)}`;
};

const ImageList = ({ inventory = [] }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [imageError, setImageError] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const breakpointColumns = {
    default: 4,
    1400: 3,
    1000: 2,
    700: 1
  };

  const handleImageClick = (item) => {
    setSelectedItem(item);
  };

  const closeModal = () => {
    setSelectedItem(null);
  };

  const handleImageError = (index) => {
    setImageError(prev => ({ ...prev, [index]: true }));
  };

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch = searchTerm === '' || 
      item?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item?.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item?.material?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item?.origin_source?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = filterCategory === '' || item?.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  if (!Array.isArray(inventory) || inventory.length === 0) {
    return (
      <div css={styles.container}>
        <h2 css={styles.header}>Product Images</h2>
        <div css={styles.imageError}>No images available.</div>
      </div>
    );
  }

  return (
    <div css={styles.container}>
      <h1 css={styles.header}>Product Images</h1>
      
      <div css={styles.filterSection}>
        <div css={styles.searchFilter}>
          <input 
            type="text" 
            placeholder="Search by name, description, material, or origin..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div css={styles.filterMenu}>
          <button 
            className="filter-menu-trigger"
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            onBlur={() => setTimeout(() => setShowFilterMenu(false), 200)}
          >
            Filter by Category
          </button>
          {showFilterMenu && (
            <div className="filter-dropdown">
              <button onClick={() => setFilterCategory('')}>All</button>
              <button onClick={() => setFilterCategory('Beads')}>Beads</button>
              <button onClick={() => setFilterCategory('Stools')}>Stools</button>
              <button onClick={() => setFilterCategory('Bowls')}>Bowls</button>
              <button onClick={() => setFilterCategory('Fans')}>Fans</button>
              <button onClick={() => setFilterCategory('Totebags')}>Totebags</button>
              <button onClick={() => setFilterCategory('Home Decor')}>Home Decor</button>
            </div>
          )}
        </div>
      </div>

      <Masonry
        breakpointCols={breakpointColumns}
        css={styles.masonryGrid}
        columnClassName="masonry-grid_column"
      >
        {filteredInventory.map((item, index) => {
          if (!item?.image_url) return null;
      
          return (
            <div 
              key={index} 
              css={styles.imageItem} 
              onClick={() => handleImageClick(item)}
            >
              {!imageError[index] ? (
                <img 
                  src={item.image_url}
                  alt={item.name || 'Product'}
                  onError={() => handleImageError(index)}
                />
              ) : (
                <div css={styles.imageError}>Image not available</div>
              )}
              <div css={styles.imageOverlay}>
                <h3>{item.name || 'Unnamed Product'}</h3>
                <p>Price: {formatPrice(item.retail_price)}</p>
              </div>
            </div>
          );
        })}
      </Masonry>

      {selectedItem && (
        <div css={styles.modal} onClick={closeModal}>
          <div css={styles.modalContent} onClick={e => e.stopPropagation()}>
            <span className="close" onClick={closeModal}>&times;</span>
            <h2>{selectedItem.name || 'Unnamed Product'}</h2>
            <img 
              src={selectedItem.image_url}
              alt={selectedItem.name || 'Product'}
              css={styles.modalImage}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <div css={styles.imageError} style={{display: 'none'}}>
              Image not available
            </div>
            <div css={styles.modalDetails}>
              <p className="description">
                {selectedItem.description || 'No description available'}
              </p>
              <div className="details-grid">
                <div className="detail-item">
                  <strong>Material:</strong> {selectedItem.material || 'N/A'}
                </div>
                <div className="detail-item">
                  <strong>Color:</strong> {selectedItem.color || 'N/A'}
                </div>
                <div className="detail-item">
                  <strong>Dimensions:</strong> {selectedItem.dimensions || 'N/A'}
                </div>
                <div className="detail-item">
                  <strong>Origin:</strong> {selectedItem.origin_source || 'N/A'}
                </div>
                <div className="detail-item">
                  <strong>Import Cost:</strong> {formatPrice(selectedItem.import_cost)}
                </div>
                <div className="detail-item">
                  <strong>Retail Price:</strong> {formatPrice(selectedItem.retail_price)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageList;
