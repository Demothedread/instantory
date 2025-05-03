import React, { useState, useCallback } from 'react';
import { css } from '@emotion/react';
import axios from 'axios';
import config from '../../../config';
import styles from './styles';

const DocumentSearch = ({ onSearchResults }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');

  const categories = ['All Categories', 'Research', 'Reports', 'Articles', 'Case Law', 'Statutes/Regulations', 'Financial Documents', 'Other'];

  const handleFilterSelect = (category) => {
    setFilterCategory(category === 'All Categories' ? '' : category);
    setShowFilterMenu(false);
  };

  const clearError = () => setError('');

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      setError('Please enter a search query');
      return;
    }

    setIsSearching(true);
    setError('');

    try {
      const response = await axios.post(
        `${config.apiUrl}/api/documents/search`,
        {
          query: searchQuery,
          category: filterCategory
        },
        {
          withCredentials: true
        }
      );

      if (response.data.results) {
        // Pass the results up to parent component
        if (onSearchResults) {
          onSearchResults(response.data.results, searchQuery);
        }
      } else {
        setError('No results found for your query');
      }
    } catch (error) {
      console.error('Error searching documents:', error);
      setError(error.response?.data?.error || 'An error occurred during search');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div css={styles.container}>
      <h2 css={styles.title}>Document Search</h2>
      
      <div css={styles.filterSection}>
        <form css={styles.searchForm} onSubmit={handleSearch}>
          <input
            type="text"
            css={styles.searchInput}
            placeholder="Search documents by content, author, title or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={isSearching}
          />
          <button 
            type="submit" 
            css={styles.searchButton}
            disabled={isSearching}
          >
            {isSearching ? 'Searching...' : 'Search'}
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
    </div>
  );
};

export default DocumentSearch;
