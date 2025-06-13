import { css } from '@emotion/react';
import { useState } from 'react';
import { neoDecorocoBase } from '../../styles/components/neo-decoroco/base';
import layout from '../../styles/layouts/constraints';
import { colors } from '../../styles/theme/colors';

const DocumentViewer = ({ documents = [], onDocumentSelect }) => {
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'preview', 'fullscreen'
  const [searchTerm, setSearchTerm] = useState('');
  const [annotations, setAnnotations] = useState({});

  const filteredDocuments = documents.filter(doc =>
    doc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.summary?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDocumentSelect = (document) => {
    setSelectedDocument(document);
    setViewMode('preview');
    onDocumentSelect?.(document);
  };

  const addAnnotation = (text, position) => {
    if (!selectedDocument) return;
    
    const docId = selectedDocument.id || selectedDocument.title;
    const newAnnotation = {
      id: Date.now(),
      text,
      position,
      timestamp: new Date().toISOString()
    };
    
    setAnnotations(prev => ({
      ...prev,
      [docId]: [...(prev[docId] || []), newAnnotation]
    }));
  };

  const renderDocumentContent = (document) => {
    if (!document) return null;

    return (
      <div css={styles.documentContent}>
        <div css={styles.documentHeader}>
          <h2 css={styles.documentTitle}>{document.title}</h2>
          {document.author && (
            <p css={styles.documentAuthor}>by {document.author}</p>
          )}
          {document.publication_year && (
            <p css={styles.documentYear}>Published: {document.publication_year}</p>
          )}
        </div>

        <div css={styles.documentMeta}>
          {document.category && (
            <span css={styles.metaTag}>{document.category}</span>
          )}
          {document.field && (
            <span css={styles.metaTag}>{document.field}</span>
          )}
          {document.hashtags && (
            <div css={styles.hashtagContainer}>
              {document.hashtags.split(',').map((tag, index) => (
                <span key={index} css={styles.hashtag}>
                  #{tag.trim()}
                </span>
              ))}
            </div>
          )}
        </div>

        <div css={styles.documentBody}>
          {document.summary && (
            <div css={styles.section}>
              <h3 css={styles.sectionTitle}>Summary</h3>
              <p css={styles.sectionContent}>{document.summary}</p>
            </div>
          )}

          {document.thesis && (
            <div css={styles.section}>
              <h3 css={styles.sectionTitle}>Thesis</h3>
              <p css={styles.sectionContent}>{document.thesis}</p>
            </div>
          )}

          {document.issue && (
            <div css={styles.section}>
              <h3 css={styles.sectionTitle}>Key Issues</h3>
              <p css={styles.sectionContent}>{document.issue}</p>
            </div>
          )}

          {document.influenced_by && (
            <div css={styles.section}>
              <h3 css={styles.sectionTitle}>Influences</h3>
              <p css={styles.sectionContent}>{document.influenced_by}</p>
            </div>
          )}

          {document.content && (
            <div css={styles.section}>
              <h3 css={styles.sectionTitle}>Full Content</h3>
              <div css={styles.fullContent}>
                {document.content.split('\n').map((paragraph, index) => (
                  <p key={index} css={styles.paragraph}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Annotations */}
        <div css={styles.annotationsSection}>
          <h3 css={styles.sectionTitle}>📝 Annotations</h3>
          {annotations[document.id || document.title]?.length > 0 ? (
            <div css={styles.annotationsList}>
              {annotations[document.id || document.title].map((annotation) => (
                <div key={annotation.id} css={styles.annotation}>
                  <p css={styles.annotationText}>{annotation.text}</p>
                  <span css={styles.annotationTime}>
                    {new Date(annotation.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p css={styles.noAnnotations}>No annotations yet.</p>
          )}
          
          <div css={styles.addAnnotation}>
            <textarea
              css={styles.annotationInput}
              placeholder="Add an annotation..."
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  addAnnotation(e.target.value, window.getSelection().toString());
                  e.target.value = '';
                }
              }}
            />
            <p css={styles.annotationHint}>
              Press Ctrl+Enter to save annotation
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div css={styles.container}>
      <div css={styles.header}>
        <h3 css={styles.title}>📄 Document Browser</h3>
        <div css={styles.controls}>
          <input
            css={styles.searchInput}
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div css={styles.viewModeButtons}>
            <button
              css={[styles.viewModeButton, viewMode === 'list' && styles.activeViewMode]}
              onClick={() => setViewMode('list')}
            >
              📋 List
            </button>
            <button
              css={[styles.viewModeButton, viewMode === 'preview' && styles.activeViewMode]}
              onClick={() => setViewMode('preview')}
              disabled={!selectedDocument}
            >
              👁️ Preview
            </button>
            <button
              css={[styles.viewModeButton, viewMode === 'fullscreen' && styles.activeViewMode]}
              onClick={() => setViewMode('fullscreen')}
              disabled={!selectedDocument}
            >
              🔍 Fullscreen
            </button>
          </div>
        </div>
      </div>

      <div css={styles.content}>
        {viewMode === 'list' || viewMode === 'preview' ? (
          <div css={styles.splitView}>
            {/* Document List */}
            <div css={[styles.documentList, viewMode === 'preview' && styles.narrowList]}>
              <div css={styles.listHeader}>
                <h4 css={styles.listTitle}>Documents ({filteredDocuments.length})</h4>
              </div>
              
              {filteredDocuments.length === 0 ? (
                <div css={styles.emptyState}>
                  <span css={styles.emptyIcon}>📄</span>
                  <h4>No Documents Found</h4>
                  <p>
                    {documents.length === 0 
                      ? 'Upload and process some documents to get started.'
                      : 'No documents match your search criteria.'
                    }
                  </p>
                </div>
              ) : (
                <div css={styles.documentItems}>
                  {filteredDocuments.map((document, index) => (
                    <div
                      key={index}
                      css={[
                        styles.documentItem,
                        selectedDocument === document && styles.selectedItem
                      ]}
                      onClick={() => handleDocumentSelect(document)}
                    >
                      <div css={styles.itemHeader}>
                        <h5 css={styles.itemTitle}>{document.title}</h5>
                        {document.publication_year && (
                          <span css={styles.itemYear}>{document.publication_year}</span>
                        )}
                      </div>
                      {document.author && (
                        <p css={styles.itemAuthor}>{document.author}</p>
                      )}
                      {document.summary && (
                        <p css={styles.itemSummary}>
                          {document.summary.substring(0, 150)}
                          {document.summary.length > 150 ? '...' : ''}
                        </p>
                      )}
                      <div css={styles.itemTags}>
                        {document.category && (
                          <span css={styles.itemTag}>{document.category}</span>
                        )}
                        {document.field && (
                          <span css={styles.itemTag}>{document.field}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Document Preview */}
            {viewMode === 'preview' && (
              <div css={styles.documentPreview}>
                {selectedDocument ? (
                  renderDocumentContent(selectedDocument)
                ) : (
                  <div css={styles.noSelection}>
                    <span css={styles.noSelectionIcon}>👆</span>
                    <h4>Select a Document</h4>
                    <p>Choose a document from the list to preview its content.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Fullscreen View */
          <div css={styles.fullscreenView}>
            {selectedDocument ? (
              renderDocumentContent(selectedDocument)
            ) : (
              <div css={styles.noSelection}>
                <span css={styles.noSelectionIcon}>📄</span>
                <h4>No Document Selected</h4>
                <p>Return to list view to select a document.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: css`
    display: flex;
    flex-direction: column;
    height: 100%;
  `,

  header: css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${layout.spacing.md} ${layout.spacing.lg};
    border-bottom: 1px solid ${colors.border};
    flex-wrap: wrap;
    gap: ${layout.spacing.md};
  `,

  title: css`
    color: ${colors.neonTeal};
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
  `,

  controls: css`
    display: flex;
    gap: ${layout.spacing.md};
    align-items: center;
    flex-wrap: wrap;
  `,

  searchInput: css`
    ${neoDecorocoBase.input}
    min-width: 200px;
    padding: ${layout.spacing.sm} ${layout.spacing.md};
  `,

  viewModeButtons: css`
    display: flex;
    gap: ${layout.spacing.xs};
  `,

  viewModeButton: css`
    ${neoDecorocoBase.button}
    padding: ${layout.spacing.sm} ${layout.spacing.md};
    font-size: 0.875rem;
    background: transparent;
    border: 1px solid ${colors.border};
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `,

  activeViewMode: css`
    background: rgba(26, 148, 133, 0.1);
    border-color: ${colors.neonTeal};
    color: ${colors.neonTeal};
  `,

  content: css`
    flex: 1;
    overflow: hidden;
  `,

  splitView: css`
    display: flex;
    height: 100%;
  `,

  documentList: css`
    width: 100%;
    border-right: 1px solid ${colors.border};
    display: flex;
    flex-direction: column;
  `,

  narrowList: css`
    width: 40%;
  `,

  listHeader: css`
    padding: ${layout.spacing.md} ${layout.spacing.lg};
    border-bottom: 1px solid ${colors.border};
  `,

  listTitle: css`
    color: ${colors.textLight};
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
  `,

  documentItems: css`
    flex: 1;
    overflow-y: auto;
    padding: ${layout.spacing.sm};
  `,

  documentItem: css`
    ${neoDecorocoBase.card}
    padding: ${layout.spacing.md};
    margin-bottom: ${layout.spacing.sm};
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      border-color: ${colors.neonTeal};
      transform: translateY(-1px);
    }
  `,

  selectedItem: css`
    border-color: ${colors.neonGold};
    background: rgba(212, 175, 55, 0.05);
  `,

  itemHeader: css`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: ${layout.spacing.sm};
  `,

  itemTitle: css`
    color: ${colors.neonTeal};
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    flex: 1;
    margin-right: ${layout.spacing.sm};
  `,

  itemYear: css`
    color: ${colors.textMuted};
    font-size: 0.875rem;
    font-weight: normal;
  `,

  itemAuthor: css`
    color: ${colors.textLight};
    margin: 0 0 ${layout.spacing.sm} 0;
    font-size: 0.875rem;
    font-style: italic;
  `,

  itemSummary: css`
    color: ${colors.textLight};
    margin: 0 0 ${layout.spacing.sm} 0;
    font-size: 0.875rem;
    line-height: 1.4;
    opacity: 0.8;
  `,

  itemTags: css`
    display: flex;
    gap: ${layout.spacing.xs};
    flex-wrap: wrap;
  `,

  itemTag: css`
    background: rgba(26, 148, 133, 0.1);
    color: ${colors.neonTeal};
    padding: 2px ${layout.spacing.sm};
    border-radius: 12px;
    font-size: 0.75rem;
    border: 1px solid ${colors.neonTeal}30;
  `,

  documentPreview: css`
    width: 60%;
    overflow-y: auto;
    background: rgba(0, 0, 0, 0.1);
  `,

  fullscreenView: css`
    height: 100%;
    overflow-y: auto;
  `,

  documentContent: css`
    padding: ${layout.spacing.xl};
    max-width: 800px;
    margin: 0 auto;
  `,

  documentHeader: css`
    margin-bottom: ${layout.spacing.xl};
    text-align: center;
    padding-bottom: ${layout.spacing.lg};
    border-bottom: 2px solid ${colors.border};
  `,

  documentTitle: css`
    color: ${colors.neonGold};
    margin: 0 0 ${layout.spacing.md} 0;
    font-size: 2rem;
    font-weight: 700;
    line-height: 1.3;
  `,

  documentAuthor: css`
    color: ${colors.textLight};
    margin: 0 0 ${layout.spacing.sm} 0;
    font-size: 1.125rem;
    font-style: italic;
  `,

  documentYear: css`
    color: ${colors.textMuted};
    margin: 0;
    font-size: 1rem;
  `,

  documentMeta: css`
    display: flex;
    gap: ${layout.spacing.md};
    margin-bottom: ${layout.spacing.xl};
    flex-wrap: wrap;
    align-items: center;
  `,

  metaTag: css`
    background: rgba(212, 175, 55, 0.1);
    color: ${colors.neonGold};
    padding: ${layout.spacing.sm} ${layout.spacing.md};
    border-radius: 16px;
    font-size: 0.875rem;
    font-weight: 600;
    border: 1px solid ${colors.neonGold}30;
  `,

  hashtagContainer: css`
    display: flex;
    gap: ${layout.spacing.xs};
    flex-wrap: wrap;
  `,

  hashtag: css`
    color: ${colors.neonTeal};
    font-size: 0.875rem;
    font-weight: 500;
  `,

  documentBody: css`
    margin-bottom: ${layout.spacing.xl};
  `,

  section: css`
    margin-bottom: ${layout.spacing.xl};
    
    &:last-child {
      margin-bottom: 0;
    }
  `,

  sectionTitle: css`
    color: ${colors.neonTeal};
    margin: 0 0 ${layout.spacing.md} 0;
    font-size: 1.25rem;
    font-weight: 600;
    padding-bottom: ${layout.spacing.sm};
    border-bottom: 1px solid ${colors.border};
  `,

  sectionContent: css`
    color: ${colors.textLight};
    margin: 0;
    line-height: 1.6;
    font-size: 1rem;
  `,

  fullContent: css`
    color: ${colors.textLight};
    line-height: 1.7;
  `,

  paragraph: css`
    margin: 0 0 ${layout.spacing.lg} 0;
    text-align: justify;
    
    &:last-child {
      margin-bottom: 0;
    }
  `,

  annotationsSection: css`
    border-top: 2px solid ${colors.border};
    padding-top: ${layout.spacing.xl};
    margin-top: ${layout.spacing.xl};
  `,

  annotationsList: css`
    margin-bottom: ${layout.spacing.lg};
  `,

  annotation: css`
    background: rgba(26, 148, 133, 0.05);
    border: 1px solid ${colors.neonTeal}30;
    border-radius: 8px;
    padding: ${layout.spacing.md};
    margin-bottom: ${layout.spacing.sm};
  `,

  annotationText: css`
    color: ${colors.textLight};
    margin: 0 0 ${layout.spacing.xs} 0;
    line-height: 1.5;
  `,

  annotationTime: css`
    color: ${colors.textMuted};
    font-size: 0.75rem;
  `,

  noAnnotations: css`
    color: ${colors.textMuted};
    font-style: italic;
    margin: 0 0 ${layout.spacing.lg} 0;
  `,

  addAnnotation: css`
    margin-top: ${layout.spacing.lg};
  `,

  annotationInput: css`
    ${neoDecorocoBase.input}
    width: 100%;
    min-height: 80px;
    resize: vertical;
    font-family: inherit;
  `,

  annotationHint: css`
    color: ${colors.textMuted};
    font-size: 0.75rem;
    margin: ${layout.spacing.xs} 0 0 0;
    font-style: italic;
  `,

  emptyState: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;
    color: ${colors.textLight};
    text-align: center;
    padding: ${layout.spacing.xl};
  `,

  noSelection: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: ${colors.textLight};
    text-align: center;
    padding: ${layout.spacing.xl};
  `,

  emptyIcon: css`
    font-size: 3rem;
    margin-bottom: ${layout.spacing.lg};
    opacity: 0.5;
  `,

  noSelectionIcon: css`
    font-size: 3rem;
    margin-bottom: ${layout.spacing.lg};
    opacity: 0.5;
  `
};

export default DocumentViewer;
