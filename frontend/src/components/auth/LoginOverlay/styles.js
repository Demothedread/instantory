import { css } from '@emotion/react';

export const styles = {
    overlay: css`
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        backdrop-filter: blur(6px);
    `,
    panel: css`
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
        padding: 2rem;
        text-align: center;
        width: 100%;
        max-width: 400px;
    `,
    title: css`
        margin-bottom: 1rem;
        font-size: 1.5rem;
        font-weight: bold;
    `,
    errorMessage: css`
        color: red;
        margin-bottom: 1rem;
        cursor: pointer;
    `,
    loginOptions: css`
        display: flex;
        flex-direction: column;
        gap: 1rem;
    `,
    googleLoginWrapper: css`
        display: flex;
        justify-content: center;
    `,
    divider: css`
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin: 1rem 0;
    `,
    dividerLine: css`
        flex: 1;
        height: 1px;
        background-color: #ccc;
    `,
    dividerText: css`
        color: #666;
        font-size: 0.9rem;
    `,
    emailForm: css`
        display: flex;
        flex-direction: column;
        gap: 1rem;
    `,
    emailInput: css`
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 4px;
    `,
    emailLoginButton: css`
        padding: 0.75rem;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        &:hover {
            background-color: #0056b3;
        }
        &:disabled {
            background-color: #aaa;
            cursor: not-allowed;
        }
    `,
    loading: css`
        background-color: #aaa;
    `,
    footer: css`
        margin-top: 1rem;
        font-size: 0.85rem;
        color: #555;
    `,
    footerText: css`
        font-weight: 500;
    `,
};