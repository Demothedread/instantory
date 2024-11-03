import React, { useState } from 'react';
import Masonry from 'react-masonry-css';
import './ImageList.css';

function ImageList({ inventory = [] }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [imageError, setImageError] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  if (!Array.isArray(inventory) || inventory.length === 0) {
    return (
      <div>
        <h2>Product Images</h2>
        <p>No images available.</p>
      </div>
    );
  }

  const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1
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

  const formatPrice = (price) => {
    if (price === null || price === undefined || price === 'null') return 'N/A';
    return `$${Number(price).toFixed(2)}`;
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

  return (
    <div>
      <h2>Product Images</h2>
      <div className="filter-section">
        <div className="category-filter">
          <label htmlFor="category-filter">Filter by Category:</label>
          <select 
            id="category-filter" 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">All</option>
            <option value="Beads">Beads</option>
            <option value="Stools">Stools</option>
            <option value="Bowls">Bowls</option>
            <option value="Fans">Fans</option>
            <option value="Totebags">Totebags</option>
            <option value="Home Decor">Home Decor</option>
          </select>
        </div>
        <div className="search-filter">
          <input 
            type="text" 
            placeholder="Search by name, description, material, or origin..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="my-masonry-grid"
        columnClassName="my-masonry-grid_column"
      >
        {filteredInventory.map((item, index) => {
          if (!item?.image_url) return null;
      
          return (
            <div key={index} className="image-item" onClick={() => handleImageClick(item)}>
              {!imageError[index] ? (
                <img 
                  src={`http://${process.env.PUBLIC_BACKEND_URL}/images/${encodeURIComponent(item.image_url)}`}
                  alt={item.name || 'Product'}
                  onError={() => handleImageError(index)}
                />
              ) : (
                <div className="image-error">Image not available</div>
              )}
              <div className="image-overlay">
                <h3>{item.name || 'Unnamed Product'}</h3>
                <p>Price: {formatPrice(item.retail_price)}</p>
              </div>
            </div>
          );
        })}
      </Masonry>

      {selectedItem && (
        <div className="modal" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <span className="close" onClick={closeModal}>&times;</span>
            <h2>{selectedItem.name || 'Unnamed Product'}</h2>
            <img 
              src={`http://${process.env.PUBLIC_BACKEND_URL}/images/${encodeURIComponent(selectedItem.image_url)}`}
              alt={selectedItem.name || 'Product'}
              style={{maxWidth: '100%', height: 'auto'}}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <div className="image-error" style={{display: 'none'}}>Image not available</div>
            <div className="modal-details">
              <p className="description">{selectedItem.description || 'No description available'}</p>
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
}

export default ImageList;
