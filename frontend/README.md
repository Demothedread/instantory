# Bartleby Frontend Testing Guide

## Overview

This guide covers the testing infrastructure for the Bartleby application, including unit tests, integration tests, and end-to-end testing strategies.

## Test Structure

```
frontend/
├── src/
│   ├── __mocks__/              # Mock implementations
│   ├── test-utils/             # Testing utilities
│   ├── components/
│   │   └── __tests__/         # Component tests
│   └── contexts/
│       └── __tests__/         # Context tests
└── jest.config.js             # Jest configuration
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Run tests:
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- LoginOverlay.test.js
```

## Testing Utilities

### `test-utils/index.js`

Provides common testing utilities:
- Custom render function with providers
- Mock API responses
- Test data generators
- Form input helpers

Example usage:
```javascript
import { render, mockApiSuccess, createMockUser } from '../test-utils';

const mockUser = createMockUser();
mockApiSuccess({ user: mockUser });

const { getByText } = render(<YourComponent />);
```

## Authentication Testing

### LoginOverlay Component

Tests cover:
- Visibility states
- Email login flow
- Google OAuth integration
- Error handling
- Loading states
- Animation states

### AuthContext

Tests cover:
- Session management
- Token refresh mechanism
- Login/logout flows
- Error handling
- Local storage integration

## Writing Tests

### Component Tests

1. Create test file in `__tests__` directory
2. Import necessary utilities
3. Mock external dependencies
4. Write test cases using Jest and React Testing Library

Example:
```javascript
import { render, fireEvent } from '@testing-library/react';
import YourComponent from '../YourComponent';

describe('YourComponent', () => {
  it('renders correctly', () => {
    const { getByText } = render(<YourComponent />);
    expect(getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### Integration Tests

1. Focus on component interactions
2. Mock external services
3. Test complete user flows

Example:
```javascript
describe('Authentication Flow', () => {
  it('handles login and redirect', async () => {
    // Setup
    mockApiSuccess({ user: mockUser });
    
    // Render
    const { getByText, getByPlaceholderText } = render(<App />);
    
    // Interact
    fireEvent.change(getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.click(getByText('Login'));
    
    // Assert
    await waitFor(() => {
      expect(getByText('Welcome')).toBeInTheDocument();
    });
  });
});
```

## Deployment Testing

### Vercel Deployment

1. Environment Variables:
   - Ensure all required environment variables are set in Vercel dashboard
   - Test variables are properly loaded in the application

2. Build Process:
   ```bash
   # Test production build locally
   npm run build
   ```

3. CORS Configuration:
   - Verify CORS headers in `vercel.json`
   - Test API calls to backend endpoints

### Common Issues

1. Authentication Errors:
   - Check token refresh mechanism
   - Verify cookie settings
   - Confirm CORS configuration

2. Build Failures:
   - Review dependencies
   - Check environment variables
   - Verify import paths

3. Test Failures:
   - Check mock implementations
   - Verify async operations
   - Review test isolation

## Best Practices

1. Test Organization:
   - Group related tests
   - Use descriptive test names
   - Maintain test isolation

2. Mocking:
   - Mock external dependencies
   - Use realistic test data
   - Clean up mocks after tests

3. Assertions:
   - Test component behavior
   - Verify state changes
   - Check error handling

4. Performance:
   - Minimize test setup
   - Use appropriate matchers
   - Clean up resources

## Troubleshooting

### Common Test Failures

1. Async Operations:
   ```javascript
   // Wrong
   expect(element).toBeInTheDocument();
   
   // Correct
   await waitFor(() => {
     expect(element).toBeInTheDocument();
   });
   ```

2. Component Updates:
   ```javascript
   // Wrong
   fireEvent.click(button);
   expect(newState).toBeTruthy();
   
   // Correct
   act(() => {
     fireEvent.click(button);
   });
   expect(newState).toBeTruthy();
   ```

3. Context Updates:
   ```javascript
   // Wrong
   const { result } = renderHook(() => useContext(AuthContext));
   
   // Correct
   const { result } = renderHook(() => useContext(AuthContext), {
     wrapper: AuthProvider
   });
   ```

### Debug Strategies

1. Console Output:
   ```javascript
   test('debug component', () => {
     const { debug } = render(<Component />);
     debug(); // Prints DOM structure
   });
   ```

2. Test Environment:
   ```javascript
   beforeEach(() => {
     jest.spyOn(console, 'error').mockImplementation(() => {});
   });
   ```

3. Network Requests:
   ```javascript
   test('API calls', async () => {
     const mockApi = jest.spyOn(axios, 'get');
     // Test code
     expect(mockApi).toHaveBeenCalledWith(expectedUrl);
   });
   ```

## Maintenance

1. Regular Updates:
   - Keep dependencies updated
   - Review test coverage
   - Update mocks as needed

2. Documentation:
   - Document new test utilities
   - Update testing guidelines
   - Maintain troubleshooting guide

3. Code Review:
   - Review test coverage
   - Check test quality
   - Verify error handling

## Contributing

1. Adding Tests:
   - Follow existing patterns
   - Include documentation
   - Maintain test isolation

2. Updating Tests:
   - Review affected components
   - Update related tests
   - Verify coverage

3. Pull Requests:
   - Include test changes
   - Document updates
   - Review coverage reports
