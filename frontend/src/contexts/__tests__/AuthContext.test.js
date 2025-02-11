import React, { useContext } from 'react';
import { act, renderHook } from '@testing-library/react';

import AuthContext from '../AuthContext';
import { AuthProvider } from '../auth';
import axios from 'axios';

jest.mock('axios');
jest.useFakeTimers();

describe('AuthContext', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
  };

  const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    axios.get.mockReset();
    axios.post.mockReset();
  });

  describe('Initial State', () => {
    it('provides initial auth state', () => {
      const { result } = renderHook(() => useContext(AuthContext), { wrapper });
      
      expect(result.current).toEqual(expect.objectContaining({
        user: null,
        loading: true,
        error: null,
        handleLogin: expect.any(Function),
        handleGoogleLogin: expect.any(Function),
        handleLogout: expect.any(Function),
        refreshToken: expect.any(Function),
        clearError: expect.any(Function),
      }));
    });

    it('loads user from localStorage', () => {
      localStorage.setItem('auth_session', JSON.stringify(mockUser));
      
      const { result } = renderHook(() => useContext(AuthContext), { wrapper });
      
      expect(result.current.user).toEqual(mockUser);
    });
  });

  describe('Session Verification', () => {
    it('verifies session on mount', async () => {
      axios.get.mockResolvedValueOnce({ data: { user: mockUser } });
      
      const { result, waitForNextUpdate } = renderHook(
        () => useContext(AuthContext),
        { wrapper }
      );
      
      await waitForNextUpdate();
      
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/session'),
        expect.any(Object)
      );
      expect(result.current.user).toEqual(mockUser);
    });

    it('handles session verification failure', async () => {
      const error = new Error('Session invalid');
      axios.get.mockRejectedValueOnce(error);
      
      const { result, waitForNextUpdate } = renderHook(
        () => useContext(AuthContext),
        { wrapper }
      );
      
      await waitForNextUpdate();
      
      expect(result.current.user).toBeNull();
      expect(result.current.error).toBeTruthy();
    });
  });

  describe('Token Refresh', () => {
    it('refreshes token periodically', async () => {
      axios.post.mockResolvedValueOnce({ data: { user: mockUser } });
      
      const { result, waitForNextUpdate } = renderHook(
        () => useContext(AuthContext),
        { wrapper }
      );
      
      await waitForNextUpdate();
      
      // Fast-forward 14 minutes
      await act(async () => {
        jest.advanceTimersByTime(14 * 60 * 1000);
      });
      
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/refresh'),
        {},
        expect.any(Object)
      );
    });

    it('handles refresh token failure', async () => {
      const error = new Error('Refresh failed');
      axios.post.mockRejectedValueOnce(error);
      
      const { result, waitForNextUpdate } = renderHook(
        () => useContext(AuthContext),
        { wrapper }
      );
      
      await waitForNextUpdate();
      
      // Fast-forward 14 minutes
      await act(async () => {
        jest.advanceTimersByTime(14 * 60 * 1000);
      });
      
      expect(result.current.error).toBeTruthy();
    });
  });

  describe('Login/Logout', () => {
    it('handles email login', async () => {
      axios.post.mockResolvedValueOnce({ data: { user: mockUser } });
      
      const { result, waitForNextUpdate } = renderHook(
        () => useContext(AuthContext),
        { wrapper }
      );
      
      await act(async () => {
        await result.current.handleLogin({ email: mockUser.email });
      });
      
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/login'),
        { email: mockUser.email },
        expect.any(Object)
      );
      expect(result.current.user).toEqual(mockUser);
    });

    it('handles Google login', async () => {
      const credential = 'mock-google-credential';
      axios.post.mockResolvedValueOnce({ data: { user: mockUser } });
      
      const { result, waitForNextUpdate } = renderHook(
        () => useContext(AuthContext),
        { wrapper }
      );
      
      await act(async () => {
        await result.current.handleGoogleLogin(credential);
      });
      
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/google'),
        { credential },
        expect.any(Object)
      );
      expect(result.current.user).toEqual(mockUser);
    });

    it('handles logout', async () => {
      axios.post.mockResolvedValueOnce({});
      
      const { result, waitForNextUpdate } = renderHook(
        () => useContext(AuthContext),
        { wrapper }
      );
      
      // Set initial user state
      act(() => {
        localStorage.setItem('auth_session', JSON.stringify(mockUser));
      });
      
      await act(async () => {
        await result.current.handleLogout();
      });
      
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/logout'),
        {},
        expect.any(Object)
      );
      expect(result.current.user).toBeNull();
      expect(localStorage.getItem('auth_session')).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('clears error state', () => {
      const { result } = renderHook(() => useContext(AuthContext), { wrapper });
      
      act(() => {
        // Set error state
        result.current.clearError();
      });
      
      expect(result.current.error).toBeNull();
    });

    it('handles API errors', async () => {
      const error = new Error('API Error');
      axios.post.mockRejectedValueOnce(error);
      
      const { result, waitForNextUpdate } = renderHook(
        () => useContext(AuthContext),
        { wrapper }
      );
      
      await act(async () => {
        await result.current.handleLogin({ email: mockUser.email });
      });
      
      expect(result.current.error).toBeTruthy();
      expect(result.current.user).toBeNull();
    });
  });
});
