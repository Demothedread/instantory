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
  const [showInventoryDropdown, setShowInventoryDropdown] = useState(false);
  const [showDocumentsDropdown, setShowDocumentsDropdown] = useState(false);
  const [showMainMenu, setShowMainMenu] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);


  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch inventory data
      try {
        const invResponse = await fetch(`${config.apiUrl}/api/inventory`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Origin': window.location.origin,
          },
        });

        if (invResponse.ok) {
          const invData = await invResponse.json();
          if (invData && typeof invData === 'object') {
            const inventoryData = Array.isArray(invData) ? invData : [invData];
            setInventory(inventoryData);
          }
        } else {
          console.log('No inventory data available');
          setInventory([]);
        }
      } catch (invError) {
        console.log('Error fetching inventory:', invError);
        setInventory([]);
      }

      // Fetch documents data
      try {
        const docResponse = await fetch(`${config.apiUrl}/api/document-vault`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Origin': window.location.origin,
          },
        });

        if (docResponse.ok) {
          const docData = await docResponse.json();
          if (docData && typeof docData === 'object') {
            const documentsData = Array.isArray(docData) ? docData : [docData];
            setDocuments(documentsData);
          }
        } else {
          console.log('No documents data available');
          setDocuments([]);
        }
      } catch (docError) {
        console.log('Error fetching documents:', docError);
        setDocuments([]);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      let errorMessage = 'Failed to fetch data. Please try again later.';

      if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
        errorMessage = 'Network error. Please check your connection and ensure the backend server is running.';
      }

      setError(errorMessage);
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
            'Origin': window.location.origin,
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
        const response = await fetch(`${config.apiUrl}/api/document-vault/reset`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Origin': window.location.origin,
          },
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
          'Origin': window.location.origin,
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

  const handleExport = async (format, type = 'inventory') => {
    try {
      const endpoint = type === 'inventory' ? 'export-inventory' : 'export-documents';
      const response = await fetch(`${config.apiUrl}/${endpoint}?format=${format}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Origin': window.location.origin,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to export ${type}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(`Error exporting ${type}:`, error);
      setError(`Failed to export ${type}. Please try again later.`);
    }
  };
  return (
    <Router>
      <div className="app-container">
        {/* Neon Title */}
        <header className="app-header">
          <h1 className="neon-title">BARTLEBY</h1>
          <div className="app-title">Catalog*Categorize*Describe*Sort*Summarize</div>
            <h2 className="app-subtitle"> Diligent Assignation Performed with Quiet Resignation</h2>
        </header>

        {/* Main Content */}
        <div className="main-section">
          <p className='body-text'> At present, a service most methodical: I take in pictures and documents, discern their essence, and render them into well-ordered SQL tables, each sortable to the user’s design. For each item, I produce, with AI-powered precision, a fitting description or a descriptive summary, diligently cataloged one-by-one, into the tables presented below.  </p>
          {/* Process Images Button */}
          <ProcessImagesButton onProcess={handleProcessFiles} />

          {/* Main Menu */}
          <div className="menu-container">
            <button 
              className="menu-trigger" 
              onClick={() => setShowMainMenu(!showMainMenu)}
              onBlur={() => setTimeout(() => setShowMainMenu(false), 200)}
            >
              Menu
            </button>
            {showMainMenu && (
              <div className="menu-dropdown">
                <Link to="/">Inventory Overview</Link>
                <Link to="/images">Image Gallery</Link>
                <Link to="/documents">Document Library</Link>
                <div className="dropdown-divider"></div>
                {/* Inventory Actions */}
                <div className="submenu">
                  <button 
                    onClick={() => setShowInventoryDropdown(!showInventoryDropdown)}
                  >
                    Manage Inventory
                  </button>
                  {showInventoryDropdown && (
                    <div className="submenu-dropdown">
                      <button onClick={() => handleExport('csv', 'inventory')}>
                        Download As CSV
                      </button>
                      <button onClick={() => handleExport('xls', 'inventory')}>
                        Download As Excel 
                      </button>
                      <button onClick={handleResetInventory} className="danger">
                        Clear All Data
                      </button>
                    </div>
                  )}
                </div>
                {/* Documents Actions */}
                <div className="submenu">
                  <button 
                    onClick={() => setShowDocumentsDropdown(!showDocumentsDropdown)}
                  >
                    Manage Documents
                  </button>
                  {showDocumentsDropdown && (
                    <div className="submenu-dropdown">
                      <button onClick={() => handleExport('csv', 'documents')}>
                        Download CSV Report
                      </button>
                      <button onClick={() => handleExport('xls', 'documents')}>
                        Download Excel Report
                      </button>
                      <button onClick={handleResetDocuments} className="danger">
                        Clear All Documents
                      </button>
                    </div>
                  )}
                </div>
                <button onClick={() => setShowNewTableDialog(true)}>
                  Create Custom Inventory
                </button>
              </div>
            )}
          </div>

          {showNewTableDialog && (
            <div className="modal">
              <div className="modal-content">
                <h3>Create Custom Inventory Table</h3>
                <input
                  type="text"
                  value={newTableName}
                  onChange={(e) => setNewTableName(e.target.value)}
                  placeholder="Enter a name for your inventory"
                />
                <div>
                  <button onClick={handleCreateNewTable}>Create Table</button>
                  <button onClick={() => setShowNewTableDialog(false)}>Cancel</button>
                </div>
              </div>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          {/* Main Content Area */}
          <div className="content-area">
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
