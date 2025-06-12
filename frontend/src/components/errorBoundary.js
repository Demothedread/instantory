import React from 'react';
import { css } from '@emotion/react';
import { colors } from '../../styles/theme/colors';
import { neoDecorocoBase } from '../../styles/components/neo-decoroco/base';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error to monitoring service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div css={css`
          ${neoDecorocoBase.panel};
          padding: 2rem;
          margin: 2rem;
          text-align: center;
          border: 2px solid ${colors.neonRed};
        `}>
          <h2 css={css`color: ${colors.neonRed};`}>
            Something went wrong
          </h2>
          <details css={css`
            color: ${colors.textLight};
            margin-top: 1rem;
            text-align: left;
          `}>
            <summary>Error Details</summary>
            <pre>{this.state.error && this.state.error.toString()}</pre>
            <pre>{this.state.errorInfo.componentStack}</pre>
          </details>
          <button 
            css={css`
              ${neoDecorocoBase.button};
              margin-top: 1rem;
            `}
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;