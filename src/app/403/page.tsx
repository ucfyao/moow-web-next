/** @jsxImportSource @emotion/react */
'use client';

import { css } from '@emotion/react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import '@/i18n';

const forbiddenStyle = css`
  .forbidden-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    text-align: center;
  }
  .forbidden-code {
    font-size: 6rem;
    font-weight: bold;
    color: #dbdbdb;
  }
  .forbidden-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #363636;
    margin-top: 0.5rem;
  }
  .forbidden-text {
    font-size: 1rem;
    color: #7a7a7a;
    margin: 1rem 0 2rem;
  }
`;

export default function ForbiddenPage() {
  const { t } = useTranslation();

  return (
    <div css={forbiddenStyle}>
      <div className="forbidden-container">
        <div className="forbidden-code">403</div>
        <p className="forbidden-title">{t('admin.access_denied')}</p>
        <p className="forbidden-text">{t('admin.access_denied_message')}</p>
        <Link href="/" className="button is-primary">
          {t('back_to_home')}
        </Link>
      </div>
    </div>
  );
}
