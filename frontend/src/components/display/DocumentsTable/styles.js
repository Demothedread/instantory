import colors from '../../../styles/theme/colors'; //frontend/src/styles/theme/colors.js
import { css } from '@emotion/react';
import neoDecorocoBase from '../../../styles/components/neo-decoroco/base'; // Verify this path

const styles = {
  container: css`
    display: flex;
    flex-direction: column;
    width: 100%;
    min-height: 600px;
    background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.1);
    position: relative;
    overflow: hidden;

    /* Art deco pattern overlay */
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, 
        #00ff9d 0%,
        #00b8ff 50%,
        #00ff9d 100%
      );
      box-shadow: 0 0 20px rgba(0, 255, 157, 0.5);
    }
  `,

  header: css`
    color: #ffffff;
    font-size: 28px;
    font-weight: 600;
    margin-bottom: 20px;
    text-align: center;
    font-family: 'Metropolis', sans-serif;
    letter-spacing: 1px;
    text-shadow: 0 0 10px rgba(0, 255, 157, 0.5);

    /* Art deco decorative elements */
    &::before,
    &::after {
      content: '✧';
      margin: 0 10px;
      color: #00ff9d;
    }
  `,

  filterSection: css`
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
    padding: 15px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  `,

  searchFilter: css`
    flex: 1;

    input {
      width: 100%;
      padding: 10px 15px;
      border-radius: 25px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      background: rgba(255, 255, 255, 0.1);
      color: #ffffff;
      font-family: 'Metropolis', sans-serif;
      transition: all 0.3s ease;

      &:focus {
        outline: none;
        border-color: #00ff9d;
        box-shadow: 0 0 15px rgba(0, 255, 157, 0.3);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  `,

  filterMenu: css`
    position: relative;

    .filter-menu-trigger {
      padding: 10px 20px;
      border-radius: 25px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      background: rgba(255, 255, 255, 0.1);
      color: #ffffff;
      font-family: 'Metropolis', sans-serif;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.2);
        border-color: #00ff9d;
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    .filter-dropdown {
      position: absolute;
      top: 100%;
      right: 0;
      margin-top: 5px;
      background: #2a2a2a;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
      z-index: 10;

      button {
        display: block;
        width: 100%;
        padding: 10px 20px;
        text-align: left;
        border: none;
        background: none;
        color: #ffffff;
        cursor: pointer;
        transition: background 0.2s ease;

        &:hover {
          background: rgba(0, 255, 157, 0.1);
        }
      }
    }
  `,

  semanticSearch: css`
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    padding: 15px;
    background: rgba(0, 255, 157, 0.05);
    border-radius: 8px;
    border: 1px solid rgba(0, 255, 157, 0.2);

    input {
      flex: 1;
      padding: 10px 15px;
      border-radius: 25px;
      border: 1px solid rgba(0, 255, 157, 0.3);
      background: rgba(255, 255, 255, 0.1);
      color: #ffffff;
      font-family: 'Metropolis', sans-serif;

      &:focus {
        outline: none;
        border-color: #00ff9d;
        box-shadow: 0 0 15px rgba(0, 255, 157, 0.3);
      }
    }

    button {
      padding: 10px 20px;
      border-radius: 25px;
      border: none;
      background: linear-gradient(135deg, #00ff9d 0%, #00b8ff 100%);
      color: #1a1a1a;
      font-family: 'Metropolis', sans-serif;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(0, 255, 157, 0.3);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      &.clear-results {
        background: rgba(255, 77, 77, 0.2);
        color: #ff4d4d;

        &:hover {
          background: rgba(255, 77, 77, 0.3);
        }
      }
    }
  `,

  searchResults: css`
    .subtitle {
      color: #ffffff;
      font-size: 20px;
      margin-bottom: 15px;
      font-family: 'Metropolis', sans-serif;
    }
  `,

  resultItem: css`
    margin-bottom: 20px;
    padding: 15px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);

    .result-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;

      h4 {
        color: #00ff9d;
        margin: 0;
        font-family: 'Metropolis', sans-serif;
      }
    }

    .result-summary {
      color: #ffffff;
      margin-bottom: 15px;
    }

    .relevant-chunks {
      background: rgba(0, 255, 157, 0.05);
      padding: 10px;
      border-radius: 4px;

      h5 {
        color: #00ff9d;
        margin: 0 0 10px 0;
        font-family: 'Metropolis', sans-serif;
      }

      .chunk-content {
        color: #ffffff;
        font-style: italic;
      }
    }
  `,

  tableContainer: css`
    overflow-x: auto;
    -webkit-overflow-scrolling: touch; /* For smooth scrolling on iOS */
    
    /* Hide scrollbar for cleaner look but maintain functionality */
    &::-webkit-scrollbar {
      height: 4px;
    }
    
    &::-webkit-scrollbar-track {
      background: transparent;
    }
    
    &::-webkit-scrollbar-thumb {
      background: ${colors.neonTeal};
      border-radius: 2px;
    }

    table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      color: #ffffff;

      th, td {
        padding: 12px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        text-align: left;
      }

      th {
        background: rgba(0, 255, 157, 0.1);
        font-family: 'Metropolis', sans-serif;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.2s ease;

        &:hover {
          background: rgba(0, 255, 157, 0.2);
        }
      }

      tr:hover td {
        background: rgba(255, 255, 255, 0.05);
      }

      .expandable-cell {
        max-width: 200px;
        position: relative;

        .cell-content {
          max-height: 100px;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: max-height 0.3s ease;

          &:hover {
            max-height: none;
            position: absolute;
            background: #2a2a2a;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 4px;
            padding: 10px;
            z-index: 10;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          }
        }
      }
    }
  `,

  downloadButton: css`
    ${neoDecorocoBase.button}
    padding: 8px 15px;
    border-radius: 20px;
    border: none;
    background: linear-gradient(135deg, #00ff9d 0%, #00b8ff 100%);
    color: #1a1a1a;
    font-family: 'Metropolis', sans-serif;
    font-weight: 600;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: ${colors.neonGlow} ${colors.neonTeal};
    }
  `,

  loadingIndicator: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    color: #00ff9d;

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(0, 255, 157, 0.3);
      border-radius: 50%;
      border-top-color: #00ff9d;
      animation: spin 1s ease-in-out infinite;
      margin-bottom: 10px;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    p {
      color: #ffffff;
      font-family: 'Metropolis', sans-serif;
    }
  `,

  footer: css`
    text-align: center;
    color: #ffffff;
    font-family: 'Metropolis', sans-serif;
    padding: 10px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  `
};

export default styles;
