import React, { useState } from 'react';
import './DocumentsTable.css';

function DocumentsTable({ documents }) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  // Get unique categories for filter dropdown
  const categories = [...new Set(documents.map(doc => doc.category))].filter(Boolean);

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
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

  return (
    <div className="documents-table-container">
      <div className="table-controls">
        <input
          type="text"
          placeholder="Search documents..."
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
                <td>{doc.influences}</td>
                <td>{doc.hashtags}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <p>Total Documents: {filteredDocuments.length}</p>
      </div>
    </div>
  );
}

export default DocumentsTable;
