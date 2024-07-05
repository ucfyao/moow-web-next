import React from 'react';
import './Tip.css';

const Tip: React.FC<{ content: React.ReactNode }> = ({ content }) => {
  return (
    <div className="poptip-popper">
      <div className="poptip-content">
        <div className="poptip-arrow"></div>
        <div className="poptip-inner">
          <div className="poptip-body">
            <div className="poptip-body-content">
              {content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tip;