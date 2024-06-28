import React from 'react';
import './alert.css';

interface AlertProps {
  message: string;
  onClose: () => void;
}

const Alert: React.FC<AlertProps> = ({ message, onClose }) => {
  return (
    <div className="alert">
      <div className="box">
        <h2>Alert</h2>
        <p>{message}</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default Alert;