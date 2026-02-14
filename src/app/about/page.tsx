/** @jsxImportSource @emotion/react */
'use client';

import { css } from '@emotion/react';
import { useTranslation } from 'react-i18next';

const aboutStyle = css`
  .about-container {
    max-width: 800px;
    margin: 2rem auto;
    padding: 2rem;
  }
  .about-container h1 {
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
  }
  .about-container h2 {
    font-size: 1.3rem;
    margin-top: 2rem;
    margin-bottom: 1rem;
  }
  .about-container p {
    line-height: 1.8;
    color: #555;
    margin-bottom: 1rem;
  }
`;

export default function AboutPage() {
  const { t } = useTranslation('');

  return (
    <div css={aboutStyle}>
      <div className="about-container box">
        <h1>{t('about_xiaobo')}</h1>
        <p>
          Moow is a cryptocurrency automated investment platform that helps users implement
          Dollar-Cost Averaging (DCA) and intelligent investment strategies across major crypto
          exchanges.
        </p>

        <h2>{t('about_xbt')}</h2>
        <p>
          XBT is the platform token that rewards users for participation. Earn XBT through
          registration, inviting friends, and purchasing membership plans.
        </p>
      </div>
    </div>
  );
}
