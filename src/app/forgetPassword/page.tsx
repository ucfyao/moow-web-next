/** @jsxImportSource @emotion/react */
'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';
import { css } from '@emotion/react';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';
import HTTP from '@/lib/http';
import { getInvalidFields, validateField } from '@/utils/validator';

interface InvalidFields {
  email?: string;
  captcha?: string;
}

const ForgetPassword = () => {
  const { t } = useTranslation('');
  const [captchaSrc, setCaptchaSrc] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    captcha: '',
  });
  const rules = () => ({
    email: [
      { required: true, message: 'validator.account_required' },
      { type: 'email', message: 'validator.invalid_email' },
    ],
    captcha: [{ required: true, message: 'validator.captcha_required' }],
  });
  const [invalidFields, setInvalidFields] = useState<InvalidFields>({});
  const [mailSent, setMailSent] = useState(false);
  const [isProccessing, setIsProccessing] = useState(false);

  useEffect(() => {
    updateCaptcha();
  }, []);

  const updateCaptcha = () => {
    setCaptchaSrc('/api/v1/captcha?' + Math.random());
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (invalidFields[name as keyof InvalidFields]) {
      setInvalidFields((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const error = await validateField(name, value, rules());
    setInvalidFields((prev) => ({ ...prev, [name]: error || undefined }));
  };

  const handleForgetPassword = async () => {
    const errors = await getInvalidFields(formData, rules());
    if (errors) {
      setInvalidFields(errors);
      return;
    }
    setIsProccessing(true);
    try {
      await HTTP.post('/v1/auth/passwordRecovery', formData);
      setIsProccessing(false);
      setMailSent(true);
    } catch (error) {
      console.error(error);
      setIsProccessing(false);
    }
  };

  return (
    <section className="section" css={pageStyle}>
      <div className="container">
        <div className="box">
          <div className="header">
            <p className="is-size-6 is-pulled-left" style={{ marginRight: '10px' }}>
              {t('caption.retrieve_password')}
            </p>
          </div>

          {mailSent ? (
            <div className="notification is-primary">{t('prompt.reset_mail_sent')}</div>
          ) : (
            <div className="box-body">
              <div className="field">
                <label className="label">
                  <span className="has-text-danger">*</span>
                  {t('label.retrieve_password')}
                </label>
                <div className="control has-icons-left">
                  <input
                    id="forget-email"
                    className={`input ${invalidFields.email ? 'is-danger' : ''}`}
                    type="email"
                    name="email"
                    value={formData.email}
                    placeholder={t('placeholder.email')}
                    aria-label={t('placeholder.email')}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  <span className="icon is-small is-left">
                    <i className="fa fa-envelope"></i>
                  </span>
                </div>
                {invalidFields.email && (
                  <p className="help is-danger" role="alert" aria-live="polite">
                    {invalidFields.email}
                  </p>
                )}
              </div>
              <div className="field">
                <div className="field-body">
                  <div className="field is-grouped">
                    <p className="control is-expanded">
                      <input
                        id="forget-captcha"
                        className={`input ${invalidFields.captcha ? 'is-danger' : ''}`}
                        type="text"
                        name="captcha"
                        value={formData.captcha}
                        placeholder={t('placeholder.captcha')}
                        aria-label={t('placeholder.captcha')}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                    </p>
                    <div className="control">
                      <Image
                        className="captcha"
                        src={captchaSrc}
                        alt="验证码，点击刷新"
                        title={t('prompt.click_refresh_captcha')}
                        role="button"
                        tabIndex={0}
                        onClick={updateCaptcha}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            updateCaptcha();
                          }
                        }}
                        width={150}
                        height={50}
                        style={{ cursor: 'pointer' }}
                      />
                    </div>
                  </div>
                </div>
                {invalidFields.captcha && (
                  <p className="help is-danger" role="alert" aria-live="polite">
                    {invalidFields.captcha}
                  </p>
                )}
              </div>
              <div className="field is-grouped">
                <div className="control">
                  <button
                    className={`button is-link is-fullwidth is-focused ${isProccessing ? 'is-loading' : ''}`}
                    onClick={handleForgetPassword}
                    disabled={isProccessing}
                  >
                    {t('action.confirm')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

const pageStyle = css`
  .box {
    padding-bottom: 50px;
    max-width: 800px;
    margin: 0 auto;
  }

  .box-body {
    margin: 0 auto;
    max-width: 500px;
  }
`;

export default ForgetPassword;
