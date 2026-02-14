/** @jsxImportSource @emotion/react */
'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { css } from '@emotion/react';
import { useTranslation } from 'react-i18next';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import auth from '@/utils/auth';
import { getInvalidFields } from '@/utils/validator';
import useUserStore from '@/store/user';
import HTTP from '@/lib/http';

interface InvalidFields {
  code?: string;
  password?: string;
  passwordCheck?: string;
}

export default function ChangePasswordPage() {
  const { t } = useTranslation('');
  const router = useRouter();
  const setUserInfo = useUserStore((state) => state.setUserInfo);
  const [email, setEmail] = useState('');
  const [formData, setFormData] = useState({
    code: '',
    password: '',
    passwordCheck: '',
  });
  const [invalidFields, setInvalidFields] = useState<InvalidFields>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timerCounter, setTimerCounter] = useState(0);
  const [codeSending, setCodeSending] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/login');
      return;
    }
    const localUser = auth.getUser();
    if (!localUser?.email) {
      router.push('/login');
      return;
    }
    setEmail(localUser.email);
  }, [router]);

  useEffect(() => {
    if (timerCounter > 0) {
      const timer = setTimeout(() => {
        setTimerCounter(timerCounter - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [timerCounter]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const rules = () => ({
    code: [{ required: true, message: t('validator.code_required') }],
    password: [
      { required: true, message: t('validator.password_required') },
      { type: 'string' as const, min: 6, max: 32, message: t('validator.invalid_password') },
    ],
    passwordCheck: [
      { required: true, message: t('validator.confirm_password_required') },
      {
        validator: (_rule: any, value: string, callback: any) => {
          if (value !== formData.password) {
            callback(t('validator.password_dont_match'));
          } else {
            callback();
          }
        },
      },
    ],
  });

  const handleSendCode = async () => {
    if (timerCounter > 0 || codeSending) return;
    setCodeSending(true);
    try {
      await HTTP.post('/v1/auth/send-code', { email });
      setTimerCounter(60);
      setSnackbar({ open: true, message: t('prompt.code_sent'), severity: 'success' });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error?.message || t('prompt.error_occurs'),
        severity: 'error',
      });
    } finally {
      setCodeSending(false);
    }
  };

  const handleSubmit = async () => {
    const errors = await getInvalidFields(formData, rules());
    if (errors) {
      setInvalidFields(errors as InvalidFields);
      return;
    }
    setInvalidFields({});
    setIsSubmitting(true);

    try {
      await HTTP.post('/v1/auth/change-password', {
        code: formData.code,
        newPassword: formData.password,
      });
      setSnackbar({ open: true, message: t('prompt.password_changed'), severity: 'success' });
      setTimeout(() => {
        auth.logout();
        setUserInfo(null);
        router.push('/login');
      }, 2000);
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error?.message || t('prompt.operation_failed'),
        severity: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div css={changePasswordStyle}>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <section className="section">
        <div className="container form-container">
          <div className="card">
            <header className="card-header">
              <p className="card-header-title is-centered">{t('caption.change_password')}</p>
            </header>
            <div className="card-content">
              <div className="field">
                <label className="label">{t('profile.current_email')}</label>
                <div className="control">
                  <input className="input" type="text" value={email} disabled />
                </div>
              </div>

              <div className="field">
                <label className="label">{t('profile.verification_code')}</label>
                <div className="field has-addons">
                  <div className="control is-expanded">
                    <input
                      className="input"
                      type="text"
                      name="code"
                      placeholder={t('profile.verification_code')}
                      value={formData.code}
                      onChange={handleChange}
                      autoComplete="off"
                    />
                  </div>
                  <div className="control">
                    <button
                      className={`button is-info ${codeSending ? 'is-loading' : ''}`}
                      onClick={handleSendCode}
                      disabled={timerCounter > 0 || codeSending}
                    >
                      {timerCounter > 0
                        ? t('action.wait_timer_send', { timer: timerCounter })
                        : t('action.send_code')}
                    </button>
                  </div>
                </div>
                {invalidFields.code && <p className="help is-danger">{invalidFields.code}</p>}
              </div>

              <div className="field">
                <label className="label">{t('label.new_password')}</label>
                <div className="control">
                  <input
                    className="input"
                    type="password"
                    name="password"
                    placeholder={t('placeholder.password')}
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />
                </div>
                {invalidFields.password && (
                  <p className="help is-danger">{invalidFields.password}</p>
                )}
              </div>

              <div className="field">
                <label className="label">{t('label.confirm_password')}</label>
                <div className="control">
                  <input
                    className="input"
                    type="password"
                    name="passwordCheck"
                    placeholder={t('placeholder.repeat_password')}
                    value={formData.passwordCheck}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />
                </div>
                {invalidFields.passwordCheck && (
                  <p className="help is-danger">{invalidFields.passwordCheck}</p>
                )}
              </div>

              <div className="field" style={{ marginTop: '30px' }}>
                <p className="control">
                  <button
                    className={`button is-link is-fullwidth ${isSubmitting ? 'is-loading' : ''}`}
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {t('action.confirm')}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const changePasswordStyle = css`
  .form-container {
    max-width: 480px;
  }

  .card {
    margin-top: 20px;
  }
`;
