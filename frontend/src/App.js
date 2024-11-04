import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import InventoryTable from './components/InventoryTable';
import ImageList from './components/ImageList';
import ProcessImagesButton from './components/ProcessImagesButton';
import './App.css';

function App() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTableName, setNewTableName] = useState('');
  const [showNewTableDialog, setShowNewTableDialog] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true); 
    setError(null); 
    try {
      const response = await fetch('${process.env.PUBLIC_BACKEND_URL}/api/inventory');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
  
      if (!data || typeof data !== 'object') {
        throw new Error("Invalid response format");
      }
  
      const inventoryData = Array.isArray(data) ? data : [data];
  
      console.log('Received inventory data:', inventoryData);
      setInventory(inventoryData);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      let errorMessage = 'Failed to fetch inventory. Please try again later.';
      
      if (error.message.includes('NetworkError')) {
        errorMessage = 'Network error. Please check your connection.';
      } else if (error.message.includes('Invalid response format')) {
        errorMessage = 'Unexpected data format received from the server.';
      }
      
      setError(errorMessage);
      setInventory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetInventory = async () => {
    if (window.confirm('Are you sure you want to reset the current inventory? This will delete all entries and images.')) {
      try {
        const response = await fetch('${process.env.PUBLIC_BACKEND_URL}/api/inventory/reset', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ table_name: 'products' }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to reset inventory');
        }
        
        await fetchInventory();
        alert('Inventory reset successful!');
      } catch (error) {
        console.error('Error resetting inventory:', error);
        setError('Failed to reset inventory. Please try again later.');
      }
    }
  };

  const handleCreateNewTable = async () => {
    if (!newTableName.trim()) {
      alert('Please enter a valid table name');
      return;
    }

    try {
      const response = await fetch('${process.env.PUBLIC_BACKEND_URL}/api/inventory/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ table_name: newTableName.trim() }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create new table');
      }
      
      await fetchInventory();
      setShowNewTableDialog(false);
      setNewTableName('');
      alert('New inventory table created successfully!');
    } catch (error) {
      console.error('Error creating new table:', error);
      setError('Failed to create new table. Please try again later.');
    }
  };

  const handleExport = (format) => {
    let data;
    switch (format) {
      case 'csv':
        data = convertToCSV(inventory);
        break;
      case 'xml':
        data = convertToXML(inventory);
        break;
      case 'sql':
        data = convertToSQL(inventory);
        break;
      default:
        return;
    }
    saveToFile(data, format);
  };

  const convertToCSV = (data) => {
    const header = Object.keys(data[0]).join(',') + '\n';
    const rows = data.map(item => Object.values(item).join(',')).join('\n');
    return header + rows;
  };

  const convertToXML = (data) => {
    const xml = data.map(item => {
      return `<item>${Object.entries(item).map(([key, value]) => `<${key}>${value}</${key}>`).join('')}</item>`;
    }).join('');
    return `<inventory>${xml}</inventory>`;
  };

  const convertToSQL = (data) => {
    return data.map(item => {
      return `INSERT INTO inventory (name, description, category, material, color, dimensions, origin_source, import_cost, retail_price) VALUES ('${item.name}', '${item.description}', '${item.category}', '${item.material}', '${item.color}', '${item.dimensions}', '${item.origin_source}', ${item.import_cost}, ${item.retail_price});`;
    }).join('\n');
  };

  const saveToFile = (data, format) => {
    const blob = new Blob([data], { type: format === 'csv' ? 'text/csv' : 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Router>
      <div className="content-center">
        <h1>The Power Sorcerer's</h1>
        <h2>Inventory Management System</h2>
        <ProcessImagesButton onProcess={handleProcessImages} />
        <div className="App">
          <div style={{ textAlign: 'center', margin: '10px 0' }}>
            <button onClick={() => handleExport('csv')}>Export as CSV</button>
            <button onClick={() => handleExport('xml')}>Export as XML</button>
            <button onClick={() => handleExport('sql')}>Export as SQL</button>
            <button onClick={handleResetInventory} style={{ marginLeft: '20px', backgroundColor: '#ff4444' }}>
              Reset Inventory
            </button>
            <button onClick={() => setShowNewTableDialog(true)} style={{ marginLeft: '10px', backgroundColor: '#44ff44' }}>
              New Inventory Table
            </button>
          </div>

          {showNewTableDialog && (
            <div className="modal" style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '5px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              zIndex: 1000
            }}>
              <h3>Create New Inventory Table</h3>
              <input
                type="text"
                value={newTableName}
                onChange={(e) => setNewTableName(e.target.value)}
                placeholder="Enter table name"
                style={{ margin: '10px 0' }}
              />
              <div>
                <button onClick={handleCreateNewTable}>Create</button>
                <button onClick={() => setShowNewTableDialog(false)} style={{ marginLeft: '10px' }}>Cancel</button>
              </div>
            </div>
          )}

          <nav>
            <ul className="nav-links">
              <li>
                <Link to="/">Inventory Table</Link>
              </li>
              <li>
                <Link to="/images">Image Grid</Link>
              </li>
            </ul>
          </nav>
          {error && <div className="error-message">{error}</div>}

          <div className="main-content" style={{ padding: '20px' }}>
            <Routes>
              <Route 
                path="/" 
                element={
                  loading ? (
                    <div>Loading inventory...</div>
                  ) : (
                    <InventoryTable inventory={inventory} />
                  )
                } 
              />
              <Route 
                path="/images" 
                element={
                  loading ? (
                    <div>Loading images...</div>
                  ) : (
                    <ImageList inventory={inventory} />
                  )
                } 
              />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
