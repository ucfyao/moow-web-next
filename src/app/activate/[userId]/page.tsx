/** @jsxImportSource @emotion/react */
"use client";

import React, { useState, useEffect, Suspense } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { css } from '@emotion/react';
import { useParams, useSearchParams } from 'next/navigation';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

const Activate: React.FC = () => {
  const { t } = useTranslation();
  const { userId } = useParams(); 
  const searchParams = useSearchParams(); 
  const email = searchParams.get('email'); 
  const [timerCounter, setTimerCounter] = useState(0);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [open, setOpen] = useState(false);

  const buttonText = timerCounter > 0
  ? `Wait ${timerCounter} seconds to resend`
  : 'Resend activation email';

  const sendActivateEmail = async () => {
    setTimerCounter(60); 
    setButtonDisabled(true); 
    try {
      await axios.post('/api/v1/auth/activation', { email });
      setAlertMessage({ type: 'success', message: t('prompt.email_has_sent') });
      setOpen(true);
    } catch (error: any) {
      setAlertMessage({ type: 'error', message: error.message || t('prompt.error_occurs') });
    }
  };
  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    if (timerCounter > 0) {
      const timer = setTimeout(() => {
        setTimerCounter(timerCounter - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      setButtonDisabled(false);
    }
  }, [timerCounter]);
  

  return (
    <div css={activateStyle}>
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
              <p className="is-size-6 is-pulled-left">{t('caption.account_not_active')}</p>
            </div>
            <div className="has-text-centered" >
              <p>{t('prompt.account_not_active')}</p>
              <p>.</p>
              <button className="button is-link" onClick={sendActivateEmail} disabled={buttonDisabled}>
                {buttonText}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const activateStyle = css`
  .box {
    margin: 0 auto;
    max-width: 800px;
  }
`;

export default function ActivatePage() {
  return (
    <Suspense>
      <Activate />
    </Suspense>
  );
}