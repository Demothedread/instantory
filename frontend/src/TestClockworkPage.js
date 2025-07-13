import React from 'react';
import ClockworkLoadingPage from './components/loading/ClockworkLoadingPage';

/**
 * Test page to verify ClockworkLoadingPage component works
 */
const TestClockworkPage = () => {
  return (
    <div>
      <ClockworkLoadingPage 
        message="Testing Clockwork Loading Component..."
        progress={75}
        isVisible={true}
      />
    </div>
  );
};

export default TestClockworkPage;
