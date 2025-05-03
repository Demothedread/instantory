import { useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { AuthContext } from '../../contexts/auth';

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, setAuthenticated } = useContext(AuthContext);
  
  useEffect(() => {
    // Parse query parameters
    const params = new URLSearchParams(location.search);
    const authParam = params.get('auth');
    const errorParam = params.get('auth_error');
    
    if (errorParam) {
      console.error(`Authentication error: ${errorParam}`);
      navigate('/login?error=' + errorParam);
      return;
    }
    
    if (authParam) {
      try {
        // Parse the authentication info
        const authInfo = JSON.parse(decodeURIComponent(authParam));
        
        // Update auth context
        setUser({
          id: authInfo.userId,
          email: authInfo.email,
          isAdmin: authInfo.isAdmin
        });
        setAuthenticated(true);
        
        // Redirect to dashboard or home
        navigate('/dashboard');
      } catch (err) {
        console.error('Error processing authentication callback:', err);
        navigate('/login?error=invalid_response');
      }
    } else {
      navigate('/login?error=no_auth_data');
    }
  }, [location.search, navigate, setUser, setAuthenticated]);
  
  return (
    <div className="auth-callback">
      <p>Completing authentication, please wait...</p>
    </div>
  );
};

export default AuthCallback;