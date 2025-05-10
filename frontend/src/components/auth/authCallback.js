import { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/auth';

/**
 * Handles authentication callback after OAuth flow
 * Processes tokens from URL and manages session verification
 */
const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifySession, setError } = useContext(AuthContext);
  const [isProcessing, setIsProcessing] = useState(true);
  
  useEffect(() => {
    const handleCallback = async () => {
      setIsProcessing(true);
      try {
        // Parse query parameters
        const params = new URLSearchParams(location.search);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const authSuccess = params.get('auth_success');
        const errorParam = params.get('error');
        const redirectPath = params.get('redirect') || '/dashboard';
        
        // Handle error first
        if (errorParam) {
          console.error(`Authentication error: ${errorParam}`);
          setError(`Login failed: ${errorParam}`);
          navigate('/login', { replace: true });
          return;
        }
        
        // Handle tokens from URL (Google OAuth flow)
        if (accessToken && refreshToken) {
          // Store tokens in local storage as fallback (they should already be in cookies)
          localStorage.setItem('auth_token', accessToken);
          
          // Verify the session to retrieve user data
          const sessionValid = await verifySession();
          
          if (sessionValid) {
            // Redirect to dashboard or the intended destination
            navigate(redirectPath, { replace: true });
          } else {
            navigate('/login?error=session_verification_failed', { replace: true });
          }
          return;
        }
        
        // If we just have auth_success flag, verify the session
        if (authSuccess === 'true') {
          const sessionValid = await verifySession();
          if (sessionValid) {
            navigate(redirectPath, { replace: true });
          } else {
            navigate('/login?error=session_invalid', { replace: true });
          }
          return;
        }
        
        // Default fallback - no recognized auth parameters
        console.error('No valid authentication parameters found');
        navigate('/login?error=no_auth_data', { replace: true });
      } catch (err) {
        console.error('Auth callback processing error:', err);
        setError('Authentication process failed. Please try again.');
        navigate('/login?error=auth_process_failed', { replace: true });
      } finally {
        setIsProcessing(false);
      }
    };
    
    handleCallback();
  }, [location.search, navigate, verifySession, setError]);
  
  return (
    <div className="auth-callback">
      <div className="auth-loading">
        {isProcessing && <p>Completing authentication, please wait...</p>}
      </div>
    </div>
  );
};

export default AuthCallback;