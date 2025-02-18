import React, { useEffect, useState } from 'react';

import config from '../../../config';
import styles from './styles';

const DocumentViewer = ({ documentUrl, title }) => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDocument = async () => {
      if (!documentUrl) {
        setError('No document URL provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        if (documentUrl.startsWith('s3://')) {
          // Fetch through backend proxy for S3 documents
          const response = await fetch(
            `${config.apiUrl}/api/documents/content?url=${encodeURIComponent(documentUrl)}`,
            { 
              credentials: 'include',
              headers: {
                'Accept': 'application/pdf,application/msword,text/plain'
              }
            }
          );

          if (!response.ok) {
            throw new Error(`Failed to fetch document: ${response.statusText}`);
          }

          const blob = await response.blob();
          const objectUrl = URL.createObjectURL(blob);
          setContent(objectUrl);
        } else {
          // Direct access for Blob URLs
          setContent(documentUrl);
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching document:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();

    // Cleanup function
    return () => {
      if (content && content.startsWith('blob:')) {
        URL.revokeObjectURL(content);
      }
    };
  }, [documentUrl]);

  if (loading) {
    return (
      <div css={styles.container}>
        <div css={styles.loadingSpinner}>
          <div className="spinner"></div>
          <p>Loading document...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div css={styles.container}>
        <div css={styles.error}>
          <p>Error loading document: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            css={styles.retryButton}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div css={styles.container}>
      {title && <h2 css={styles.title}>{title}</h2>}
      <div css={styles.viewerContainer}>
        {content && (
          <iframe
            src={content}
            title={title || "Document Viewer"}
            css={styles.viewer}
            sandbox="allow-same-origin allow-scripts"
          />
        )}
      </div>
    </div>
  );
};

export default DocumentViewer;
