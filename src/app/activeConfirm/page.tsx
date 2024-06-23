"use client";

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import '../styles/activeConfirm.css';
import { setUserActivated } from '../../store';


const ActivateConfirm: React.FC = () => {
  const [stateLabel, setStateLabel] = useState<string>('');
  const [stateDescription, setStateDescription] = useState<string>('');
  const [buttonUrl, setButtonUrl] = useState<string>('/login');
  const [buttonText, setButtonText] = useState<string>('Login Now');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();

  useEffect(() => {
    activateUser();
  }, []);
  const activateUser = async () => {
    if (isAuthenticated && user && user.isActivated) {
      setStateLabel('Account is already activated');
      setStateDescription('Your account is already activated, no need to activate again');
      setButtonUrl('/');
      setButtonText('Go to Home');
      return;
    }
    try {
      const response = await axios.post('/pub/auth/activate', { token });
      console.log(response);
      setStateLabel('Account activated successfully');
      setStateDescription('Congratulations, your account has been successfully activated. Enjoy your investments and achieve financial freedom soon.');
      if (isAuthenticated) {
        dispatch(setUserActivated());
        setButtonUrl('/');
        setButtonText('Go to Home');
      }
    } catch (error) {
      const e = error as AxiosError;
      setStateLabel('Account activation failed');
      setStateDescription(e.message);
      // Activation code expired
      if (e.response && (e.response.status === 40006 || e.response.status === 40007)) {
        if (isAuthenticated) {
          setButtonUrl('/activate');
          setButtonText('Go to Activation Email Page');
        }
      }
    }
  };

  const handleButtonAction = () => {
    navigate(buttonUrl);
  };

  return (
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
  );
  };
  
  export default ActivateConfirm;
