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
        console.log("Auth callback processing with search params:", location.search);
        
        // Parse query parameters
        const params = new URLSearchParams(location.search);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const authSuccess = params.get('auth_success');
        const errorParam = params.get('error');
        const errorDetails = params.get('details');
        const redirectPath = params.get('redirect') || '/dashboard';
        
        // Handle error first
        if (errorParam) {
          const errorMessage = errorDetails 
            ? `${errorParam}: ${errorDetails}` 
            : errorParam;
          
          console.error(`Authentication error: ${errorMessage}`);
          setError(`Login failed: ${errorMessage}`);
          navigate('/login', { replace: true });
          return;
        }
        
        // Handle tokens from URL (Google OAuth flow)
        if (accessToken && refreshToken) {
          console.log("Tokens found in URL parameters");
          
          // Store tokens in local storage as fallback (they should already be in cookies)
          localStorage.setItem('auth_token', accessToken);
          
          // Verify the session to retrieve user data
          const sessionValid = await verifySession();
          
          if (sessionValid) {
            console.log("Session verification successful, redirecting to:", redirectPath);
            // Redirect to dashboard or the intended destination
            navigate(redirectPath, { replace: true });
          } else {
            console.error("Session verification failed even with tokens");
            navigate('/login?error=session_verification_failed', { replace: true });
          }
          return;
        }
        
        // If we just have auth_success flag, verify the session
        if (authSuccess === 'true') {
          console.log("Auth success flag found, verifying session");
          const sessionValid = await verifySession();
          
          if (sessionValid) {
            console.log("Session verification successful, redirecting to:", redirectPath);
            navigate(redirectPath, { replace: true });
          } else {
            console.error("Session verification failed with auth_success flag");
            navigate('/login?error=session_verification_failed', { replace: true });
          }
          return;
        }
        
        // If we have no tokens or auth_success flag, this might be an error
        console.error("No authentication data found in URL");
        navigate('/login?error=missing_authentication_data', { replace: true });
        
      } catch (err) {
        console.error("Error handling authentication callback:", err);
        setError(`Authentication error: ${err.message || 'Unknown error'}`);
        navigate('/login', { replace: true });
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