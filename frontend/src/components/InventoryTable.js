import React, { useState } from 'react';
import config from '../config';
import './InventoryTable.css';

// Base64 encoded simple gray placeholder image
const PLACEHOLDER_IMAGE = 'instantory/frontend/src/assets/placeholder.png';

function InventoryTable({ inventory }) {
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleFilter = (category) => {
    setFilterCategory(category);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  if (!Array.isArray(inventory) || inventory.length === 0) {
    return (
      <div>
        <h2>Inventory</h2>
        <p>No inventory data available.</p>
      </div>
    );
  }

  const filteredInventory = inventory.filter((item) => {
    return (
      (filterCategory === '' || item?.category === filterCategory) &&
      (searchTerm === '' || 
       item?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       item?.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       item?.material?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       item?.origin_source?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const sortedInventory = filteredInventory.sort((a, b) => {
    if (sortColumn === null) return 0;
    const aValue = a?.[sortColumn];
    const bValue = b?.[sortColumn];
    
    if (sortColumn === 'import_cost' || sortColumn === 'retail_price') {
      return sortDirection === 'asc' 
        ? Number(aValue || 0) - Number(bValue || 0)
        : Number(bValue || 0) - Number(aValue || 0);
    }
    
    const aStr = String(aValue || '').toLowerCase();
    const bStr = String(bValue || '').toLowerCase();
    if (aStr < bStr) return sortDirection === 'asc' ? -1 : 1;
    if (aStr > bStr) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div>
      <h2>Image to Inventory</h2>
      <div className="instructions">
        <p>
          This program processes images of products, automatically categorizes them, and adds them to your inventory.<br />
          • Auto Image Processing: Users upload images of products (either individually or in bulk). The program saves each image in its original format, then adjusts sizes and encodes it into Base64 for further processing.<br />
          • AI-Driven Analysis: After encoding, the image data is passed to GPT-4, OpenAI's powerful multimodal model, which generates detailed descriptions, including product attributes (color, material, dimensions, price, etc.)<br />
          • Inventory Updates: All processed products are automatically added to a dynamic inventory table, allowing for tracking and updates, and linked to a ready made card based masonry image grid.<br />
        </p>
        
        <h4>Usage Instructions:</h4>
        <p>
          1. Upload Images: Select product images using the 'Choose Files' button and click 'Process New Images'.<br />
          2. Processing: The program will validate and process the images (ensuring they meet required size limits) and pass them through the AI for analysis.<br />
          3. View Inventory: Once processed, view the cataloged products with detailed descriptions, prices, and images in the inventory table or image grid.<br />
          4. Maintain Records: The original product images are preserved in a designated folder for future use or verification.
        </p>
      </div>

      <div className="filter-section">
        <div className="category-filter">
          <label htmlFor="category-filter">Filter by Category:</label>
          <select id="category-filter" value={filterCategory} onChange={(e) => handleFilter(e.target.value)}>
            <option value="">All</option>
            <option value="Artwork">Artwork</option>
            <option value="Furniture">Furniture</option>
            <option value="Housewares">Housewares</option>
            <option value="Tools">Tools</option>
            <option value="Clothing">Clothing</option>
            <option value="Electronics">Electronics</option>
            <option value="Others">Others</option>
          </select>
        </div>
        <div className="search-filter">
          <input 
            type="text" 
            placeholder="Search by name, description, material, or origin..." 
            value={searchTerm} 
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th onClick={() => handleSort('name')}>Name {sortColumn === 'name' && (sortDirection === 'asc' ? '▲' : '▼')}</th>
              <th onClick={() => handleSort('description')}>Description {sortColumn === 'description' && (sortDirection === 'asc' ? '▲' : '▼')}</th>
              <th>Image</th>
              <th onClick={() => handleSort('category')}>Category {sortColumn === 'category' && (sortDirection === 'asc' ? '▲' : '▼')}</th>
              <th onClick={() => handleSort('material')}>Material {sortColumn === 'material' && (sortDirection === 'asc' ? '▲' : '▼')}</th>
              <th onClick={() => handleSort('color')}>Color {sortColumn === 'color' && (sortDirection === 'asc' ? '▲' : '▼')}</th>
              <th onClick={() => handleSort('dimensions')}>Dimensions {sortColumn === 'dimensions' && (sortDirection === 'asc' ? '▲' : '▼')}</th>
              <th onClick={() => handleSort('origin_source')}>Origin {sortColumn === 'origin_source' && (sortDirection === 'asc' ? '▲' : '▼')}</th>
              <th onClick={() => handleSort('import_cost')}>Import Cost {sortColumn === 'import_cost' && (sortDirection === 'asc' ? '▲' : '▼')}</th>
              <th onClick={() => handleSort('retail_price')}>Retail Price {sortColumn === 'retail_price' && (sortDirection === 'asc' ? '▲' : '▼')}</th>
            </tr>
          </thead>
          <tbody>
            {sortedInventory.map((item, index) => {
              return (
                <tr key={index}>
                  <td>{item?.name || ''}</td>
                  <td className="description-cell">
                    {(item?.description || '').split('. ').map((sentence, idx) => (
                      <div key={idx}>{sentence.trim()}</div>
                    ))}
                  </td>
                  <td className="image-cell">
                    {item?.image_url && (
                      <img 
                        src={`${config.apiUrl}/images/${encodeURIComponent(item.image_url)}`} 
                        alt={item?.name || 'Product'} 
                        style={{width: '100px', height: 'auto'}}
                        className="inventory-image"
                        onError={(e) => {
                          if (!e.target.dataset.retried) {
                            e.target.dataset.retried = true;
                            e.target.src = PLACEHOLDER_IMAGE;
                          }
                        }}
                      />
                    )}
                  </td>   
                  <td>{item?.category || ''}</td>
                  <td>{item?.material || ''}</td>
                  <td>{item?.color || ''}</td>
                  <td>{item?.dimensions || ''}</td>
                  <td>{item?.origin_source || ''}</td>
                  <td>{item?.import_cost ? `$${Number(item.import_cost).toFixed(2)}` : ''}</td>
                  <td>{item?.retail_price ? `$${Number(item.retail_price).toFixed(2)}` : ''}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default InventoryTable;
