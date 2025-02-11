import React, { useState } from 'react';

import config from '../../../config';
import styles from './styles';

const DocumentSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const categories = [
    'All',
    'Research Papers',
    'Articles',
    'Books',
    'Reports',
    'Documentation',
    'Other'
  ];

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${config.apiUrl}/api/documents/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          query: searchTerm,
          category: filterCategory === 'All' ? '' : filterCategory
        })
      });

      if (!response.ok) {
        throw new Error('Search failed. Please try again.');
      }

      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (err) {
      setError(err.message);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterSelect = (category) => {
    setFilterCategory(category);
    setShowFilterMenu(false);
  };

  return (
    <div css={styles.container}>
      <h1 css={styles.title}>Document Search</h1>

      <div css={styles.filterSection}>
        <form css={styles.searchInputGroup} onSubmit={handleSearch}>
          <input
            type="text"
            css={styles.searchInput}
            placeholder="Enter your search query..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button 
            type="submit" 
            css={styles.searchButton}
            disabled={isLoading}
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </form>

        <div css={styles.filterMenu}>
          <button
            css={styles.filterTrigger}
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            type="button"
          >
            {filterCategory || 'Filter by Category'}
          </button>

          {showFilterMenu && (
            <div css={styles.filterDropdown}>
              {categories.map((category) => (
                <button
                  key={category}
                  css={styles.filterOption}
                  onClick={() => handleFilterSelect(category)}
                  type="button"
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div css={styles.errorMessage}>
          {error}
        </div>
      )}

      {searchResults.length > 0 && (
        <div css={styles.searchResults}>
          {searchResults.map((result, index) => (
            <div key={index} css={styles.resultCard}>
              <h4>{result.title}</h4>
              <div css={styles.resultCategory}>{result.category}</div>
              <div css={styles.resultSummary}>{result.summary}</div>
              <div css={styles.resultMetadata}>
                {result.author && `By ${result.author} • `}
                {result.publication_year && `${result.publication_year} • `}
                {result.journal_publisher}
              </div>
            </div>
          ))}
        </div>
      )}

      {searchResults.length === 0 && searchTerm && !isLoading && !error && (
        <div css={styles.errorMessage}>
          No results found. Try adjusting your search terms.
        </div>
      )}
    </div>
  );
};

export default DocumentSearch;
