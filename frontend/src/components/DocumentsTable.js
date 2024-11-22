import React, { useState, useMemo } from 'react';
import config from '../config';
import './DocumentsTable.css';

function DocumentsTable({ documents }) {
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [semanticResults, setSemanticResults] = useState(null);
  const [semanticQuery, setSemanticQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

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

  const handleDownload = async (docId) => {
    try {
      window.open(`${config.apiUrl}/api/document-vault/${docId}/file`, '_blank');
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  const filteredDocuments = useMemo(() => {
    if (!Array.isArray(documents)) return [];
    return documents.filter((doc) => {
      const matchesCategory = !filterCategory || doc?.category === filterCategory;
      const matchesSearch = !searchTerm || 
        Object.values(doc).some(value => 
          value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
      return matchesCategory && matchesSearch;
    });
  }, [documents, filterCategory, searchTerm]);

  const sortedDocuments = useMemo(() => {
    let sortableItems = [...filteredDocuments];
    if (sortColumn) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];
        
        if (sortColumn === 'publication_year') {
          return sortDirection === 'asc' 
            ? (aValue || 0) - (bValue || 0)
            : (bValue || 0) - (aValue || 0);
        }
        
        const aStr = String(aValue || '').toLowerCase();
        const bStr = String(bValue || '').toLowerCase();
        if (aStr < bStr) return sortDirection === 'asc' ? -1 : 1;
        if (aStr > bStr) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredDocuments, sortColumn, sortDirection]);

  const categories = useMemo(() => {
    if (!Array.isArray(documents)) return [];
    return [...new Set(documents.map(doc => doc.category))].filter(Boolean);
  }, [documents]);

  if (!Array.isArray(documents) || documents.length === 0) {
    return (
      <div>
        <h2>Document Vault</h2>
        <p>No documents available.</p>
      </div>
    );
  }

  return (
    <div className="documents-table-container">
      <div className="search-controls">
        <div className="basic-search">
          <input
            type="text"
            placeholder="Filter documents..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
          />
          <select
            value={filterCategory}
            onChange={(e) => handleFilter(e.target.value)}
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
                <button onClick={() => handleDownload(result.id)} className="download-button">
                  Download
                </button>
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
                  Title{sortColumn === 'title' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
                </th>
                <th onClick={() => handleSort('author')}>
                  Author{sortColumn === 'author' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
                </th>
                <th onClick={() => handleSort('category')}>
                  Category{sortColumn === 'category' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
                </th>
                <th onClick={() => handleSort('field')}>
                  Field{sortColumn === 'field' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
                </th>
                <th onClick={() => handleSort('publication_year')}>
                  Year{sortColumn === 'publication_year' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
                </th>
                <th>Summary</th>
                <th>Thesis</th>
                <th>Issue</th>
                <th onClick={() => handleSort('journal_publisher')}>
                  Journal/Publisher{sortColumn === 'journal_publisher' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
                </th>
                <th>Influences</th>
                <th>Tags</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedDocuments.map((doc, index) => (
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
