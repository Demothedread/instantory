import { css } from '@emotion/react';

const styles = {
  container: css`
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    min-height: 600px;
    background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.1);
    position: relative;
    overflow: hidden;

    /* Art deco pattern overlay */
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, 
        #00ff9d 0%,
        #00b8ff 50%,
        #00ff9d 100%
      );
      box-shadow: 0 0 20px rgba(0, 255, 157, 0.5);
    }
  `,

  title: css`
    color: #ffffff;
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 20px;
    text-align: center;
    font-family: 'Metropolis', sans-serif;
    letter-spacing: 1px;
    text-shadow: 0 0 10px rgba(0, 255, 157, 0.5);

    /* Art deco decorative elements */
    &::before,
    &::after {
      content: '✧';
      margin: 0 10px;
      color: #00ff9d;
    }
  `,

  viewerContainer: css`
    flex: 1;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    padding: 10px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    position: relative;
    overflow: hidden;

    /* Rococo-inspired corner flourishes */
    &::before,
    &::after {
      content: '';
      position: absolute;
      width: 40px;
      height: 40px;
      background-image: url('/assets/borders/corner-flourish.png');
      background-size: contain;
      background-repeat: no-repeat;
      opacity: 0.3;
    }

    &::before {
      top: 10px;
      left: 10px;
      transform: rotate(0deg);
    }

    &::after {
      bottom: 10px;
      right: 10px;
      transform: rotate(180deg);
    }
  `,

  viewer: css`
    width: 100%;
    height: 100%;
    border: none;
    background: white;
    border-radius: 4px;
  `,

  loadingSpinner: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #00ff9d;

    .spinner {
      width: 50px;
      height: 50px;
      border: 3px solid rgba(0, 255, 157, 0.3);
      border-radius: 50%;
      border-top-color: #00ff9d;
      animation: spin 1s ease-in-out infinite;
      margin-bottom: 15px;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    p {
      font-family: 'Metropolis', sans-serif;
      font-size: 16px;
      color: #ffffff;
      text-shadow: 0 0 10px rgba(0, 255, 157, 0.5);
    }
  `,

  error: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #ff4d4d;
    text-align: center;
    padding: 20px;

    p {
      font-family: 'Metropolis', sans-serif;
      font-size: 16px;
      margin-bottom: 20px;
      color: #ffffff;
    }
  `,

  retryButton: css`
    background: linear-gradient(135deg, #00ff9d 0%, #00b8ff 100%);
    border: none;
    border-radius: 25px;
    padding: 10px 30px;
    color: #1a1a1a;
    font-family: 'Metropolis', sans-serif;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 1px;
    box-shadow: 0 4px 15px rgba(0, 255, 157, 0.3);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 255, 157, 0.4);
    }

    &:active {
      transform: translateY(0);
      box-shadow: 0 2px 10px rgba(0, 255, 157, 0.3);
    }
  `
};

export default styles;
