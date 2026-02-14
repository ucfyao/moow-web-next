/** @jsxImportSource @emotion/react */
'use client';

import { css } from '@emotion/react';
import Link from 'next/link';

const notFoundStyle = css`
  .nf-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    text-align: center;
  }
  .nf-code {
    font-size: 6rem;
    font-weight: bold;
    color: #dbdbdb;
  }
  .nf-text {
    font-size: 1.2rem;
    color: #7a7a7a;
    margin: 1rem 0 2rem;
  }
`;

export default function NotFound() {
  return (
    <div css={notFoundStyle}>
      <div className="nf-container">
        <div className="nf-code">404</div>
        <p className="nf-text">Page not found</p>
        <Link href="/" className="button is-primary">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
