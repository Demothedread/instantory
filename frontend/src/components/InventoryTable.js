import React, { useState } from 'react';
import config from '../config';
import './InventoryTable.css';
import placeholderImage from '../assets/placeholder.png';

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
    <div className="inventory-container">
      <div className="header-section">
        <h1>Revolutionize Your Workflow with Our Image and Document Processing Service</h1>
        <p>
          Introducing our cutting-edge Image and Document Processing Service—revolutionizing the way you manage visual and textual data.
          This service seamlessly handles images and documents one at a time, employing advanced AI algorithms to deliver powerful insights
          that transform your workflow.
        </p>

        <h2>How It Works</h2>

        <div className="workflow-section">
          <div className="image-workflow">
            <h3>For Images</h3>
            <p>
              When an image is uploaded, our AI analyzes its content to generate detailed descriptions, helping you catalog and categorize 
              visual assets effortlessly. Imagine uploading a product photo; the system generates a description like 
              "A red sports car parked in a cityscape," which enhances product listings and searchability. The results are stored in a highly 
              structured SQL table, with each unique item linked to an image grid for easy access and management.
            </p>
          </div>

          <div className="document-workflow">
            <h3>For Documents</h3>
            <p>
              When a document is processed, the service summarizes its key points, extracts relevant metadata (like author, creation date, 
              and keywords), and builds a searchable vectorized database of terms. For instance, uploading an academic paper means you 
              instantly receive a concise summary and can quickly search for terms throughout the document, accelerating research and review 
              processes.
            </p>
          </div>
        </div>

        <div className="benefits-section">
          <h3>Key Benefits</h3>
          <ul>
            <li><strong>Efficient Cataloging:</strong> Quickly tag and describe images and documents, enhancing discoverability.</li>
            <li><strong>Structured Data:</strong> SQL output allows for easy integration into existing systems.</li>
            <li><strong>Intelligent Summarization:</strong> Get to the crux of documents without sifting through pages.</li>
            <li><strong>Searchability:</strong> Vectorized terms enable advanced search capabilities across all stored content.</li>
          </ul>

          <p>
            Whether you're managing a media library or researching vast documentation, our service is your go-to solution for intelligent 
            data management that fits perfectly into today's fast-paced, data-driven landscape.
          </p>
        </div>

        <div className="technology-section">
          <h3>Technology Powered by GPT-4o</h3>
          <p>
            This system utilizes GPT-4o image recognition technology to create and describe a catalog of items, saving you hours of time-consuming 
            product entry by automating the process. Trained against thousands of product images and leveraging GPT-4o more generally, it is 
            designed to determine the specifications, materials, and estimate an MSRP based on thousands of similar products. This makes it 
            perfect for automatic inventory creation and management.
          </p>
          <p>
            Additionally, for documents, this technology is ideal for researchers who need to quickly identify the most relevant content within 
            a batch of documents. It provides both a starting point and a comprehensive analysis to enhance your research, allowing you to focus 
            on what matters most while delivering deeper insights efficiently.
          </p>
        </div>

        <div className="instructions-section">
          <h3>Usage Instructions</h3>
          <div className="instruction-steps">
            <p><strong>1. Upload Files:</strong> Select images or documents using the 'Choose Files' button and click 'Process Files'.</p>
            <p><strong>2. Processing:</strong> Files are validated and processed through our AI analysis pipeline.</p>
            <p><strong>3. View Results:</strong> Access processed items in the inventory table or document vault.</p>
            <p><strong>4. Maintain Records:</strong> Original files are preserved for future reference.</p>
          </div>
        </div>
      </div>

      <div className="filter-section">
        <div className="category-filter">
          <label htmlFor="category-filter">Filter by Category:</label>
          <select id="category-filter" value={filterCategory} onChange={(e) => handleFilter(e.target.value)}>
            <option value="">All</option>
            <option value="Beads">Beads</option>
            <option value="Stools">Stools</option>
            <option value="Bowls">Bowls</option>
            <option value="Fans">Fans</option>
            <option value="Totebags">Totebags</option>
            <option value="Home Decor">Home Decor</option>
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
                      src={`${config.apiUrl}/images/${encodeURIComponent(item.image_url)}`} 
                      alt={item?.name || 'Product'} 
                      style={{width: '100px', height: 'auto'}}
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
