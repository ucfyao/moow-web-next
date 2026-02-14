'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';
import '../styles/forgetPassword.css';
import HTTP from '@/lib/http';
import { getInvalidFields } from '@/utils/validator';

interface InvalidFields {
  email?: { message: string }[];
  captcha?: { message: string }[];
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

  const handleForgetPassword = async () => {
    const invalidFields = await getInvalidFields(formData, rules());
    if (invalidFields) {
      setInvalidFields(invalidFields);
      return;
    }
    setIsProccessing(true);
    try {
      let response = await HTTP.post('/v1/auth/passwordRecovery', formData);
      setIsProccessing(false);
      setMailSent(true);
    } catch (error) {
      console.error(error);
      setIsProccessing(false);
    }
  };

  return (
    <section className="section">
      <div className="container">
        <div className="box">
          <div className="header">
            <p className="is-size-6 is-pulled-left margin-right: 10px;">
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
                    className="input"
                    type="email"
                    value={formData.email}
                    placeholder={t('placeholder.email')}
                  />
                  <span className="icon is-small is-left">
                    <i className="fa fa-envelope"></i>
                  </span>
                </div>
                {invalidFields.email && <p className="help is-danger"></p>}
              </div>
              <div className="field">
                <div className="field-body">
                  <div className="field is-grouped">
                    <p className="control is-expanded">
                      <input
                        className="input"
                        type="text"
                        value={formData.captcha}
                        placeholder={t('placeholder.captcha')}
                      />
                    </p>
                    <div className="control">
                      <Image
                        className="captcha"
                        src={captchaSrc}
                        alt={t('prompt.click_refresh_captcha')}
                        title={t('prompt.click_refresh_captcha')}
                        onClick={updateCaptcha}
                        width={150}
                        height={50}
                      />
                    </div>
                  </div>
                </div>
                {invalidFields.captcha && <p className="help is-danger"></p>}
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

export default ForgetPassword;
