import { useState, useCallback, useMemo, useEffect } from 'react';
import { documentCache, searchCache } from '../../../utils/cache';

import config from '../../../config';
import ExportButton from '../../common/ExportButton';
import Pagination from '../../common/Pagination';
import styles from './styles';

const PAGE_SIZE = 22;

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
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDocuments = useCallback(async (searchParams = {}, requestedPage = 1) => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const queryParams = new URLSearchParams({
        ...searchParams,
        page: requestedPage,
        limit: PAGE_SIZE
      });

      const baseUrl = `${config.apiUrl}/api/documents`;
      const url = searchParams.query
        ? `${baseUrl}/search?${queryParams}`
        : `${baseUrl}?${queryParams}`;

      // Try cache first
      const cacheKey = url;
      const cachedData = documentCache.get(cacheKey);
      
      if (cachedData) {
        setDocuments(cachedData.items || cachedData);
        setTotalPages(cachedData.totalPages || Math.ceil((cachedData.total || cachedData.length) / PAGE_SIZE));
        setTotalItems(cachedData.total || cachedData.length);
        return;
      }

      const response = await fetch(url, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }

      const data = await response.json();
      
      // Handle both paginated and non-paginated responses
      if (data.items && data.pagination) {
        // Paginated response from backend
        setDocuments(data.items);
        setTotalPages(data.pagination.totalPages);
        setTotalItems(data.pagination.total);
        documentCache.set(cacheKey, data);
      } else {
        // Non-paginated response - implement client-side pagination
        const items = Array.isArray(data) ? data : [];
        const total = items.length;
        const totalPagesCalc = Math.ceil(total / PAGE_SIZE);
        const startIndex = (requestedPage - 1) * PAGE_SIZE;
        const endIndex = startIndex + PAGE_SIZE;
        const pageItems = items.slice(startIndex, endIndex);
        
        setDocuments(pageItems);
        setTotalPages(totalPagesCalc);
        setTotalItems(total);
        
        documentCache.set(cacheKey, {
          items: pageItems,
          totalPages: totalPagesCalc,
          total: total,
          allItems: items
        });
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      setDocuments([]);
      setTotalPages(0);
      setTotalItems(0);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  // Setup pagination handler
  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
    const searchParams = {};
    if (searchTerm) searchParams.query = searchTerm;
    if (filterCategory) searchParams.category = filterCategory;
    fetchDocuments(searchParams, newPage);
  }, [fetchDocuments, searchTerm, filterCategory]);

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
      fetchDocuments({}, 1);
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
      <div css={styles.headerSection}>
        <h1 css={styles.header}>Document Vault</h1>
        <ExportButton 
          data={semanticResults || documents}
          filename="documents_data"
          includeTypes={['csv', 'json', 'xlsx']}
        />
      </div>

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
                <th onClick={() => {
                  if (sortColumn === 'title') {
                    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortColumn('title');
                    setSortDirection('asc');
                  }
                }}>
                  Title {sortColumn === 'title' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                <th onClick={() => {
                  if (sortColumn === 'author') {
                    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortColumn('author');
                    setSortDirection('asc');
                  }
                }}>
                  Author {sortColumn === 'author' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                <th onClick={() => {
                  if (sortColumn === 'category') {
                    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortColumn('category');
                    setSortDirection('asc');
                  }
                }}>
                  Category {sortColumn === 'category' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                <th onClick={() => {
                  if (sortColumn === 'field') {
                    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortColumn('field');
                    setSortDirection('asc');
                  }
                }}>
                  Field {sortColumn === 'field' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                <th onClick={() => {
                  if (sortColumn === 'publication_year') {
                    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortColumn('publication_year');
                    setSortDirection('asc');
                  }
                }}>
                  Year {sortColumn === 'publication_year' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                <th>Summary</th>
                <th>Thesis</th>
                <th>Issue</th>
                <th onClick={() => {
                  if (sortColumn === 'journal_publisher') {
                    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortColumn('journal_publisher');
                    setSortDirection('asc');
                  }
                }}>
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
          <p>Loading documents...</p>
        </div>
      )}

      {!semanticResults && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={PAGE_SIZE}
          onPageChange={handlePageChange}
        />
      )}

      <div css={styles.footer}>
        <p>Total Documents: {semanticResults ? semanticResults.length : totalItems}</p>
      </div>
    </div>
  );
};

export default DocumentsTable;
