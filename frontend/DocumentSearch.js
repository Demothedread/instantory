import React, { useState } from 'react';
import axios from 'axios';
import config from './src/config';
import './DocumentSearch.css';

function DocumentSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setErrorMessage('Please enter a search query.');
      return;
    }

    setIsSearching(true);
    setErrorMessage('');

    try {
      const response = await axios.post(
        `${config.apiUrl}/api/documents/search`,
        {
          query: searchQuery,
          category: filterCategory,
        },
        {
          withCredentials: true,
        }
      );

      if (response.data.results) {
        setSearchResults(response.data.results);
      } else {
        setSearchResults([]);
        setErrorMessage('No matching documents found.');
      }
    } catch (error) {
      console.error('Error searching documents:', error);
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          'An error occurred while searching documents. Please try again.'
      );
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const categories = ['All Categories', 'Research', 'Reports', 'Articles', 'Books'];

  const handleFilter = (category) => {
    setFilterCategory(category === 'All Categories' ? '' : category);
  };

  return (
    <div className="document-search-container">
      <h1 className="title">Document Search</h1>

      <div className="search-filter-section">
        <div className="search-input-group">
          <input
            id="search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter your search query"
            aria-label="Search query input"
            disabled={isSearching}
            className="search-input"
          />
          <button
            onClick={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
            className="search-button"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>

        <div className="filter-menu-container">
          <button
            className="filter-menu-trigger"
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            onBlur={() => setTimeout(() => setShowFilterMenu(false), 200)}
          >
            {filterCategory || 'Filter by Category'}
          </button>
          {showFilterMenu && (
            <div className="filter-dropdown">
              {categories.map((category) => (
                <button key={category} onClick={() => handleFilter(category)}>
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {errorMessage && <div className="error-message">{errorMessage}</div>}

      {searchResults.length > 0 && (
        <div className="search-results">
          <h3 className="subtitle">Search Results</h3>
          {searchResults.map((result, index) => (
            <div key={result.id} className="result-card">
              <h4>{result.title}</h4>
              <p className="result-category">
                {result.category} | {result.field}
              </p>
              <p className="result-summary">{result.summary}</p>
              <div className="result-metadata">
                <span>Relevance: {Math.round(result.similarity * 100)}%</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DocumentSearch;