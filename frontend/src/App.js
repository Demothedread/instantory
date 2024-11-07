import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import InventoryTable from './components/InventoryTable';
import ImageList from './components/ImageList';
import ProcessImagesButton from './components/ProcessImagesButton';
import DocumentsTable from './components/DocumentsTable';
import config from './config';
import './App.css';

function App() {
  const [inventory, setInventory] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTableName, setNewTableName] = useState('');
  const [showNewTableDialog, setShowNewTableDialog] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch inventory data
      const invResponse = await fetch(`${config.apiUrl}/api/inventory`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!invResponse.ok) {
        throw new Error(`HTTP error! status: ${invResponse.status}`);
      }

      const invData = await invResponse.json();
      if (!invData || typeof invData !== 'object') {
        throw new Error("Invalid inventory response format");
      }

      const inventoryData = Array.isArray(invData) ? invData : [invData];
      setInventory(inventoryData);

      // Fetch documents data
      const docResponse = await fetch(`${config.apiUrl}/api/documents`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!docResponse.ok) {
        throw new Error(`HTTP error! status: ${docResponse.status}`);
      }

      const docData = await docResponse.json();
      if (!docData || typeof docData !== 'object') {
        throw new Error("Invalid documents response format");
      }

      const documentsData = Array.isArray(docData) ? docData : [docData];
      setDocuments(documentsData);

    } catch (error) {
      console.error('Error fetching data:', error);
      let errorMessage = 'Failed to fetch data. Please try again later.';

      if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
        errorMessage = 'Network error. Please check your connection and ensure the backend server is running.';
      } else if (error.message.includes('Invalid response format')) {
        errorMessage = 'Unexpected data format received from the server.';
      }

      setError(errorMessage);
      setInventory([]);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessFiles = async () => {
    await fetchData();
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
        
        await fetchData();
        alert('Inventory reset successful!');
      } catch (error) {
        console.error('Error resetting inventory:', error);
        setError('Failed to reset inventory. Please try again later.');
      }
    }
  };

  const handleResetDocuments = async () => {
    if (window.confirm('Are you sure you want to reset the documents? This will delete all document entries.')) {
      try {
        const response = await fetch(`${config.apiUrl}/api/documents/reset`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to reset documents');
        }
        
        await fetchData();
        alert('Documents reset successful!');
      } catch (error) {
        console.error('Error resetting documents:', error);
        setError('Failed to reset documents. Please try again later.');
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
      
      await fetchData();
      setShowNewTableDialog(false);
      setNewTableName('');
      alert('New inventory table created successfully!');
    } catch (error) {
      console.error('Error creating new table:', error);
      setError('Failed to create new table. Please try again later.');
    }
  };

  const handleExport = (format, type = 'inventory') => {
    const data = type === 'inventory' ? inventory : documents;
    if (data.length === 0) {
      alert('No data to export');
      return;
    }

    let exportData;
    let filename;
    let mimeType;

    switch (format) {
      case 'csv':
        exportData = convertToCSV(data);
        filename = `${type}.csv`;
        mimeType = 'text/csv';
        break;
      case 'xls':
        exportData = convertToXLS(data);
        filename = `${type}.xls`;
        mimeType = 'application/vnd.ms-excel';
        break;
      default:
        return;
    }

    const blob = new Blob([exportData], { type: mimeType });
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
    csvRows.push(headers.join(','));
    
    data.forEach(item => {
      const values = headers.map(header => {
        const value = item[header];
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
    xlsContent += '<head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Sheet1</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head>';
    xlsContent += '<body><table>';
    
    xlsContent += '<tr>' + headers.map(header => `<th>${header}</th>`).join('') + '</tr>';
    
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
        <ProcessImagesButton onProcess={handleProcessFiles} />
        <div className="App">
          <div style={{ textAlign: 'center', margin: '10px 0' }}>
            <button onClick={() => handleExport('csv', 'inventory')} style={{ backgroundColor: '#4CAF50' }}>
              Export Inventory as CSV
            </button>
            <button onClick={() => handleExport('xls', 'inventory')} style={{ backgroundColor: '#2196F3', marginLeft: '10px' }}>
              Export Inventory as XLS
            </button>
            <button onClick={() => handleExport('csv', 'documents')} style={{ backgroundColor: '#4CAF50', marginLeft: '10px' }}>
              Export Documents as CSV
            </button>
            <button onClick={() => handleExport('xls', 'documents')} style={{ backgroundColor: '#2196F3', marginLeft: '10px' }}>
              Export Documents as XLS
            </button>
            <button onClick={handleResetInventory} style={{ marginLeft: '20px', backgroundColor: '#ff4444' }}>
              Reset Inventory
            </button>
            <button onClick={handleResetDocuments} style={{ marginLeft: '10px', backgroundColor: '#ff4444' }}>
              Reset Documents
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
              <li>
                <Link to="/documents">Documents</Link>
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
              <Route 
                path="/documents" 
                element={
                  loading ? (
                    <div>Loading documents...</div>
                  ) : (
                    <DocumentsTable documents={documents} />
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
