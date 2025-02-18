import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { documentCache, searchCache } from '../../../utils/cache';

import config from '../../../config';
import styles from './styles';
import useInfiniteScroll from '../../../hooks/useInfiniteScroll';

const PAGE_SIZE = 20;

const DocumentsTable = () => {
  const [documents, setDocuments] = useState([]);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [semanticResults, setSemanticResults] = useState(null);
  const [semanticQuery, setSemanticQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDocuments = useCallback(async (searchParams = {}, isNextPage = false) => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const currentPage = isNextPage ? page : 1;
      const queryParams = new URLSearchParams({
        ...searchParams,
        page: currentPage,
        limit: PAGE_SIZE
      });

      const baseUrl = `${config.apiUrl}/api/documents`;
      const url = searchParams.query
        ? `${baseUrl}/search?${queryParams}`
        : `${baseUrl}?${queryParams}`;

      // Try cache first
      const cacheKey = url;
      const cachedData = documentCache.get(cacheKey);
      
      if (cachedData && !isNextPage) {
        setDocuments(cachedData);
        return;
      }

      const response = await fetch(url, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }

      const data = await response.json();
      
      // Update cache
      documentCache.set(cacheKey, data);
      
      // Update state
      if (isNextPage) {
        setDocuments(prev => [...prev, ...data]);
        setHasMore(data.length === PAGE_SIZE);
        setPage(currentPage + 1);
      } else {
        setDocuments(data);
        setHasMore(data.length === PAGE_SIZE);
        setPage(2);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, page]);

  // Setup infinite scroll
  const loadMore = useCallback(() => {
    if (!hasMore) return;
    const searchParams = {};
    if (searchTerm) searchParams.query = searchTerm;
    if (filterCategory) searchParams.category = filterCategory;
    fetchDocuments(searchParams, true);
  }, [fetchDocuments, hasMore, searchTerm, filterCategory]);

  useInfiniteScroll(loadMore, {
    enabled: hasMore && !isLoading && !semanticResults,
    dependencies: [hasMore, isLoading, semanticResults]
  });

  const handleSemanticSearch = async () => {
    if (!semanticQuery.trim()) return;
    
    setIsSearching(true);
    try {
      // Check cache first
      const cacheKey = `semantic_${semanticQuery}`;
      const cachedResults = searchCache.get(cacheKey);
      
      if (cachedResults) {
        setSemanticResults(cachedResults);
        return;
      }

      const response = await fetch(`${config.apiUrl}/api/documents/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ query: semanticQuery })
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      
      // Cache results
      searchCache.set(cacheKey, data.results);
      setSemanticResults(data.results);
    } catch (error) {
      console.error('Error during semantic search:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleDownload = async (docId) => {
    try {
      window.open(`${config.apiUrl}/api/documents/${docId}/file`, '_blank');
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  const categories = useMemo(() => {
    if (!Array.isArray(documents)) return [];
    return [...new Set(documents.map(doc => doc.category))].filter(Boolean);
  }, [documents]);

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

  useEffect(() => {
    if (!semanticResults) {
      fetchDocuments();
    }
  }, [fetchDocuments, semanticResults]);

  if (!Array.isArray(documents) && !semanticResults) {
    return (
      <div css={styles.container}>
        <h2 css={styles.header}>Document Vault</h2>
        <p>No documents available.</p>
      </div>
    );
  }

  return (
    <div css={styles.container}>
      <h1 css={styles.header}>Document Vault</h1>

      <div css={styles.filterSection}>
        <div css={styles.searchFilter}>
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={!!semanticResults}
          />
        </div>
        <div css={styles.filterMenu}>
          <button 
            className="filter-menu-trigger"
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            onBlur={() => setTimeout(() => setShowFilterMenu(false), 200)}
            disabled={!!semanticResults}
          >
            Filter by Category
          </button>
          {showFilterMenu && (
            <div className="filter-dropdown">
              <button onClick={() => setFilterCategory('')}>All Categories</button>
              {categories.map(category => (
                <button key={category} onClick={() => setFilterCategory(category)}>
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div css={styles.semanticSearch}>
        <input
          type="text"
          placeholder="Enter semantic search query..."
          value={semanticQuery}
          onChange={(e) => setSemanticQuery(e.target.value)}
        />
        <button 
          onClick={handleSemanticSearch}
          disabled={isSearching || !semanticQuery.trim()}
        >
          {isSearching ? 'Searching...' : 'Semantic Search'}
        </button>
        {semanticResults && (
          <button 
            onClick={() => {
              setSemanticResults(null);
              setSemanticQuery('');
            }}
            className="clear-results"
          >
            Clear Results
          </button>
        )}
      </div>

      {semanticResults ? (
        <div css={styles.searchResults}>
          <h3 className="subtitle">Search Results</h3>
          {semanticResults.map((result, index) => (
            <div key={index} css={styles.resultItem}>
              <div className="result-header">
                <h4>{result.title}</h4>
                <button 
                  onClick={() => handleDownload(result.id)}
                  css={styles.downloadButton}
                >
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
      ) : (
        <div css={styles.tableContainer}>
          <table>
            <thead>
              <tr>
                <th onClick={() => setSortColumn('title')}>
                  Title {sortColumn === 'title' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                <th onClick={() => setSortColumn('author')}>
                  Author {sortColumn === 'author' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                <th onClick={() => setSortColumn('category')}>
                  Category {sortColumn === 'category' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                <th onClick={() => setSortColumn('field')}>
                  Field {sortColumn === 'field' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                <th onClick={() => setSortColumn('publication_year')}>
                  Year {sortColumn === 'publication_year' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                <th>Summary</th>
                <th>Thesis</th>
                <th>Issue</th>
                <th onClick={() => setSortColumn('journal_publisher')}>
                  Journal/Publisher {sortColumn === 'journal_publisher' && (sortDirection === 'asc' ? '▲' : '▼')}
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
                    <button 
                      onClick={() => handleDownload(doc.id)}
                      css={styles.downloadButton}
                    >
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isLoading && !semanticResults && (
        <div css={styles.loadingIndicator}>
          <div className="loading-spinner"></div>
          <p>Loading more documents...</p>
        </div>
      )}

      <div css={styles.footer}>
        <p>Total Documents: {semanticResults ? semanticResults.length : filteredDocuments.length}</p>
      </div>
    </div>
  );
};

export default DocumentsTable;
