/** @jsxImportSource @emotion/react */
'use client';

import React, { useState, useEffect, ChangeEvent, Suspense } from 'react';
import { css } from '@emotion/react';
import axios from 'axios';
import auth from '../../utils/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { getInvalidFields, validateField } from '../../utils/validator';
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
  const [showPassword, setShowPassword] = useState(false);
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
    if (invalidFields[name as keyof InvalidFields]) {
      setInvalidFields((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const error = await validateField(name, value, rules());
    setInvalidFields((prev) => ({ ...prev, [name]: error || undefined }));
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
    try {
      const response = await axios.get('/api/v1/captcha');
      if (typeof response.data === 'string' && response.data.startsWith('<svg')) {
        setCaptchaSrc(response.data);
      }
    } catch {
      // API not available, ignore
    }
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
          setAlertMessage({ type: 'error', message: t('prompt.login_failed') });
          setOpen(true);
        }
        setIsLogging(false);
      } catch (error: any) {
        console.error('Login failed:', error)
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
                        id="login-email"
                        className={`input ${invalidFields.email ? 'is-danger' : ''}`}
                        type = 'email'
                        name='email'
                        placeholder = {t('placeholder.email')}
                        aria-label={t('placeholder.email')}
                        value = {formData.email}
                        onChange = {handleChange}
                        onBlur={handleBlur}
                      />
                      <span className = 'icon is-small is-left'>
                        <i className = 'fa fa-envelope'></i>
                      </span>
                    </div>
                    {invalidFields.email && <p className='help is-danger' role="alert" aria-live="polite">{invalidFields.email}</p>}
                  </div>
                  <div className = 'field'>
                    <div className = 'control has-icons-left has-icons-right'>
                      <input
                        id="login-password"
                        className={`input ${invalidFields.password ? 'is-danger' : ''}`}
                        type={showPassword ? 'text' : 'password'}
                        name='password'
                        placeholder = {t('placeholder.password')}
                        aria-label={t('placeholder.password')}
                        value = {formData.password}
                        onChange = {handleChange}
                        onBlur={handleBlur}
                      />
                      <span className = 'icon is-small is-left'>
                        <i className = 'fa fa-lock'></i>
                      </span>
                      <span
                        className="icon is-small is-right"
                        style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                        onClick={() => setShowPassword(!showPassword)}
                        role="button"
                        tabIndex={0}
                        aria-label={showPassword ? '隐藏密码' : '显示密码'}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowPassword(!showPassword); } }}
                      >
                        <i className={`fa ${showPassword ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                      </span>
                    </div>
                    {invalidFields.password && <p className='help is-danger' role="alert" aria-live="polite">{invalidFields.password}</p>}
                  </div>
                  <div className = 'field'>
                    <div className = 'field is-grouped'>
                      <p className = 'control is-expanded'>
                        <input
                          id="login-captcha"
                          className={`input ${invalidFields.captcha ? 'is-danger' : ''}`}
                          type='text'
                          name='captcha'
                          placeholder={t('placeholder.captcha')}
                          aria-label={t('placeholder.captcha')}
                          value={formData.captcha}
                          onChange = {handleChange}
                          onBlur={handleBlur}
                        />
                      </p>
                      {/* eslint-disable-next-line react/no-danger -- SVG captcha from our own API */}
                      <div className='control' style={{ cursor: 'pointer' }} dangerouslySetInnerHTML={{ __html: captchaSrc }}
                        title={t('prompt.click_refresh_captcha')}
                        aria-label="验证码，点击刷新"
                        role="button"
                        tabIndex={0}
                        onClick={updateCaptcha}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); updateCaptcha(); } }}
                      />
                    </div>
                    {invalidFields.captcha && <p className='help is-danger' role="alert" aria-live="polite">{invalidFields.captcha}</p>}
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
                <strong>{t('feature.multiple_strategies')}</strong>
              </p>
              <p className='subtitle is-6'>{t('feature.multiple_strategies_desc')}</p>
            </div>
          </div>
          <div className='column has-text-centered'>
            <div>
              <p className='title is-4'>
                <strong>{t('feature.risk_control')}</strong>
              </p>
              <p className='subtitle is-6'>{t('feature.risk_control_desc')}</p>
            </div>
          </div>
          <div className='column has-text-centered'>
            <div>
              <p className='title is-4'>
                <strong>{t('feature.transparent')}</strong>
              </p>
              <p className='subtitle is-6'>{t('feature.transparent_desc')}</p>
            </div>
          </div>
          <div className='column has-text-centered'>
            <div>
              <p className='title is-4'>
                <strong>{t('feature.open_data')}</strong>
              </p>
              <p className='subtitle is-6'>{t('feature.open_data_desc')}</p>
            </div>
          </div>
        </nav>
      </section>
    </div>
  );
};
const loginStyle = css`
  flex: 1;
  display: flex;
  flex-direction: column;

  .home {
    background: url(../../assets/images/login_bg.jpg) center center no-repeat;
    background-color: #2a3c5e;
    background-size: cover;
    padding-top: 0;
    padding-bottom: 0;
    flex: 1;
  }

  .login-wrap {
  }

  .pt-200 {
    padding-top: 200px;
  }

  .card {
    margin: 60px auto 0;
    width: 350px;
  }

  .card-footer {
    background-color: #f7f7f7;
    border-top: none;
  }

  .feature {
    padding: 1rem 3rem;
  }

  .forget-password {
    text-align: right;
    font-size: 12px;
  }

  .card-footer-item {
    font-size: 12px;
  }

  @media screen and (max-height: 900px) {
    .pt-200 {
      padding-top: 80px;
    }
    .card {
      margin-top: 20px;
    }
  }

  @media screen and (max-width: 768px) {
    .card {
      margin-top: 30px;
      width: 90%;
    }
    .feature {
      padding: 1rem 1rem;
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
