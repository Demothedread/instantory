import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import InventoryTable from './components/InventoryTable';
import ImageList from './components/ImageList';
import ProcessImagesButton from './components/ProcessImagesButton';
import DocumentsTable from './components/DocumentsTable';
import HowToUseOverlay from './components/HowToUseOverlay';
import LoginOverlay from './components/LoginOverlay';
import LoginAnimation from './scripts/LoginAnimation';
import UserMenu from './components/UserMenu';
import BlurbCarousel from './scripts/blurbcarousel';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import About from './pages/About';
import Kaboodles from './pages/Kaboodles';
import Resources from './pages/Resources';
import config from './config';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(true);

  useEffect(() => {
    // Check if user was previously logged in
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setShowLogin(false);
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleLogin = useCallback((userData) => {
    setUser(userData);
    setShowLogin(false);
    localStorage.setItem('user', JSON.stringify(userData));
  }, []);
  const [inventory, setInventory] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTableName, setNewTableName] = useState('');
  const [showNewTableDialog, setShowNewTableDialog] = useState(false);
  const [showInventoryDropdown, setShowInventoryDropdown] = useState(false);
  const [showDocumentsDropdown, setShowDocumentsDropdown] = useState(false);
  const [showMainMenu, setShowMainMenu] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState('inventory');

  useEffect(() => {
    fetchData();
    generateTiles();
  }, []);

  const generateTiles = () => {
    const container = document.querySelector('.background-container');
    const totalTiles = Math.ceil(window.innerWidth / 100) * Math.ceil(window.innerHeight / 100);

    container.innerHTML = '';
    for (let i = 0; i < totalTiles; i++) {
      const tile = document.createElement('div');
      tile.classList.add('tile');
      container.appendChild(tile);
    }
  };

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
        const docResponse = await fetch(`${config.apiUrl}/api/documents`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
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
    setShowInventory(true);
    setIsExpanded(false);
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
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <Router>
      <div className="app-container">
        <Navigation />
        <div className="background-container">
          <div className="neo-decoroco-pattern"></div>
          <div className="neo-decoroco-overlay"></div>
        </div>                                                                   
        <header className="app-header">
          {user && <UserMenu user={user} onLogout={() => setUser(null)} />}
          <div className="header-content">
            <div className="title-wrapper">
              <div className="title-row">
                <div className="header-mascot left"></div>
                <h1 className="neon-title">BARTLEBY</h1>
                <div className="header-mascot right"></div>
              </div>
              <div className="title-underline"></div>
              <div className="subtitle-carousel">
                <BlurbCarousel />
              </div>
            </div>
          </div>
        </header>

        <main className="main-section">
          <div className="top-bar neo-decoroco-panel">
            <button 
              className="diamond-button neo-decoroco-button"
              onClick={() => setShowHowTo(true)}
            >
              How To Use
            </button>
            
            <nav className="menu-container">
              <button 
                className="diamond-button neo-decoroco-button" 
                onClick={() => setShowMainMenu(!showMainMenu)}
              >
                Menu
              </button>
              {showMainMenu && (
                <div className="menu-dropdown neo-decoroco-panel">
                  <Link to="/" className="neo-decoroco-link">Inventory Overview</Link>
                  <Link to="/images" className="neo-decoroco-link">Image Gallery</Link>
                  <Link to="/documents" className="neo-decoroco-link">Document Library</Link>
                  <div className="dropdown-divider"></div>
                  <div className="submenu">
                    <button 
                      className="neo-decoroco-button"
                      onClick={() => setShowInventoryDropdown(!showInventoryDropdown)}
                    >
                      Manage Inventory
                    </button>
                    {showInventoryDropdown && (
                      <div className="submenu-dropdown neo-decoroco-panel">
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
                  <div className="submenu">
                    <button 
                      className="neo-decoroco-button"
                      onClick={() => setShowDocumentsDropdown(!showDocumentsDropdown)}
                    >
                      Manage Documents
                    </button>
                    {showDocumentsDropdown && (
                      <div className="submenu-dropdown neo-decoroco-panel">
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
                  <button 
                    className="neo-decoroco-button"
                    onClick={() => setShowNewTableDialog(true)}
                  >
                    Create Custom Inventory
                  </button>
                </div>
              )}
            </nav>
          </div>

          {error && <div className="error-message neo-decoroco-panel">{error}</div>}

          <section className="content-section">
            <LoginAnimation isVisible={showLogin}>
              <LoginOverlay 
                isVisible={showLogin} 
                onLogin={handleLogin}
                onGoogleLogin={handleLogin}
              />
            </LoginAnimation>
            
            {!showInventory ? (
              <div className={`upload-section neo-decoroco-panel ${isExpanded ? 'expanded' : ''}`}>
                <ProcessImagesButton 
                  onProcess={handleProcessFiles}
                  isAuthenticated={!!user}
                />
              </div>
            ) : (
              <div className="content-area neo-decoroco-panel">
                <div className="slider-nav">
                  <Link 
                    to="/" 
                    className={`slider-link ${activeTab === 'inventory' ? 'active' : ''}`}
                    onClick={() => setActiveTab('inventory')}
                  >
                    <span className="slider-icon inventory-icon"></span>
                    Inventory
                  </Link>
                  <Link 
                    to="/images" 
                    className={`slider-link ${activeTab === 'images' ? 'active' : ''}`}
                    onClick={() => setActiveTab('images')}
                  >
                    <span className="slider-icon gallery-icon"></span>
                    Gallery
                  </Link>
                  <Link 
                    to="/documents" 
                    className={`slider-link ${activeTab === 'documents' ? 'active' : ''}`}
                    onClick={() => setActiveTab('documents')}
                  >
                    <span className="slider-icon documents-icon"></span>
                    Documents
                  </Link>
                </div>
                
          <div className="content-display">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/kaboodles" element={<Kaboodles />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/privacy" element={
                <iframe 
                  src="/privacy.html" 
                  style={{
                    width: '100%', 
                    height: '100vh', 
                    border: 'none',
                    background: 'transparent'
                  }}
                  title="Privacy Policy"
                />
              } />
              <Route 
                path="/inventory" 
                element={
                  loading ? (
                    <div className="loading-spinner">Loading inventory...</div>
                  ) : (
                    <InventoryTable inventory={inventory} />
                  )
                } 
              />
              <Route 
                path="/images" 
                element={
                  loading ? (
                    <div className="loading-spinner">Loading images...</div>
                  ) : (
                    <ImageList inventory={inventory} />
                  )
                } 
              />
              <Route 
                path="/documents" 
                element={
                  loading ? (
                    <div className="loading-spinner">Loading documents...</div>
                  ) : (
                    <DocumentsTable documents={documents} />
                  )
                } 
              />
            </Routes>
                </div>
              </div>
            )}
          </section>

          {showNewTableDialog && (
            <div className="modal">
              <div className="modal-content neo-decoroco-panel">
                <h3>Create Custom Inventory Table</h3>
                <input
                  type="text"
                  value={newTableName}
                  onChange={(e) => setNewTableName(e.target.value)}
                  placeholder="Enter a name for your inventory"
                  className="neo-decoroco-input"
                />
                <div className="modal-buttons">
                  <button 
                    onClick={handleCreateNewTable}
                    className="neo-decoroco-button"
                  >
                    Create Table
                  </button>
                  <button 
                    onClick={() => setShowNewTableDialog(false)}
                    className="neo-decoroco-button secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>

        <HowToUseOverlay 
          isOpen={showHowTo} 
          onClose={() => setShowHowTo(false)} 
        />
      </div>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
