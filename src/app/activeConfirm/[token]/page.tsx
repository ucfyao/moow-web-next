/** @jsxImportSource @emotion/react */
"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { css } from '@emotion/react';
import { useRouter, useParams } from 'next/navigation';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';


const ActiveConfirm: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const token =  Array.isArray(params.token) ? params.token[0] : params.token;

  const [stateLabel, setStateLabel] = useState('');
  const [stateDescription, setStateDescription] = useState('');
  const [buttonUrl, setButtonUrl] = useState('/login');
  const [buttonText, setButtonText] = useState('Login Now');
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (token) {
      activateUser(token);
    }
  }, [token]);

  const activateUser = async (token: string) => {
    try {
      const response = await axios.patch('/api/v1/auth/verification', { token });
      setStateLabel('Account Activation Successful');
      setStateDescription('Congratulations, your account has been successfully activated. Enjoy your investments and achieve financial freedom soon.');
      setButtonUrl('/');
      setButtonText('Go back Homepage');
      setAlertMessage({ type: 'success', message: 'Account activation successful' });
      setOpen(true);
    } catch (error: any) {
      setStateLabel('Account Activation Failed');
      setStateDescription(error.message || 'Activation failed, please try again');
      setAlertMessage({ type: 'error', message: error.message || 'Activation failed, please try again' });
      setOpen(true);
      if (error.response?.status === 40006 || error.response?.status === 40007) {
        setButtonUrl('/activate');
        setButtonText('Go to Activation Email Page');
      }
    }
  };

  const handleButtonAction = () => {
    router.push(buttonUrl);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div css={activeConfirmStyle}>
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        {alertMessage ? (
          <Alert onClose={handleClose} severity={alertMessage.type}>
            {alertMessage.message}
          </Alert>
        ) : undefined}
      </Snackbar>
      <section className="section">
        <div className="container">
          <div className="box">
            <div className="header">
              <p className="is-size-6 is-pulled-left">{stateLabel}</p>
            </div>
            <div className="has-text-centered" style={{ padding: '50px' }}>
              <p>{stateDescription}</p>
              <p>.</p>
              <button className="button is-link" onClick={handleButtonAction}>
                {buttonText}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const activeConfirmStyle = css`
  .box {
    margin: 0 auto;
    max-width: 800px;
  }
`;

export default ActiveConfirm;
