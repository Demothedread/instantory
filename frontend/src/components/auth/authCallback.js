import React, { useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { css } from '@emotion/react';
import { AuthContext } from '../../contexts/auth';
import { colors } from '../../styles/theme/colors';
import { neoDecorocoBase } from '../../styles/components/neo-decoroco/base';
import layout from '../../styles/layouts/constraints';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginWithGoogle } = useContext(AuthContext);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the credential from URL parameters or hash
        const credential = searchParams.get('credential');
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        
        if (credential) {
          // Handle Google OAuth credential
          await loginWithGoogle(credential);
          navigate('/dashboard');
        } else if (code) {
          // Handle OAuth authorization code flow
          console.log('OAuth code received:', code);
          // TODO: Exchange code for tokens with backend
          navigate('/dashboard');
        } else {
          // No valid parameters found
          console.error('No valid auth parameters found');
          navigate('/?error=auth_failed');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/?error=auth_failed');
      }
    };

    handleCallback();
  }, [searchParams, loginWithGoogle, navigate]);

  return (
    <div css={styles.container}>
      <div css={styles.content}>
        <div css={styles.spinner}>
          <div css={neoDecorocoBase.spinner} />
        </div>
        <h2 css={styles.title}>Completing Sign In...</h2>
        <p css={styles.message}>
          Please wait while we verify your authentication.
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: css`
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${colors.darkGradient};
    padding: ${layout.spacing.lg};
  `,

  content: css`
    text-align: center;
    max-width: 400px;
    width: 100%;
  `,

  spinner: css`
    margin-bottom: ${layout.spacing.xl};
    display: flex;
    justify-content: center;
  `,

  title: css`
    ${neoDecorocoBase.heading};
    font-size: 1.5rem;
    margin: 0 0 ${layout.spacing.md} 0;
  `,

  message: css`
    color: ${colors.textMuted};
    margin: 0;
    line-height: 1.5;
  `
};

export default AuthCallback;
