import { css } from '@emotion/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { neoDecorocoBase } from '../styles/components/neo-decoroco/base';
import layout from '../styles/layouts/constraints';
import { colors } from '../styles/theme/colors';
import { typography } from '../styles/theme/typography';

// Debounce utility function
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

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
    [setResults, setLoading, setError]
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
    <div css={styles.inventoryPage}>
      <div css={styles.inventoryHeader}>
        <div css={styles.headerContent}>
          <h1 css={styles.title}>🔍 AI-Powered Search</h1>
          <button 
            onClick={() => navigate('/dashboard')} 
            css={styles.backBtn}
            type="button"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      <div css={styles.searchContainer}>
        <form onSubmit={handleSearch} css={styles.searchForm}>
          <div css={styles.searchInputContainer}>
            <input
              type="text"
              value={query}
              onChange={handleQueryChange}
              placeholder="Search your inventory... (e.g., 'red electronic devices' or 'items in storage room A')"
              css={styles.searchInput}
              disabled={loading}
            />
            <button 
              type="submit" 
              css={[styles.searchBtn, (!query.trim() || loading) && styles.searchBtnDisabled]} 
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


// Neo-Deco-Rococo styles for Search page
const styles = {
  inventoryPage: css`
    ${neoDecorocoBase.container}
    min-height: 100vh;
    background: linear-gradient(
      135deg,
      ${colors.richPurple} 0%,
      ${colors.deepNavy} 30%,
      ${colors.charcoal} 70%,
      ${colors.richPurple} 100%
    );
    padding: ${layout.spacing.lg};
  `,

  inventoryHeader: css`
    background: linear-gradient(145deg, ${colors.richPurple}60 0%, ${colors.deepNavy}40 100%);
    border: 1px solid ${colors.neonTeal}40;
    border-radius: ${layout.borderRadius.xl};
    padding: ${layout.spacing.xl};
    margin-bottom: ${layout.spacing['2xl']};
    backdrop-filter: blur(10px);
    box-shadow: 0 8px 25px ${colors.charcoal}40;
  `,

  headerContent: css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1200px;
    margin: 0 auto;
    
    ${layout.media.mobile} {
      flex-direction: column;
      gap: ${layout.spacing.lg};
    }
  `,

  title: css`
    font-family: ${typography.fonts.decorative};
    font-size: ${typography.sizes['3xl']};
    background: linear-gradient(135deg, ${colors.neonGold} 0%, ${colors.neonTeal} 100%);
    background-clip: text;
    -webkit-background-clip: text;
    color: transparent;
    margin: 0;
    text-shadow: 0 0 30px ${colors.neonGold}40;
  `,

  backBtn: css`
    ${neoDecorocoBase.button}
    padding: ${layout.spacing.md} ${layout.spacing.lg};
    background: linear-gradient(135deg, ${colors.neonTeal}20 0%, ${colors.neonBlue}20 100%);
    border: 1px solid ${colors.neonTeal}60;
    color: ${colors.neonTeal};
    border-radius: ${layout.borderRadius.lg};
    transition: all 0.3s ease;
    
    &:hover {
      background: linear-gradient(135deg, ${colors.neonTeal}30 0%, ${colors.neonBlue}30 100%);
      border-color: ${colors.neonTeal}80;
      transform: translateY(-2px);
    }
  `,

  searchContainer: css`
    max-width: 1000px;
    margin: 0 auto;
  `,

  searchForm: css`
    background: linear-gradient(145deg, ${colors.richPurple}50 0%, ${colors.deepNavy}30 100%);
    border: 2px solid ${colors.neonGold}40;
    border-radius: ${layout.borderRadius.xl};
    padding: ${layout.spacing['2xl']};
    margin-bottom: ${layout.spacing['2xl']};
    backdrop-filter: blur(15px);
    box-shadow: 0 15px 35px ${colors.charcoal}60;
  `,

  searchInputContainer: css`
    display: flex;
    gap: ${layout.spacing.md};
    margin-bottom: ${layout.spacing.lg};
    
    ${layout.media.mobile} {
      flex-direction: column;
    }
  `,

  searchInput: css`
    flex: 1;
    padding: ${layout.spacing.lg};
    background: ${colors.charcoal}60;
    border: 1px solid ${colors.neonTeal}30;
    border-radius: ${layout.borderRadius.lg};
    color: ${colors.textLight};
    font-size: ${typography.sizes.md};
    backdrop-filter: blur(5px);
    
    &::placeholder {
      color: ${colors.textMuted};
      font-style: italic;
    }
    
    &:focus {
      outline: none;
      border-color: ${colors.neonTeal}80;
      box-shadow: 0 0 20px ${colors.neonTeal}30;
    }
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `,

  searchBtn: css`
    ${neoDecorocoBase.button}
    padding: ${layout.spacing.lg} ${layout.spacing.xl};
    background: linear-gradient(135deg, ${colors.neonGold} 0%, ${colors.neonTeal} 100%);
    color: ${colors.charcoal};
    border: none;
    border-radius: ${layout.borderRadius.lg};
    font-weight: ${typography.weights.bold};
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px ${colors.neonGold}40;
    }
  `,

  searchBtnDisabled: css`
    opacity: 0.5;
    cursor: not-allowed;
    
    &:hover {
      transform: none;
      box-shadow: none;
    }
  `,
};

export default Search;
