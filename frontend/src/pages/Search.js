import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './Search.css';

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchType, setSearchType] = useState('semantic');
  const navigate = useNavigate();

  // Authentication check
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/');
      return;
    }
  }, [navigate]);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchQuery, type) => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            query: searchQuery.trim(),
            search_type: type,
            limit: 20
          })
        });

        if (!response.ok) {
          throw new Error(`Search failed: ${response.status}`);
        }

        const data = await response.json();
        setResults(data.results || []);
      } catch (err) {
        console.error('Error searching:', err);
        setError('Failed to search inventory. Please try again.');
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  // Handle search form submission
  const handleSearch = useCallback((e) => {
    e.preventDefault();
    debouncedSearch(query, searchType);
  }, [query, searchType, debouncedSearch]);

  // Handle search input change with auto-search
  const handleQueryChange = useCallback((e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    debouncedSearch(newQuery, searchType);
  }, [searchType, debouncedSearch]);

  // Handle search type change
  const handleSearchTypeChange = useCallback((e) => {
    const newType = e.target.value;
    setSearchType(newType);
    if (query.trim()) {
      debouncedSearch(query, newType);
    }
  }, [query, debouncedSearch]);

  // Handle result click navigation
  const handleResultClick = useCallback((result) => {
    if (result.type === 'inventory_item') {
      navigate(`/inventory/${result.id}`);
    } else if (result.type === 'document') {
      window.open(result.url, '_blank', 'noopener,noreferrer');
    }
  }, [navigate]);

  // Highlight search terms in text
  const highlightText = useCallback((text, searchQuery) => {
    if (!searchQuery || !text) return text;
    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }, []);

  // Set example query
  const handleExampleQuery = useCallback((exampleQuery) => {
    setQuery(exampleQuery);
    debouncedSearch(exampleQuery, searchType);
  }, [searchType, debouncedSearch]);

  // Memoized example searches
  const exampleSearches = useMemo(() => [
    'red electronics',
    'items in storage room',
    'office supplies',
    'broken or damaged items'
  ], []);

  return (
    <div className="inventory-page">
      <div className="inventory-header">
        <div className="header-content">
          <h1>AI-Powered Search</h1>
          <button 
            onClick={() => navigate('/dashboard')} 
            className="back-btn"
            type="button"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      <div className="search-container">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-container">
            <input
              type="text"
              value={query}
              onChange={handleQueryChange}
              placeholder="Search your inventory... (e.g., 'red electronic devices' or 'items in storage room A')"
              className="search-input"
              disabled={loading}
            />
            <button 
              type="submit" 
              className="search-btn" 
              disabled={loading || !query.trim()}
            >
              {loading ? '⏳' : '🔍'}
            </button>
          </div>

          <div className="search-options">
            <label className="search-type-option">
              <input
                type="radio"
                value="semantic"
                checked={searchType === 'semantic'}
                onChange={handleSearchTypeChange}
              />
              <span>Semantic Search</span>
              <small>Find items by meaning and context</small>
            </label>
            <label className="search-type-option">
              <input
                type="radio"
                value="keyword"
                checked={searchType === 'keyword'}
                onChange={handleSearchTypeChange}
              />
              <span>Keyword Search</span>
              <small>Find exact word matches</small>
            </label>
          </div>
        </form>

        <div className="search-results">
          {error && (
            <div className="error-state">
              <h3>Search Error</h3>
              <p>{error}</p>
              <button 
                onClick={() => debouncedSearch(query, searchType)} 
                className="retry-btn"
              >
                Try Again
              </button>
            </div>
          )}

          {loading && (
            <div className="loading">
              <div className="loading-spinner"></div>
              <p>Searching your inventory...</p>
            </div>
          )}

          {!loading && !error && results.length > 0 && (
            <>
              <div className="results-header">
                <h3>Found {results.length} result{results.length !== 1 ? 's' : ''}</h3>
              </div>
              <div className="results-grid">
                {results.map((result, index) => (
                  <div
                    key={`${result.type}-${result.id}-${index}`}
                    className="result-item"
                    onClick={() => handleResultClick(result)}
                  >
                    {result.image_url && (
                      <div className="result-image">
                        <img 
                          src={result.image_url} 
                          alt={result.title || result.name}
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div className="result-content">
                      <h4 
                        dangerouslySetInnerHTML={{
                          __html: highlightText(result.title || result.name || 'Untitled', query)
                        }}
                      />
                      <p 
                        className="result-description"
                        dangerouslySetInnerHTML={{
                          __html: highlightText(result.description || result.content || '', query)
                        }}
                      />
                      <div className="result-meta">
                        <span className="result-type">
                          {result.type === 'inventory_item' ? '📦 Inventory Item' : '📄 Document'}
                        </span>
                        {result.score && (
                          <span className="result-score">
                            {Math.round(result.score * 100)}% match
                          </span>
                        )}
                        {result.category && (
                          <span className="result-category">{result.category}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {!loading && !error && query && results.length === 0 && (
            <div className="no-results">
              <h3>No results found</h3>
              <p>
                Try searching with different keywords or switch between semantic and keyword search modes.
              </p>
              <div className="search-tips">
                <h4>Search Tips:</h4>
                <ul>
                  <li>Use semantic search for conceptual queries like "electronic devices" or "office supplies"</li>
                  <li>Use keyword search for exact terms like model numbers or specific names</li>
                  <li>Try broader terms if you're not finding what you're looking for</li>
                  <li>Include color, size, or location details to narrow results</li>
                </ul>
              </div>
            </div>
          )}

          {!loading && !error && !query && (
            <div className="search-placeholder">
              <div className="search-icon">🔍</div>
              <h3>Search Your Inventory</h3>
              <p>
                Use natural language to find items in your inventory. Our AI understands context and meaning,
                not just keywords.
              </p>
              <div className="example-searches">
                <h4>Try searching for:</h4>
                <div className="examples">
                  {exampleSearches.map((example) => (
                    <button 
                      key={example}
                      onClick={() => handleExampleQuery(example)} 
                      className="example-btn"
                      type="button"
                    >
                      "{example}"
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Debounce utility function
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

export default Search;
