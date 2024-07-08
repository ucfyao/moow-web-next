/** @jsxImportSource @emotion/react */
import React from 'react';
import { css } from '@emotion/react';

const Tip: React.FC<{ content: React.ReactNode }> = ({ content }) => {
  return (
    <div css={poptipPopper}>
      <div className="poptip-content">
        <div css={poptipArrow}></div>
        <div css={poptipInner}>
          <div css={poptipBody}>
            <div className="poptip-body-content">
              {content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const poptipPopper = css`
  position: absolute;
  visibility: hidden;
  min-width: 150px;
  font-size: 12px;
  line-height: 1.5;
  z-index: 1060;
  padding: 5px 0 8px 0;
  position: absolute;
  will-change: top, left;
  top: 0;
  left: 50%;
  transform: translate(-50%, -100%);
  opacity: 0;
  z-index: 0;
`;

const poptipArrow = css`
  display: block;
  width: 0;
  height: 0;
  position: absolute;
  left: 50%;
  margin-left: -5px;
  bottom: 3px;
  border-width: 5px 5px 0;
  border-top-color: rgba(217, 217, 217, 0.5);
  border-color: transparent;
  border-style: solid;

  &:after {
    position: absolute;
    display: block;
    width: 0;
    height: 0;
    content: " ";
    top: -6px;
    bottom: 1px;
    margin-left: -5px;
    border-width: 5px;
    border-color: transparent;
    border-top-color: #fff;
    border-style: solid;
  }
`;

const poptipInner = css`
  width: 100%;
  background-color: #fff;
  background-clip: padding-box;
  border-radius: 4px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.2);
  white-space: nowrap;
`;

const poptipBody = css`
  padding: 8px 12px;
`;

export default Tip;
