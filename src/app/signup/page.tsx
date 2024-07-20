/** @jsxImportSource @emotion/react */
'use client';

import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import axios from 'axios';
import { getInvalidFields } from '../../utils/validator';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'next-i18next';
import auth from '../../utils/auth';
import { css } from '@emotion/react';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

interface InvalidFields {
  name?: { message: string }[];
  email?: { message: string }[];
  password?: { message: string }[];
  confirmPassword?: { message: string }[];
  captcha?: { message: string }[];
  refCode?: { message: string }[];
}

const SignUp = () => {
  const { t, i18n } = useTranslation('');
  const router = useRouter();
  const [captchaSrc, setCaptchaSrc] = useState('');
  const [invalidFields, setInvalidFields] = useState<InvalidFields>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [open, setOpen] = useState(false);

  //data initialization
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    captcha: '',
    refCode: '',
  });

  //handle text input
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  //confirm password
  const validatePass = (rule: any, value: string, callback: any) => {
    if (!value) {
      callback(t('validator.password_required'));
    } else if (formData.confirmPassword) {
      validatePassCheck(null, formData.confirmPassword, callback);
    } else {
      callback();
    }
  };
  const validatePassCheck = (rule: any, value: string, callback: any) => {
    if (!value) {
      callback(t('validator.confirm_password_required'));
    } else if (value !== formData.password) {
      callback(t('validator.password_dont_match'));
    } else {
      callback();
    }
  };

  //input rules
  const rules = () => ({
    email: [
      { required: true, message: t('validator.account_required') },
      { type: 'email', message: t('validator.invalid_email') },
    ],
    password: [
      { required: true, message: t('validator.password_required') },
      { validator: validatePass },
    ],
    confirmPassword: [{ validator: validatePassCheck }],
    captcha: [{ required: true, message: t('validator.captcha_required') }],
    refCode: [{ required: false, message: t('validator.ref_required') }],
  });

  // handle Captcha picture
  const updateCaptcha = async () => {
    const response = await axios.get('/api/v1/captcha?');
    setCaptchaSrc(response.data);
  };

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const refCode = query.get('ref_code');
    if (refCode) {
      setFormData((prevData) => ({ ...prevData, refCode }));
    }
    updateCaptcha();
  }, []);

  useEffect(() => {
    const initialLocale = auth.getLocale();
    i18n.changeLanguage(initialLocale);
  }, [i18n.language]);

  // handle signUp button
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const invalidFields = await getInvalidFields(formData, rules());
    if (invalidFields) {
      setInvalidFields(invalidFields);
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await axios.post('/api/v1/auth/signup', formData);
      setIsSubmitting(false);
      const data = response.data.data;
      const userId = data?._id;
      const email = data?.email;
      setAlertMessage({ type: 'success', message: 'Successful registration, quick activation.' });
      setOpen(true);
      setTimeout(() => {
        router.push(`/activate/${userId}?email=${encodeURIComponent(email)}`);
      }, 2000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message ;
      setAlertMessage({ type: 'error', message: errorMessage });
      setOpen(true);
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };
  
  return (
    <div css={signUpStyle}>
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
      <section className="section home">
        <div className="container login-wrap">
          <div className="columns">
            <div className="column has-text-white-bis is-hidden-mobile pt-200"></div>
            <div className="column">
              <div className="card ">
                <header className="card-header">
                  <p className="card-header-title is-centered">{t('sign_up')}</p>
                </header>
                <div className="card-content">
                  <div className="field">
                    <div className="control has-icons-left has-icons-right">
                      <input
                        className="input"
                        type="text"
                        placeholder={t('placeholder.name')}
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        autoComplete="name"
                      />
                      <span className="icon is-small is-left">
                        <i className="fa fa-user"></i>
                      </span>
                    </div>
                    {invalidFields.name && <p className="help is-danger">{(invalidFields.name)}</p>}
                  </div>
                  <div className="field">
                    <div className="control has-icons-left has-icons-right">
                      <input
                        className="input"
                        type="email"
                        placeholder={t('placeholder.email')}
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        autoComplete="email"
                      />
                      <span className="icon is-small is-left">
                        <i className="fa fa-envelope"></i>
                      </span>
                    </div>
                    {invalidFields.email && <p className="help is-danger">{(invalidFields.email)}</p>}
                  </div>
                  <div className="field">
                    <div className="control has-icons-left">
                      <input
                        className="input"
                        type="password"
                        placeholder={t('placeholder.password')}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        autoComplete="new-password"
                      />
                      <span className="icon is-small is-left">
                        <i className="fa fa-lock"></i>
                      </span>
                    </div>
                    {invalidFields.password && (
                      <p className="help is-danger">{(invalidFields.password)}</p>
                    )}
                  </div>
                  <div className="field">
                    <div className="control has-icons-left">
                      <input
                        className="input"
                        type="password"
                        placeholder={t('placeholder.repeat_password')}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        autoComplete="new-password"
                      />
                      <span className="icon is-small is-left">
                        <i className="fa fa-lock"></i>
                      </span>
                    </div>
                    {invalidFields.confirmPassword && (
                      <p className="help is-danger">{(invalidFields.confirmPassword)}</p>
                    )}
                  </div>
                  <div className="field">
                    <div className="control has-icons-left">
                      <input
                        className="input"
                        type="text"
                        placeholder={t('placeholder.invitation_code')}
                        name="refCode"
                        value={formData.refCode}
                        onChange={handleChange}
                        autoComplete="off"
                      />
                      <span className="icon is-small is-left">
                        <i className="fa fa-envelope-open"></i>
                      </span>
                    </div>
                    {invalidFields.refCode && (
                      <p className="help is-danger">{(invalidFields.refCode)}</p>
                    )}
                  </div>
                  <div className="field">
                    <div className="field is-grouped">
                      <p className="control is-expanded">
                        <input
                          className="input"
                          type="text"
                          placeholder={t('placeholder.captcha')}
                          name="captcha"
                          value={formData.captcha}
                          onChange={handleChange}
                          autoComplete="off"
                        />
                      </p>
                      <div
                        className="control"
                        dangerouslySetInnerHTML={{ __html: captchaSrc }}
                        title={t('prompt.click_refresh_captcha')}
                        onClick={updateCaptcha}
                      />
                    </div>
                    {invalidFields.captcha && (
                      <p className="help is-danger">{(invalidFields.captcha)}</p>
                    )}
                  </div>
                  <div className="field" style={{ marginTop: '30px' }}>
                    <p className="control">
                      <button
                        className={`button is-link is-fullwidth is-focused ${isSubmitting ? 'is-loading' : ''}`}
                        onClick={handleSignUp}
                        disabled={isSubmitting}>
                        {t('sign_up')}
                      </button>
                    </p>
                  </div>
                </div>
                <footer className="card-footer">
                  <p className="card-footer-item">
                    {t('have_registered')}
                    <a href="/login">{t('sign_in')}</a>
                  </p>
                </footer>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="section feature">
        <nav className="columns">
          <div className="column has-text-centered">
            <div>
              <p className="title is-4">
                <strong>Multiple Strategies</strong>
              </p>
              <p className="subtitle is-6">
                Ordinary price investment, intelligent value investment, etc.
              </p>
            </div>
          </div>
          <div className="column has-text-centered">
            <div>
              <p className="title is-4">
                <strong>Strict Risk Control</strong>
              </p>
              <p className="subtitle is-6">Secure storage and strict operation flow</p>
            </div>
          </div>
          <div className="column has-text-centered">
            <div>
              <p className="title is-4">
                <strong>Transparent Transactions</strong>
              </p>
              <p className="subtitle is-6">One-click hosting, transparent API transactions</p>
            </div>
          </div>
          <div className="column has-text-centered">
            <div>
              <p className="title is-4">
                <strong>Open Data</strong>
              </p>
              <p className="subtitle is-6">
                Multidimensional and intuitive visualization of investment data
              </p>
            </div>
          </div>
        </nav>
      </section>
    </div>
  );
};

const signUpStyle = css`
  .home {
    background: url(/assets/images/login_bg.jpg) center center no-repeat;
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
    background-color: #f7f7f7;
    border-top: none;
  }

  .feature {
    padding: 5rem;
  }

  .forget-password {
    text-align: right;
    font-size: 12px;
  }

  .card-footer-item {
    font-size: 12px;
  }
  @media screen and (max-width: 768px) {
    .card {
      /*margin-top: 50px;*/
    }
  }
`;

export default SignUp;