import React, { useState } from 'react';
import './Pages.css';

const Kaboodles = () => {
  const [activeTab, setActiveTab] = useState('collections');
  
  // Demo collections for UI display
  const demoCollections = [
    { name: 'Kitchen Items', count: 24, lastUpdated: '2025-04-28' },
    { name: 'Art Supplies', count: 18, lastUpdated: '2025-04-30' },
    { name: 'Electronics', count: 12, lastUpdated: '2025-05-05' },
    { name: 'Travel Gear', count: 9, lastUpdated: '2025-05-08' }
  ];

  return (
    <div className="page-container">
      <div className="page-content">
        <h1 className="page-title">Kaboodles</h1>
        
        <div className="content-section">
          <h2>Your Collections</h2>
          <p>
            Organize your items into smart collections. Kaboodles uses AI to automatically 
            categorize and tag your items, making them easy to find and manage.
          </p>
        </div>

        <div className="kaboodles-tabs">
          <button 
            className={`tab-button ${activeTab === 'collections' ? 'active' : ''}`}
            onClick={() => setActiveTab('collections')}
          >
            Collections
          </button>
          <button 
            className={`tab-button ${activeTab === 'recent' ? 'active' : ''}`}
            onClick={() => setActiveTab('recent')}
          >
            Recent Items
          </button>
          <button 
            className={`tab-button ${activeTab === 'tags' ? 'active' : ''}`}
            onClick={() => setActiveTab('tags')}
          >
            Tags
          </button>
        </div>

        <div className="kaboodles-content">
          {activeTab === 'collections' && (
            <div className="collections-grid">
              {demoCollections.map((collection, index) => (
                <div key={index} className="collection-card">
                  <h3>{collection.name}</h3>
                  <div className="collection-stats">
                    <span>{collection.count} items</span>
                    <span>Updated: {collection.lastUpdated}</span>
                  </div>
                  <div className="collection-actions">
                    <button className="neo-decoroco-button small">View</button>
                    <button className="neo-decoroco-button small">Edit</button>
                  </div>
                </div>
              ))}
              <div className="collection-card new-collection">
                <div className="add-icon">+</div>
                <h3>Create New Collection</h3>
                <p>Start organizing your items</p>
              </div>
            </div>
          )}

          {activeTab === 'recent' && (
            <div className="recent-items">
              <p className="placeholder-text">Recent items will appear here</p>
            </div>
          )}

          {activeTab === 'tags' && (
            <div className="tags-cloud">
              <p className="placeholder-text">Tag management coming soon</p>
            </div>
          )}
        </div>

        <div className="content-section">
          <h2>Smart Features</h2>
          <div className="feature-grid">
            <div className="feature-card">
              <h3>Auto-Categorization</h3>
              <p>AI-powered sorting and organization</p>
            </div>
            <div className="feature-card">
              <h3>Smart Tags</h3>
              <p>Automatic tagging based on content</p>
            </div>
            <div className="feature-card">
              <h3>Quick Search</h3>
              <p>Find items instantly across collections</p>
            </div>
            <div className="feature-card">
              <h3>Batch Actions</h3>
              <p>Manage multiple items efficiently</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Kaboodles;
