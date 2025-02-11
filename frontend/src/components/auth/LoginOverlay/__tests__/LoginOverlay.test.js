import {
  createMockAuthContext,
  createMockGoogleResponse,
  mockApiError,
  mockApiSuccess,
  render,
} from '../../../../test-utils';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import LoginOverlay from '../index';
import React from 'react';

describe('LoginOverlay', () => {
  const mockHandleLogin = jest.fn();
  const mockHandleGoogleLogin = jest.fn();
  const mockClearError = jest.fn();

  const defaultProps = {
    isVisible: true,
  };

  const renderLoginOverlay = (props = {}) => {
    const mockContext = createMockAuthContext({
      handleLogin: mockHandleLogin,
      handleGoogleLogin: mockHandleGoogleLogin,
      clearError: mockClearError,
    });

    return render(<LoginOverlay {...defaultProps} {...props} />, {
      providerProps: { value: mockContext },
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Visibility', () => {
    it('renders when isVisible is true', () => {
      renderLoginOverlay();
      expect(screen.getByText('Welcome to Bartleby')).toBeInTheDocument();
    });

    it('does not render when isVisible is false', () => {
      renderLoginOverlay({ isVisible: false });
      expect(screen.queryByText('Welcome to Bartleby')).not.toBeInTheDocument();
    });
  });

  describe('Email Login', () => {
    it('handles email input changes', () => {
      renderLoginOverlay();
      const emailInput = screen.getByPlaceholderText('Enter your email');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      expect(emailInput.value).toBe('test@example.com');
    });

    it('submits email login form', async () => {
      renderLoginOverlay();
      const emailInput = screen.getByPlaceholderText('Enter your email');
      const submitButton = screen.getByText('Continue with Email');

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockHandleLogin).toHaveBeenCalledWith({
          email: 'test@example.com',
        });
      });
    });

    it('shows loading state during email login', async () => {
      mockHandleLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      renderLoginOverlay();

      const emailInput = screen.getByPlaceholderText('Enter your email');
      const submitButton = screen.getByText('Continue with Email');

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      expect(screen.getByText('Logging in...')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText('Continue with Email')).toBeInTheDocument();
      });
    });

    it('handles email login errors', async () => {
      const errorMessage = 'Invalid email address';
      mockHandleLogin.mockRejectedValue(new Error(errorMessage));
      renderLoginOverlay();

      const emailInput = screen.getByPlaceholderText('Enter your email');
      const submitButton = screen.getByText('Continue with Email');

      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(console.error).toHaveBeenCalled();
      });
    });
  });

  describe('Google Login', () => {
    it('handles successful Google login', async () => {
      renderLoginOverlay();
      const mockCredential = createMockGoogleResponse();

      // Simulate Google OAuth callback
      global.google.accounts.oauth2.initTokenClient = jest.fn().mockImplementation(
        ({ callback }) => ({
          requestAccessToken: () => callback(mockCredential),
        })
      );

      await waitFor(() => {
        expect(mockHandleGoogleLogin).toHaveBeenCalledWith(mockCredential.credential);
      });
    });

    it('handles Google login errors', async () => {
      renderLoginOverlay();
      const errorMessage = 'Google login failed';
      mockHandleGoogleLogin.mockRejectedValue(new Error(errorMessage));

      // Simulate failed Google OAuth
      global.google.accounts.oauth2.initTokenClient = jest.fn().mockImplementation(
        ({ error }) => ({
          requestAccessToken: () => error(new Error(errorMessage)),
        })
      );

      await waitFor(() => {
        expect(console.error).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    it('displays error message', () => {
      const errorMessage = 'Authentication failed';
      renderLoginOverlay({}, { error: errorMessage });
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('clears error on click', () => {
      const errorMessage = 'Authentication failed';
      renderLoginOverlay({}, { error: errorMessage });
      
      const errorElement = screen.getByText(errorMessage);
      fireEvent.click(errorElement);
      
      expect(mockClearError).toHaveBeenCalled();
    });
  });

  describe('Animation', () => {
    it('adds show class when visible', () => {
      renderLoginOverlay();
      const overlay = screen.getByTestId('login-overlay');
      expect(overlay).toHaveClass('show');
    });
  });
});
