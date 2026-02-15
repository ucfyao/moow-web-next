/** @jsxImportSource @emotion/react */
'use client';

import { useState, useEffect, useMemo, ChangeEvent } from 'react';
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

function getPasswordStrength(password: string): number {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  return Math.min(score, 4);
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
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordCheck, setShowPasswordCheck] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const passwordStrength = useMemo(() => getPasswordStrength(formData.password), [formData.password]);

  const strengthLabels = [
    '',
    t('profile.strength_weak'),
    t('profile.strength_fair'),
    t('profile.strength_good'),
    t('profile.strength_strong'),
  ];
  const strengthColors = ['', '#ff4d4f', '#faad14', '#52c41a', '#1890ff'];

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
                  <input id="change-email" className="input" type="text" value={email} disabled aria-label={t('profile.current_email')} />
                </div>
              </div>

              <div className="field">
                <label className="label">{t('profile.verification_code')}</label>
                <div className="field has-addons">
                  <div className="control is-expanded">
                    <input
                      id="change-code"
                      className="input"
                      type="text"
                      name="code"
                      placeholder={t('profile.verification_code')}
                      aria-label={t('profile.verification_code')}
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
                {invalidFields.code && <p className="help is-danger" role="alert" aria-live="polite">{invalidFields.code}</p>}
              </div>

              <div className="field">
                <label className="label">{t('label.new_password')}</label>
                <div className="control has-icons-right">
                  <input
                    id="change-password"
                    className="input"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder={t('placeholder.password')}
                    aria-label={t('placeholder.password')}
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />
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
                {formData.password && (
                  <div className="password-strength">
                    <div className="strength-bars">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className="strength-bar"
                          style={{
                            backgroundColor:
                              level <= passwordStrength ? strengthColors[passwordStrength] : '#e8e8e8',
                          }}
                        />
                      ))}
                    </div>
                    <span
                      className="strength-label"
                      style={{ color: strengthColors[passwordStrength] }}
                    >
                      {strengthLabels[passwordStrength]}
                    </span>
                  </div>
                )}
                {invalidFields.password && (
                  <p className="help is-danger" role="alert" aria-live="polite">{invalidFields.password}</p>
                )}
              </div>

              <div className="field">
                <label className="label">{t('label.confirm_password')}</label>
                <div className="control has-icons-right">
                  <input
                    id="change-password-check"
                    className="input"
                    type={showPasswordCheck ? 'text' : 'password'}
                    name="passwordCheck"
                    placeholder={t('placeholder.repeat_password')}
                    aria-label={t('placeholder.repeat_password')}
                    value={formData.passwordCheck}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />
                  <span
                    className="icon is-small is-right"
                    style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                    onClick={() => setShowPasswordCheck(!showPasswordCheck)}
                    role="button"
                    tabIndex={0}
                    aria-label={showPasswordCheck ? '隐藏密码' : '显示密码'}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowPasswordCheck(!showPasswordCheck); } }}
                  >
                    <i className={`fa ${showPasswordCheck ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                  </span>
                </div>
                {invalidFields.passwordCheck && (
                  <p className="help is-danger" role="alert" aria-live="polite">{invalidFields.passwordCheck}</p>
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

  .password-strength {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 8px;
  }

  .strength-bars {
    display: flex;
    gap: 4px;
    flex: 1;
  }

  .strength-bar {
    height: 4px;
    flex: 1;
    border-radius: 2px;
    transition: background-color 0.3s;
  }

  .strength-label {
    font-size: 0.75rem;
    white-space: nowrap;
  }
`;
