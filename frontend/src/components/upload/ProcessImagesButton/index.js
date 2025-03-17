import React, { useReducer, useState } from 'react';

import axios from 'axios';
import config from '../../../config';
import { put } from '@vercel/blob';
import styles from './styles';

const defaultInstruction = 'I am an AI assistant that helps catalog and analyze products and documents.';

const progressReducer = (state, action) => {
  switch (action.type) {
    case 'SET_UPLOAD_PROGRESS':
      return { ...state, uploadProgress: action.payload };
    case 'SET_PROCESS_PROGRESS':
      return { 
        ...state, 
        processingProgress: action.payload, 
        processingStatus: action.status 
      };
    case 'RESET':
      return { 
        uploadProgress: 0, 
        processingProgress: 0, 
        processingStatus: '' 
      };
    default:
      return state;
  }
};

function ProcessImagesButton({ isAuthenticated, onProcess, isMinimized = false }) {
  const [selectedFiles, setSelectedFiles] = useState(null);
  const [instruction, setInstruction] = useState('');
  const [isInstructionFocused, setIsInstructionFocused] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  // Removed unused state variable: taskId

  const [progressState, dispatch] = useReducer(progressReducer, {
    uploadProgress: 0,
    processingProgress: 0,
    processingStatus: ''
  });

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 20) {
      setErrorMessage('Maximum 20 files allowed at once');
      return;
    }
    setSelectedFiles(files);
    setErrorMessage('');
    dispatch({ type: 'RESET' });
  };

  const handleProcess = async () => {
    if (!selectedFiles) {
      setErrorMessage('Please select files.');
      return;
    }
    setIsUploading(true);
    setErrorMessage('');

    try {
      // Upload files
      const uploadedFiles = await Promise.all(
        selectedFiles.map(async (file) => {
          const blobResponse = await axios.post(
            `${config.apiUrl}/api/blob-upload`,
            {
              filename: file.name,
              contentType: file.type
            },
            { withCredentials: true }
          );

          const blob = await put(blobResponse.data.url, file, {
            access: 'public',
            token: blobResponse.data.token
          });

          return {
            originalName: file.name,
            blobUrl: blob.url,
            fileType: file.type.startsWith('image/') ? 'image' : 'document'
          };
        })
      );

      dispatch({ type: 'SET_UPLOAD_PROGRESS', payload: 100 });

      // Send processing request
      const response = await axios.post(
        `${config.apiUrl}/api/process-files`,
        {
          files: uploadedFiles,
          instruction: instruction || defaultInstruction
        },
        { withCredentials: true }
      );

      if (response.data.task_id) {
        pollProcessingStatus(response.data.task_id);
      } else {
        throw new Error('No task ID received.');
      }
    } catch (error) {
      setErrorMessage('Processing failed. Please try again.');
      setIsUploading(false);
    }
  };

  const pollProcessingStatus = (taskId) => {
    const interval = setInterval(async () => {
      try {
        const statusResponse = await axios.get(
          `${config.apiUrl}/api/processing-status/${taskId}`,
          { withCredentials: true }
        );
        const { status, progress, message } = statusResponse.data;

        if (status === 'completed') {
          dispatch({ 
            type: 'SET_PROCESS_PROGRESS', 
            payload: 100, 
            status: 'Processing complete!' 
          });
          clearInterval(interval);
          setSelectedFiles(null);
          document.getElementById('file-upload').value = '';
          setIsUploading(false);
          if (onProcess) onProcess();
        } else if (status === 'failed') {
          setErrorMessage('Processing failed.');
          clearInterval(interval);
          setIsUploading(false);
        } else {
          dispatch({ 
            type: 'SET_PROCESS_PROGRESS', 
            payload: progress, 
            status: message 
          });
        }
      } catch {
        setErrorMessage('Error checking processing status.');
        setIsUploading(false);
        clearInterval(interval);
      }
    }, 2000);
  };

  if (!isAuthenticated) {
    return (
      <div css={styles.authMessage}>
        <p>Please sign in to process files</p>
      </div>
    );
  }

  return (
    <div css={styles.container(isMinimized)}>
      <div css={styles.instructionSection(isMinimized)}>
        <label htmlFor="instruction-input">Instructions:</label>
        <input
          type="text"
          id="instruction-input"
          value={isInstructionFocused || instruction ? instruction : defaultInstruction}
          onChange={(e) => setInstruction(e.target.value)}
          onFocus={() => setIsInstructionFocused(true)}
          onBlur={() => setIsInstructionFocused(false)}
          disabled={isUploading}
          css={styles.instructionInput}
        />
      </div>

      <div css={styles.fileUploadSection(isMinimized)}>
        <input
          id="file-upload"
          type="file"
          multiple
          onChange={handleFileChange}
          accept="image/jpeg,image/png,image/webp,image/heic,.pdf,.doc,.docx,.txt,.rtf"
          disabled={isUploading}
          css={styles.fileInput}
        />
        <label htmlFor="file-upload" css={styles.uploadLabel}>
          Choose Files
        </label>
        {selectedFiles && (
          <div css={styles.fileInfo}>
            {selectedFiles.length} files selected
          </div>
        )}
      </div>

      {errorMessage && (
        <div css={styles.errorMessage}>{errorMessage}</div>
      )}

      {isUploading && (
        <div css={styles.uploadProgress}>
          <div className="progress-bar">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${progressState.uploadProgress}%` }}
            />
          </div>
          <div className="progress-bar">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${progressState.processingProgress}%` }}
            />
          </div>
          <div className="processing-status">
            {progressState.processingStatus}
          </div>
        </div>
      )}

      {!isMinimized && (
        <button
          onClick={handleProcess}
          disabled={isUploading || !selectedFiles}
          css={styles.processButton}
          className={isUploading ? 'processing' : ''}
        >
          {isUploading ? 'Processing...' : 'Process Files'}
        </button>
      )}
    </div>
  );
}

export default ProcessImagesButton;
