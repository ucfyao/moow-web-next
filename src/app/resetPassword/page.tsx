/** @jsxImportSource @emotion/react */
'use client';

import React, { useState, ChangeEvent, Suspense } from 'react';
import { css } from '@emotion/react';
import { useTranslation } from 'react-i18next';
import { useRouter, useSearchParams } from 'next/navigation';
import HTTP from '@/lib/http';
import { getInvalidFields, validateField } from '@/utils/validator';

interface InvalidFields {
  password?: string;
  passwordCheck?: string;
}

const ResetPassword = () => {
  const { t } = useTranslation('');
  const searchParams = useSearchParams();
  const router = useRouter();
  const [formData, setFormData] = useState({
    password: '',
    passwordCheck: '',
  });
  const [invalidFields, setInvalidFields] = useState<InvalidFields>({});
  const [isProccessing, setIsProccessing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordCheck, setShowPasswordCheck] = useState(false);

  const validatePass = (rule: any, value: string) => {
    if (value === '') {
      return Promise.reject(new Error('validator.password_required'));
    }
    return Promise.resolve();
  };

  const validatePassCheck = (rule: any, value: string) => {
    if (value === '') {
      return Promise.reject(new Error('validator.confirm_password_required'));
    } else if (value !== formData.password) {
      return Promise.reject(new Error('validator.password_dont_match'));
    }
    return Promise.resolve();
  };

  const rules = () => ({
    password: [
      { required: true, message: 'validator.password_required' },
      { validator: validatePass, trigger: 'blur' },
    ],
    passwordCheck: [{ validator: validatePassCheck, trigger: 'blur' }],
  });

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

  const handleResetPassword = async () => {
    const token = searchParams.get('token');
    const errors = await getInvalidFields(formData, rules());
    if (errors) {
      setInvalidFields(errors);
      return;
    }
    setIsProccessing(true);
    try {
      await HTTP.patch('/v1/auth/passwordReset', {
        token,
        password: formData.password,
      });
      setIsProccessing(false);
      window.alert(t('prompt.password_is_reset'));
      router.push('/login');
    } catch (error) {
      window.alert(t('prompt.error_occurs'));
      setIsProccessing(false);
    }
  };

  return (
    <div css={pageStyle}>
      <section className="section">
        <div className="container">
          <div className="box">
            <div className="header">
              <p className="is-size-6 is-pulled-left" style={{ marginRight: '10px' }}>
                {t('caption.reset_password')}
              </p>
            </div>
            <div className="field">
              <label className="label">
                <span className="has-text-danger">*</span>
                {t('label.input')}
                {t('label.new_password')}
              </label>
              <div className="control has-icons-left has-icons-right">
                <input
                  id="reset-password"
                  className={`input ${invalidFields.password ? 'is-danger' : ''}`}
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  placeholder={t('placeholder.password')}
                  aria-label={t('placeholder.password')}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <span className="icon is-small is-left">
                  <i className="fa fa-lock"></i>
                </span>
                <span
                  className="icon is-small is-right"
                  style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                  onClick={() => setShowPassword(!showPassword)}
                  role="button"
                  tabIndex={0}
                  aria-label={showPassword ? '隐藏密码' : '显示密码'}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setShowPassword(!showPassword);
                    }
                  }}
                >
                  <i className={`fa ${showPassword ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                </span>
              </div>
              {invalidFields.password && (
                <p className="help is-danger" role="alert" aria-live="polite">
                  {invalidFields.password}
                </p>
              )}
            </div>
            <div className="field">
              <label className="label">
                <span className="has-text-danger">*</span>
                {t('label.input')}
                {t('label.confirm_password')}
              </label>
              <div className="control has-icons-left has-icons-right">
                <input
                  id="reset-password-check"
                  className={`input ${invalidFields.passwordCheck ? 'is-danger' : ''}`}
                  type={showPasswordCheck ? 'text' : 'password'}
                  name="passwordCheck"
                  value={formData.passwordCheck}
                  placeholder={t('placeholder.repeat_password')}
                  aria-label={t('placeholder.repeat_password')}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <span className="icon is-small is-left">
                  <i className="fa fa-lock"></i>
                </span>
                <span
                  className="icon is-small is-right"
                  style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                  onClick={() => setShowPasswordCheck(!showPasswordCheck)}
                  role="button"
                  tabIndex={0}
                  aria-label={showPasswordCheck ? '隐藏密码' : '显示密码'}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setShowPasswordCheck(!showPasswordCheck);
                    }
                  }}
                >
                  <i className={`fa ${showPasswordCheck ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                </span>
              </div>
              {invalidFields.passwordCheck && (
                <p className="help is-danger" role="alert" aria-live="polite">
                  {invalidFields.passwordCheck}
                </p>
              )}
            </div>
            <div className="field is-grouped">
              <div className="control">
                <button
                  className={`button is-link is-fullwidth is-focused ${isProccessing ? 'is-loading' : ''}`}
                  onClick={handleResetPassword}
                  disabled={isProccessing}
                >
                  {t('action.confirm')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const pageStyle = css`
  .box {
    padding-bottom: 50px;
    max-width: 800px;
    margin: 0 auto;
  }

  .input {
    max-width: 500px;
  }
`;

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPassword />
    </Suspense>
  );
}
