import React, { useCallback, useEffect, useRef, useState } from 'react';

import config from '../../../config';
import placeholderImage from '../../../assets/icons/placeholder.png';
import styles from './styles';

function InventoryTable() {
  const [inventory, setInventory] = useState([]);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchTimeout = useRef(null);

  const fetchInventory = useCallback(async (searchParams = {}) => {
    setIsLoading(true);
    try {
      const baseUrl = `${config.apiUrl}/api`;
      const url = searchParams.query || searchParams.category
        ? `${baseUrl}/inventory/search?${new URLSearchParams(searchParams)}`
        : `${baseUrl}/inventory`;

      const response = await fetch(url, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setInventory(data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setInventory([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      const searchParams = {};
      if (searchTerm) searchParams.query = searchTerm;
      if (filterCategory) searchParams.category = filterCategory;
      fetchInventory(searchParams);
    }, 300);

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchTerm, filterCategory, fetchInventory]);

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleFilter = useCallback((category) => {
    setFilterCategory(category);
  }, []);

  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
  }, []);

  if (isLoading) {
    return (
      <div css={styles.loadingContainer}>
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading inventory...</p>
      </div>
    );
  }

  if (!Array.isArray(inventory) || inventory.length === 0) {
    return (
      <div css={styles.container}>
        <h2 css={styles.title}>
          <span className="title-text">Inventory</span>
        </h2>
        <div css={styles.emptyState}>
          <div className="empty-state-icon">📦</div>
          <p className="empty-state-text">No inventory data available.</p>
          <p className="empty-state-subtext">Upload some items to get started!</p>
        </div>
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
    <div css={styles.container}>
      <div className="header-section">
        <h1 css={styles.title}>
          <span className="title-text">Inventory</span>
        </h1>
      </div>

      <div css={styles.filterSection}>
        <div css={styles.searchFilter}>
          <div className="search-input-wrapper">
            <input 
              type="text" 
              placeholder="Search by name, description, material, or origin..." 
              value={searchTerm} 
              onChange={(e) => handleSearch(e.target.value)}
            />
            <div className="search-icon">🔍</div>
          </div>
        </div>
        <div css={styles.filterMenu}>
          <button 
            className="filter-menu-trigger"
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            onBlur={() => setTimeout(() => setShowFilterMenu(false), 200)}
          >
            <span className="filter-icon">🏷️</span>
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

      <div css={styles.tableContainer}>
        <table>
          <thead>
            <tr>
              <th onClick={() => handleSort('name')}>
                Name {sortColumn === 'name' && (sortDirection === 'asc' ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('description')}>
                Description {sortColumn === 'description' && (sortDirection === 'asc' ? '▲' : '▼')}
              </th>
              <th>Image</th>
              <th onClick={() => handleSort('category')}>
                Category {sortColumn === 'category' && (sortDirection === 'asc' ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('material')}>
                Material {sortColumn === 'material' && (sortDirection === 'asc' ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('color')}>
                Color {sortColumn === 'color' && (sortDirection === 'asc' ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('dimensions')}>
                Dimensions {sortColumn === 'dimensions' && (sortDirection === 'asc' ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('origin_source')}>
                Origin {sortColumn === 'origin_source' && (sortDirection === 'asc' ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('import_cost')}>
                Import Cost {sortColumn === 'import_cost' && (sortDirection === 'asc' ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('retail_price')}>
                Retail Price {sortColumn === 'retail_price' && (sortDirection === 'asc' ? '▲' : '▼')}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedInventory.map((item, index) => (
              <tr key={index} className="inventory-row">
                <td className="name-cell">{item?.name || ''}</td>
                <td className="description-cell">
                  {(item?.description || '').split('. ').map((sentence, idx) => (
                    <div key={idx} className="description-line">{sentence.trim()}</div>
                  ))}
                </td>
                <td className="image-cell">
                  <div className="image-wrapper">
                    {item?.image_url && (
                      <img 
                        src={item.image_url} 
                        alt={item?.name || 'Product'} 
                        onError={(e) => {
                          if (!e.target.dataset.retried) {
                            e.target.dataset.retried = true;
                            e.target.src = placeholderImage;
                          }
                        }}
                      />
                    )}
                  </div>
                </td>   
                <td className="category-cell">
                  <span className="category-badge">{item?.category || ''}</span>
                </td>
                <td>{item?.material || ''}</td>
                <td className="color-cell">
                  <span 
                    className="color-dot" 
                    style={{ backgroundColor: item?.color || 'transparent' }}
                  ></span>
                  {item?.color || ''}
                </td>
                <td>{item?.dimensions || ''}</td>
                <td>{item?.origin_source || ''}</td>
                <td className="price-cell">
                  {item?.import_cost ? `$${Number(item.import_cost).toFixed(2)}` : ''}
                </td>
                <td className="price-cell">
                  {item?.retail_price ? `$${Number(item.retail_price).toFixed(2)}` : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default InventoryTable;
