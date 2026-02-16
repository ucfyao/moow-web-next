/** @jsxImportSource @emotion/react */
'use client';

import { css } from '@emotion/react';
import Link from 'next/link';
import { ReactNode } from 'react';

const containerStyle = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
`;

const iconStyle = css`
  margin-bottom: 16px;
  font-size: 48px;
  color: #ccc;
`;

const titleStyle = css`
  font-size: 18px;
  font-weight: bold;
  color: #363636;
  margin-bottom: 8px;
`;

const descriptionStyle = css`
  font-size: 14px;
  color: #7a7a7a;
  margin-bottom: 24px;
`;

const actionStyle = css`
  margin-top: 8px;
`;

interface EmptyStateProps {
  title: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
  icon?: ReactNode;
}

function EmptyState({ title, description, actionText, actionHref, icon }: EmptyStateProps) {
  return (
    <div css={containerStyle} data-testid="empty-state">
      {icon && <div css={iconStyle}>{icon}</div>}
      <h3 css={titleStyle}>{title}</h3>
      {description && <p css={descriptionStyle}>{description}</p>}
      {actionText && actionHref && (
        <div css={actionStyle}>
          <Link href={actionHref} className="button is-link">
            {actionText}
          </Link>
        </div>
      )}
    </div>
  );
}

export default EmptyState;
