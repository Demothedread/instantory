
// ============================================================================
// INVENTORY COMPONENT - Inventory listing and management
// ============================================================================
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Inventory.css';

const Inventory = () => {
  // State management
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  // ========================================================================
  // AUTHENTICATION & DATA FETCHING EFFECTS
  // ========================================================================
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/');
      return;
    }
    fetchInventoryItems();
    fetchCategories();
  }, [navigate]);

  // ========================================================================
  // API FUNCTIONS
  // ========================================================================
  const fetchInventoryItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/inventory', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setItems(data.items || []);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/inventory/categories', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // ========================================================================
  // FILTERING LOGIC
  // ========================================================================
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // ========================================================================
  // EVENT HANDLERS
  // ========================================================================
  const handleItemClick = (item) => {
    navigate(`/inventory/${item.id}`);
  };

  const handleDeleteItem = async (itemId, event) => {
    event.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/inventory/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        setItems(items.filter(item => item.id !== itemId));
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  // ========================================================================
  // LOADING STATE
  // ========================================================================
  if (loading) {
    return (
      <div className="loading-container">
        <p>Loading inventory...</p>
      </div>
    );
  }

  // ========================================================================
  // MAIN RENDER
  // ========================================================================
  return (
    <div className="inventory">
      {/* Header Section */}
      <header className="inventory-header">
        <div className="header-content">
          <h1>Inventory Management</h1>
          <button onClick={() => navigate('/dashboard')} className="back-btn">
            ← Back to Dashboard
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="inventory-main">
        {/* Controls Section */}
        <div className="inventory-controls">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-controls">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="category-filter"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <button onClick={() => navigate('/upload')} className="add-btn">
            + Add Items
          </button>
        </div>

        {/* Inventory Grid */}
        <div className="inventory-grid">
          {filteredItems.length > 0 ? (
            filteredItems.map(item => (
              <div
                key={item.id}
                className="inventory-item"
                onClick={() => handleItemClick(item)}
              >
                {item.image_url && (
                  <div className="item-image">
                    <img src={item.image_url} alt={item.name} />
                  </div>
                )}
                <div className="item-details">
                  <h3>{item.name || 'Unnamed Item'}</h3>
                  <p className="item-description">
                    {item.description || 'No description available'}
                  </p>
                  {item.category && (
                    <span className="item-category">{item.category}</span>
                  )}
                  {item.quantity && (
                    <span className="item-quantity">Qty: {item.quantity}</span>
                  )}
                </div>
                <div className="item-actions">
                  <button
                    onClick={(e) => handleDeleteItem(item.id, e)}
                    className="delete-btn"
                    title="Delete item"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <h3>No items found</h3>
              <p>
                {searchTerm || filterCategory !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Start by uploading some documents or images to build your inventory'
                }
              </p>
              <button onClick={() => navigate('/upload')} className="upload-btn">
                Upload Documents
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Inventory;

// ============================================================================
// END OF INVENTORY COMPONENT
// ============================================================================
