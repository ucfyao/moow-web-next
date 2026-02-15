/** @jsxImportSource @emotion/react */
'use client';

import { css, keyframes } from '@emotion/react';

const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

const baseStyle = css`
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200px 100%;
  animation: ${shimmer} 1.5s infinite;
  border-radius: 4px;
`;

const circleStyle = css`
  border-radius: 50%;
`;

interface SkeletonProps {
  variant?: 'text' | 'rect' | 'circle';
  width?: string | number;
  height?: string | number;
  count?: number;
}

function Skeleton({ variant = 'text', width, height, count = 1 }: SkeletonProps) {
  const resolvedWidth = typeof width === 'number' ? `${width}px` : width;
  const resolvedHeight = typeof height === 'number' ? `${height}px` : height;

  if (variant === 'text') {
    const items = Array.from({ length: count }, (_, i) => i);
    return (
      <div data-testid="skeleton" role="status" aria-label="Loading">
        {items.map((i) => (
          <div
            key={i}
            css={baseStyle}
            style={{
              width: resolvedWidth || '100%',
              height: resolvedHeight || '1em',
              marginBottom: count > 1 && i < count - 1 ? '8px' : undefined,
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'circle') {
    const size = resolvedWidth || resolvedHeight || '40px';
    return (
      <div
        data-testid="skeleton"
        role="status"
        aria-label="Loading"
        css={[baseStyle, circleStyle]}
        style={{ width: size, height: size }}
      />
    );
  }

  // rect
  return (
    <div
      data-testid="skeleton"
      role="status"
      aria-label="Loading"
      css={baseStyle}
      style={{
        width: resolvedWidth || '100%',
        height: resolvedHeight || '100px',
      }}
    />
  );
}

export default Skeleton;
