/** @jsxImportSource @emotion/react */
'use client';

import React, { useState, useEffect, ChangeEvent, Suspense } from 'react';
import { css } from '@emotion/react';
import axios from 'axios';
import auth from '../../utils/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import {getInvalidFields} from '../../utils/validator';
import { useTranslation } from 'react-i18next';
import useUserStore from "../../store/user";
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

interface InvalidFields {
  email?: string;
  password?: string;
  captcha?: string;
}

const Login = () => {
  const { t, i18n } = useTranslation('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const [captchaSrc, setCaptchaSrc] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    captcha: '',
  });
  const [invalidFields, setInvalidFields] = useState<InvalidFields>({});
  const [isLogging, setIsLogging] = useState(false);
  const { setUserInfo } = useUserStore((state: any) => state);
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [open, setOpen] = useState(false);
  
  //handle text input
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  //input rules
  const rules = () => ({
    email: [
      { required: true, message: ('validator.account_required') },
      { type: 'email', message: ('validator.invalid_email') },
    ],
    password: [
      { required: true, message: ('validator.password_required') },
      { type: 'string', min: 6, max: 32, message: ('validator.invalid_password') },
    ],
    captcha: [
      { required: true, message: ('validator.captcha_required') },
    ],
  });

  // handle Captcha picture
  const updateCaptcha = async () => {
    const response = await axios.get('/api/v1/captcha');
    setCaptchaSrc(response.data);
  };

  useEffect(() => {
    updateCaptcha();
  }, []);

  // handle Login button
  const handleLogin = async () => {
    const invalidFields = await getInvalidFields(formData, rules())
    if (invalidFields) {
      setInvalidFields(invalidFields);
      return;
    }
    setIsLogging(true);
    try {
        const response = await axios.post('/api/v1/auth/login', formData);
        const userData = response.data || null;
        if (auth.login(userData)) {
          setUserInfo(auth.getUser());
          router.push(redirect || '/');
        } else {
          setAlertMessage({ type: 'error', message: 'Login failed, server returned incorrect data.' });
          setOpen(true);
        }
        setIsLogging(false);
      } catch (error: any) {
        console.log('Error:',error)
        const errorMessage = error.response?.data?.message || t('prompt.error_occurs') ;
        setAlertMessage({ type: 'error', message: errorMessage });
        setOpen(true);
        setIsLogging(false);
      }
    };
    const handleClose = () => {
      setOpen(false);
    };

  return (
    <div css={loginStyle}>
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
      <section className='section home'>
        <div className='container login-wrap'>
          <div className='columns'>
            <div className='column has-text-white-bis is-hidden-mobile pt-200'>
            </div>
            <div className='column'>
              <div className='card '>
                <header className='card-header'>
                  <p className='card-header-title is-centered'>
                  {t('sign_in')}
                  </p>
                </header>
                <div className = 'card-content'>
                  <div className = 'field'>
                    <div className = 'control has-icons-left has-icons-right'>
                      <input
                        className='input'
                        type = 'email'
                        name='email'
                        placeholder = {t('placeholder.email')}
                        value = {formData.email}
                        onChange = {handleChange}
                      />
                      <span className = 'icon is-small is-left'>
                        <i className = 'fa fa-envelope'></i>
                      </span>
                    </div>
                    {invalidFields.email && <p className='help is-danger'></p>}
                  </div>
                  <div className = 'field'>
                    <div className = 'control has-icons-left'>
                      <input
                        className='input'
                        type='password'
                        name='password'
                        placeholder = {t('placeholder.password')}
                        value = {formData.password}
                        onChange = {handleChange}
                      />
                      <span className = 'icon is-small is-left'>
                        <i className = 'fa fa-lock'></i>
                      </span>
                    </div>
                    {invalidFields.password && <p className='help is-danger'></p>}
                  </div>
                  <div className = 'field'>
                    <div className = 'field is-grouped'>
                      <p className = 'control is-expanded'>
                        <input
                          className='input'
                          type='text'
                          name='captcha'
                          placeholder={t('placeholder.captcha')}
                          value={formData.captcha}
                          onChange = {handleChange}
                        />
                      </p>
                      <div className ='control' dangerouslySetInnerHTML={{ __html: captchaSrc }}
                        title={'prompt.click_refresh_captcha'}
                        onClick={updateCaptcha}
                      />
                    </div>
                    {invalidFields.captcha && <p className='help is-danger'></p>}
                  </div>
                  <div className='field' style={{ marginTop: '30px' }}>
                    <p className='control'>
                      <button
                        className={`button is-link is-fullwidth is-focused ${isLogging ? 'is-loading' : ''}`}
                        onClick={handleLogin}
                        disabled={isLogging}>
                        {t('sign_in')}
                      </button>
                    </p>
                  </div>
                  <div className='field'>
                    <div className='control forget-password'>
                      <a href='/forgetPassword'>{t('forget_password')}</a>
                    </div>
                  </div>
                </div>
                <footer className='card-footer'>
                  <p className='card-footer-item'>
                  {t('have_not_registered')}
                    <a href='/signup'>{t('sign_up_now')}</a>
                  </p>
                </footer>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className='section feature'>
        <nav className='columns'>
          <div className='column has-text-centered'>
            <div>
              <p className='title is-4'>
                <strong>Multiple Strategies</strong>
              </p>
              <p className='subtitle is-6'>Ordinary price investment, intelligent value investment, etc.</p>
            </div>
          </div>
          <div className='column has-text-centered'>
            <div>
              <p className='title is-4'>
                <strong>Strict Risk Control</strong>
              </p>
              <p className='subtitle is-6'>Secure storage and strict operation flow</p>
            </div>
          </div>
          <div className='column has-text-centered'>
            <div>
              <p className='title is-4'>
                <strong>Transparent Transactions</strong>
              </p>
              <p className='subtitle is-6'>One-click hosting, transparent API transactions</p>
            </div>
          </div>
          <div className='column has-text-centered'>
            <div>
              <p className='title is-4'>
                <strong>Open Data</strong>
              </p>
              <p className='subtitle is-6'>Multidimensional and intuitive visualization of investment data</p>
            </div>
          </div>
        </nav>
      </section>
    </div>
  );
};
const loginStyle = css`
  .home {
    background: url(../../assets/images/login_bg.jpg) center center no-repeat;
    background-color: #2a3c5e;
  }
  .login-wrap {
  height: 600px;
  -webkit-background-size: auto 100%;
  background-size: auto 100%;
  }

  .pt-200 {
  padding-top: 200px;
  }
  .card {
  margin: 60px auto 0;
  width: 350px;
  }

  .card-footer {
  background-color: #F7F7F7;
  border-top: none;
  }

  .feature {
  padding: 5rem;
  }

  .forget-password{
  text-align: right;
  font-size: 12px;
  }

  .card-footer-item{
  font-size: 12px;
  }
  @media screen and (max-width: 768px) {
    .card {
      /*margin-top: 50px;*/
    }
  }
`;

export default function LoginPage() {
  return (
    <Suspense>
      <Login />
    </Suspense>
  );
}
