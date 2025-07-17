/**
 * Service for handling file processing operations with the backend API
 */
class FileProcessingService {
  constructor() {
    this.baseURL = process.env.API_BASE_URL || '/api';
  }         

  /**
   * Upload and process a single file
   * @param {File} file - The file to process
   * @param {string} userInstructions - Optional user instructions for processing
   * @param {Function} onProgress - Progress callback function
   * @returns {Promise<Object>} Processing result
   */
  async processFile(file, userInstructions = '', onProgress = null) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (userInstructions) {
        formData.append('instructions', userInstructions);
      }

      const response = await fetch(`${this.baseURL}/process`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
        headers: {
          // Don't set Content-Type - let browser set it with boundary for FormData
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Call progress callback if provided
      if (onProgress) {
        onProgress(100);
      }

      return result;
    } catch (error) {
      console.error('File processing failed:', error);
      throw new Error(`Failed to process file "${file.name}": ${error.message}`);
    }
  }

  /**
   * Process multiple files in batch
   * @param {Array<{file: File, instructions?: string}>} fileItems - Array of file objects
   * @param {Function} onProgress - Progress callback function
   * @param {Function} onFileComplete - Callback when individual file completes
   * @returns {Promise<Array>} Array of processing results
   */
  async processBatch(fileItems, onProgress = null, onFileComplete = null) {
    const results = [];
    const total = fileItems.length;

    for (let i = 0; i < fileItems.length; i++) {
      const fileItem = fileItems[i];
      
      try {
        // Individual file progress callback
        const fileProgressCallback = (progress) => {
          if (onProgress) {
            const overallProgress = ((i / total) * 100) + ((progress / total));
            onProgress(Math.min(overallProgress, 100));
          }
        };

        const result = await this.processFile(
          fileItem.file, 
          fileItem.instructions || '', 
          fileProgressCallback
        );

        results.push({
          success: true,
          fileId: fileItem.id,
          fileName: fileItem.file.name,
          result
        });

        // Notify completion of individual file
        if (onFileComplete) {
          onFileComplete(fileItem.id, 'completed', result);
        }

      } catch (error) {
        console.error(`Batch processing failed for file ${fileItem.file.name}:`, error);
        
        results.push({
          success: false,
          fileId: fileItem.id,
          fileName: fileItem.file.name,
          error: error.message
        });

        // Notify failure of individual file
        if (onFileComplete) {
          onFileComplete(fileItem.id, 'failed', null, error.message);
        }
      }
    }

    return results;
  }

  /**
   * Upload file for storage without immediate processing
   * @param {File} file - The file to upload
   * @param {Function} onProgress - Progress callback function
   * @param {AbortController} abortController - Optional abort controller for cancellation
   * @returns {Promise<Object>} Upload result
   */
  async uploadFile(file, onProgress = null, abortController = null) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Modern fetch with progress tracking using ReadableStream
      const response = await fetch(`${this.baseURL}/upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
        signal: abortController?.signal,
        headers: {
          // Don't set Content-Type - let browser set it with boundary for FormData
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Upload failed with status: ${response.status}`);
      }

      // Read the response with progress tracking if supported
      if (onProgress && response.body) {
        const contentLength = response.headers.get('content-length');
        if (contentLength) {
          const total = parseInt(contentLength, 10);
          let loaded = 0;

          const reader = response.body.getReader();
          const chunks = [];

          while (true) {
            const { done, value } = await reader.read();
            
            if (done) break;
            
            chunks.push(value);
            loaded += value.length;
            
            if (onProgress) {
              const progress = (loaded / total) * 100;
              onProgress(Math.min(progress, 100));
            }
          }

          // Reconstruct the response
          const responseData = new TextDecoder().decode(
            new Uint8Array(chunks.reduce((acc, chunk) => [...acc, ...chunk], []))
          );
          
          return JSON.parse(responseData);
        }
      }

      // Fallback for responses without content-length or progress tracking disabled
      const result = await response.json();
      
      if (onProgress) {
        onProgress(100);
      }

      return result;

    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error(`Upload cancelled for file "${file.name}"`);
      }
      
      console.error('File upload failed:', error);
      throw new Error(`Failed to upload file "${file.name}": ${error.message}`);
    }
  }

  /**
   * Get processing status for a file
   * @param {string} fileId - The file ID to check
   * @returns {Promise<Object>} Status information
   */
  async getProcessingStatus(fileId) {
    try {
      const response = await fetch(`${this.baseURL}/process/status/${fileId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get processing status:', error);
      throw error;
    }
  }

  /**
   * Cancel processing for a file
   * @param {string} fileId - The file ID to cancel
   * @returns {Promise<Object>} Cancellation result
   */
  async cancelProcessing(fileId) {
    try {
      const response = await fetch(`${this.baseURL}/process/cancel/${fileId}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to cancel processing:', error);
      throw error;
    }
  }

  /**
   * Validate file before processing
   * @param {File} file - The file to validate
   * @returns {Object} Validation result
   */
  validateFile(file) {
    const errors = [];
    const MAX_SIZE = 20 * 1024 * 1024; // 20MB
    const ALLOWED_TYPES = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    // Check file size
    if (file.size > MAX_SIZE) {
      errors.push(`File size exceeds 20MB limit (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
    }

    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      errors.push(`Unsupported file type: ${file.type}`);
    }

    // Check file name
    if (!file.name || file.name.trim() === '') {
      errors.push('File name is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Export singleton instance
export const fileProcessingService = new FileProcessingService();
export default fileProcessingService;
