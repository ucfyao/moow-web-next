/** @jsxImportSource @emotion/react */
'use client';

import { css } from '@emotion/react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

  return (
    <div css={notFoundStyle}>
      <div className="nf-container">
        <div className="nf-code">404</div>
        <p className="nf-text">{t('page_not_found')}</p>
        <Link href="/" className="button is-primary">
          {t('back_to_home')}
        </Link>
      </div>
    </div>
  );
}
