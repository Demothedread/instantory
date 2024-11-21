import React, { useState } from 'react';
import config from '../config';
import './DocumentsTable.css';

function DocumentsTable({ documents }) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [semanticResults, setSemanticResults] = useState(null);
  const [semanticQuery, setSemanticQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Get unique categories for filter dropdown
  const categories = [...new Set(documents.map(doc => doc.category))].filter(Boolean);

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleSemanticSearch = async () => {
    if (!semanticQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(`${config.apiUrl}/api/document-vault/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': window.location.origin,
          'Access-Control-Allow-Credentials': 'true'
        },
        credentials: 'include',
        body: JSON.stringify({ query: semanticQuery })
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setSemanticResults(data.results);
    } catch (error) {
      console.error('Error during semantic search:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const sortedDocuments = React.useMemo(() => {
    let sortableItems = [...documents];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [documents, sortConfig]);

  const filteredDocuments = sortedDocuments.filter(doc => {
    const matchesSearch = Object.values(doc).some(value => 
      value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesCategory = !filterCategory || doc.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getSortIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ? ' ↑' : ' ↓';
    }
    return '';
  };

  const handleDownload = async (docId) => {
    try {
      window.open(`${config.apiUrl}/api/document-vault/${docId}/file`, '_blank');
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  return (
    <div className="documents-table-container">
      <div className="search-controls">
        <div className="basic-search">
          <input
            type="text"
            placeholder="Filter documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="category-filter"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div className="semantic-search">
          <input
            type="text"
            placeholder="Enter semantic search query..."
            value={semanticQuery}
            onChange={(e) => setSemanticQuery(e.target.value)}
            className="semantic-search-input"
          />
          <button 
            onClick={handleSemanticSearch}
            disabled={isSearching || !semanticQuery.trim()}
            className="semantic-search-button"
          >
            {isSearching ? 'Searching...' : 'Semantic Search'}
          </button>
        </div>
      </div>

      {semanticResults && (
        <div className="semantic-results">
          <h3>Search Results</h3>
          <button onClick={() => setSemanticResults(null)} className="clear-results">
            Clear Results
          </button>
          {semanticResults.map((result, index) => (
            <div key={index} className="result-item">
              <div className="result-header">
                <h4>{result.title}</h4>
                <span className="similarity-score">
                  Similarity: {(result.similarity * 100).toFixed(1)}%
                </span>
              </div>
              <p className="result-summary">{result.summary}</p>
              {result.excerpt && (
                <div className="relevant-chunks">
                  <h5>Relevant Excerpt:</h5>
                  <div className="chunk">
                    <div className="chunk-content">{result.excerpt}</div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!semanticResults && (
        <div className="table-wrapper">
          <table className="documents-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('title')}>
                  Title{getSortIndicator('title')}
                </th>
                <th onClick={() => handleSort('author')}>
                  Author{getSortIndicator('author')}
                </th>
                <th onClick={() => handleSort('category')}>
                  Category{getSortIndicator('category')}
                </th>
                <th onClick={() => handleSort('field')}>
                  Field{getSortIndicator('field')}
                </th>
                <th onClick={() => handleSort('publication_year')}>
                  Year{getSortIndicator('publication_year')}
                </th>
                <th>Summary</th>
                <th>Thesis</th>
                <th>Issue</th>
                <th onClick={() => handleSort('journal_publisher')}>
                  Journal/Publisher{getSortIndicator('journal_publisher')}
                </th>
                <th>Influences</th>
                <th>Tags</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.map((doc, index) => (
                <tr key={index}>
                  <td>{doc.title}</td>
                  <td>{doc.author}</td>
                  <td>{doc.category}</td>
                  <td>{doc.field}</td>
                  <td>{doc.publication_year}</td>
                  <td className="expandable-cell">
                    <div className="cell-content">{doc.summary}</div>
                  </td>
                  <td className="expandable-cell">
                    <div className="cell-content">{doc.thesis}</div>
                  </td>
                  <td className="expandable-cell">
                    <div className="cell-content">{doc.issue}</div>
                  </td>
                  <td>{doc.journal_publisher}</td>
                  <td>{doc.influenced_by}</td>
                  <td>{doc.hashtags}</td>
                  <td>
                    <button onClick={() => handleDownload(doc.id)} className="download-button">
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="table-footer">
        <p>Total Documents: {filteredDocuments.length}</p>
      </div>
    </div>
  );
}

export default DocumentsTable;
