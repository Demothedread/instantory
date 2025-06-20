import { render } from '@testing-library/react';
import { AuthProvider } from '../contexts/auth/index';

// Mock axios
jest.mock('axios');

// Custom render with providers
const customRender = (ui, { providerProps = {}, ...renderOptions } = {}) => {
  const Wrapper = ({ children }) => (
    <AuthProvider {...providerProps}>{children}</AuthProvider>
  );
  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Mock successful API response
const mockApiSuccess = (data) => {
  axios.mockResolvedValueOnce({ data });
};

// Mock API error
const mockApiError = (error) => {
  axios.mockRejectedValueOnce(error);
};

// Create mock user data
const createMockUser = (overrides = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  ...overrides,
});

// Create mock auth context value
const createMockAuthContext = (overrides = {}) => ({
  user: null,
  loading: false,
  error: null,
  handleLogin: jest.fn(),
  handleGoogleLogin: jest.fn(),
  handleLogout: jest.fn(),
  refreshToken: jest.fn(),
  clearError: jest.fn(),
  ...overrides,
});

// Wait for async operations
const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

// Mock Google OAuth response
const createMockGoogleResponse = (overrides = {}) => ({
  credential: 'mock-google-credential',
  ...overrides,
});

// Helper to simulate form input
const fillFormInput = (input, value) => {
  input.value = value;
  input.dispatchEvent(new Event('change', { bubbles: true }));
};

export {
    createMockAuthContext, createMockGoogleResponse, createMockUser, fillFormInput, mockApiError, mockApiSuccess, customRender as render, waitForAsync
};

// Re-export everything from @testing-library/react
    export * from '@testing-library/react';

