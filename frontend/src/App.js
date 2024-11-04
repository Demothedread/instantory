import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import InventoryTable from './components/InventoryTable';
import ImageList from './components/ImageList';
import ProcessImagesButton from './components/ProcessImagesButton';
import config from './config';
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
      const response = await fetch(`${config.apiUrl}/api/inventory`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        }
      });

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

      if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
        errorMessage = 'Network error. Please check your connection and ensure the backend server is running.';
      } else if (error.message.includes('Invalid response format')) {
        errorMessage = 'Unexpected data format received from the server.';
      }

      setError(errorMessage);
      setInventory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessImages = async () => {
    await fetchInventory();
  };

  const handleResetInventory = async () => {
    if (window.confirm('Are you sure you want to reset the current inventory? This will delete all entries and images.')) {
      try {
        const response = await fetch(`${config.apiUrl}/api/inventory/reset`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
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
      const response = await fetch(`${config.apiUrl}/api/inventory/reset`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
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
    if (inventory.length === 0) {
      alert('No data to export');
      return;
    }

    let data;
    let filename;
    let mimeType;

    switch (format) {
      case 'csv':
        data = convertToCSV(inventory);
        filename = 'inventory.csv';
        mimeType = 'text/csv';
        break;
      case 'xls':
        data = convertToXLS(inventory);
        filename = 'inventory.xls';
        mimeType = 'application/vnd.ms-excel';
        break;
      default:
        return;
    }

    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const convertToCSV = (data) => {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]).filter(key => 
      !key.includes('_url') && !key.includes('id')
    );
    
    const csvRows = [];
    
    // Add headers
    csvRows.push(headers.join(','));
    
    // Add data rows
    data.forEach(item => {
      const values = headers.map(header => {
        const value = item[header];
        // Handle special cases (null, undefined, strings with commas)
        if (value == null) return '';
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value;
      });
      csvRows.push(values.join(','));
    });
    
    return csvRows.join('\n');
  };

  const convertToXLS = (data) => {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]).filter(key => 
      !key.includes('_url') && !key.includes('id')
    );
    
    let xlsContent = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">';
    xlsContent += '<head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Inventory</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head>';
    xlsContent += '<body><table>';
    
    // Add headers
    xlsContent += '<tr>' + headers.map(header => `<th>${header}</th>`).join('') + '</tr>';
    
    // Add data rows
    data.forEach(item => {
      xlsContent += '<tr>';
      headers.forEach(header => {
        const value = item[header] ?? '';
        xlsContent += `<td>${value}</td>`;
      });
      xlsContent += '</tr>';
    });
    
    xlsContent += '</table></body></html>';
    return xlsContent;
  };

  return (
    <Router>
      <div className="content-center">
        <h1>The Power Sorcerer's</h1>
        <h2>Inventory Management System</h2>
        <ProcessImagesButton onProcess={handleProcessImages} />
        <div className="App">
          <div style={{ textAlign: 'center', margin: '10px 0' }}>
            <button onClick={() => handleExport('csv')} style={{ backgroundColor: '#4CAF50' }}>
              Export as CSV
            </button>
            <button onClick={() => handleExport('xls')} style={{ backgroundColor: '#2196F3', marginLeft: '10px' }}>
              Export as XLS
            </button>
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
