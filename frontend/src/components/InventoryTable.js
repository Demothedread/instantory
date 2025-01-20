import React, { useState } from 'react';
import config from '../config';
import './InventoryTable.css';
import placeholderImage from '../assets/icons/placeholder.png';

function InventoryTable({ inventory }) {
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterMenu, setShowFilterMenu] = useState(false);

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
      <div className="inventory-container">
        <h2 className="title">Inventory</h2>
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
    <div className="inventory-container">
      <div className="header-section">
        <h1 className="title">Inventory</h1>
      </div>

      <div className="filter-section">
        <div className="search-filter">
          <input 
            type="text" 
            placeholder="Search by name, description, material, or origin..." 
            value={searchTerm} 
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-menu-container">
          <button 
            className="filter-menu-trigger" 
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            onBlur={() => setTimeout(() => setShowFilterMenu(false), 200)}
          >
            Filter by Category
          </button>
          {showFilterMenu && (
            <div className="filter-dropdown">
              <button onClick={() => handleFilter('')}>All</button>
              <button onClick={() => handleFilter('Beads')}>Beads</button>
              <button onClick={() => handleFilter('Stools')}>Stools</button>
              <button onClick={() => handleFilter('Bowls')}>Bowls</button>
              <button onClick={() => handleFilter('Fans')}>Fans</button>
              <button onClick={() => handleFilter('Totebags')}>Totebags</button>
              <button onClick={() => handleFilter('Home Decor')}>Home Decor</button>
            </div>
          )}
        </div>
      </div>

      <div className="table-container">
        <table className="inventory-table">
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
            {sortedInventory.map((item, index) => (
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
                      src={item.image_url} 
                      alt={item?.name || 'Product'} 
                      className="inventory-image"
                      onError={(e) => {
                        if (!e.target.dataset.retried) {
                          e.target.dataset.retried = true;
                          e.target.src = placeholderImage;
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default InventoryTable;
