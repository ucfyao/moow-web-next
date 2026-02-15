/** @jsxImportSource @emotion/react */
'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { css } from '@emotion/react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import auth from '@/utils/auth';
import { getInvalidFields } from '@/utils/validator';
import useUserStore from '@/store/user';
import HTTP from '@/lib/http';

interface UserProfile {
  _id: string;
  email: string;
  nick_name: string;
  vip_time_out_at: string;
  is_activated: boolean;
  created_at: string;
}

interface InvalidFields {
  nick_name?: string;
}

export default function ProfilePage() {
  const { t } = useTranslation('');
  const router = useRouter();
  const setUserInfo = useUserStore((state) => state.setUserInfo);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [nickName, setNickName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [invalidFields, setInvalidFields] = useState<InvalidFields>({});
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
    if (!localUser?._id) {
      router.push('/login');
      return;
    }

    async function fetchUser() {
      try {
        const res = await HTTP.get(`/v1/users/${localUser._id}`);
        const userData = res.data;
        setUser(userData);
        setNickName(userData.nick_name || '');
      } catch (error: any) {
        setSnackbar({
          open: true,
          message: error?.message || t('prompt.error_occurs'),
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [router, t]);

  const rules = () => ({
    nick_name: [
      { required: true, message: t('validator.cant_empty') },
      {
        type: 'string' as const,
        min: 2,
        max: 30,
        pattern: /^[\w\u4e00-\u9fa5]+$/,
        message: t('validator.invalid_nickname'),
      },
    ],
  });

  const handleSave = async () => {
    const formData = { nick_name: nickName };
    const errors = await getInvalidFields(formData, rules());
    if (errors) {
      setInvalidFields(errors as InvalidFields);
      return;
    }
    setInvalidFields({});
    setSaving(true);

    try {
      await HTTP.patch(`/v1/users/${user!._id}`, { nick_name: nickName });
      setSnackbar({ open: true, message: t('profile.save_success'), severity: 'success' });
      const updatedUser = auth.getUser();
      if (updatedUser) {
        updatedUser.nick_name = nickName;
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUserInfo({ email: updatedUser.email, name: nickName });
      }
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error?.message || t('prompt.operation_failed'),
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    if (!window.confirm(t('prompt.confirm_logout'))) return;
    try {
      await HTTP.post('/api/v1/auth/logout');
    } catch {
      // ignore logout API errors
    }
    auth.logout();
    setUserInfo(null);
    router.push('/');
  };

  const isVipActive = user?.vip_time_out_at
    ? new Date(user.vip_time_out_at) > new Date()
    : false;

  if (loading) {
    return (
      <div css={profileStyle} className="container">
        <section className="section">
          <div className="box has-text-centered">
            <p>{t('prompt.loading')}</p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div css={profileStyle} className="container">
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
        <div className="box">
          <h2 className="title is-5">{t('profile.page_title')}</h2>

          <div className="field">
            <label className="label">{t('profile.email')}</label>
            <div className="control">
              <input className="input" type="text" value={user?.email || ''} disabled />
            </div>
          </div>

          <div className="field">
            <label className="label">{t('assets.vip_status')}</label>
            <div className="control">
              <span className={`tag ${isVipActive ? 'is-success' : 'is-danger'}`}>
                {isVipActive ? t('assets.vip_active') : t('assets.vip_expired')}
              </span>
              {user?.vip_time_out_at && (
                <span className="vip-expiry">
                  {t('assets.vip_expiry')}: {format(new Date(user.vip_time_out_at), 'yyyy/MM/dd')}
                </span>
              )}
            </div>
          </div>

          {user?.created_at && (
            <div className="field">
              <label className="label">{t('profile.registration_date')}</label>
              <div className="control">
                <input
                  className="input"
                  type="text"
                  value={format(new Date(user.created_at), 'yyyy/MM/dd')}
                  disabled
                />
              </div>
            </div>
          )}

          <div className="field">
            <label className="label">{t('profile.nickname')}</label>
            <div className="control">
              <input
                className="input"
                type="text"
                value={nickName}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setNickName(e.target.value)}
              />
            </div>
            {invalidFields.nick_name && (
              <p className="help is-danger">{invalidFields.nick_name}</p>
            )}
          </div>

          <div className="field is-grouped action-buttons">
            <div className="control">
              <button
                className={`button is-link ${saving ? 'is-loading' : ''}`}
                onClick={handleSave}
                disabled={saving}
              >
                {t('profile.save')}
              </button>
            </div>
            <div className="control">
              <Link href="/ucenter/changePassword" className="button is-warning">
                {t('profile.change_password')}
              </Link>
            </div>
            <div className="control">
              <button className="button is-danger is-outlined" onClick={handleLogout}>
                {t('profile.logout')}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const profileStyle = css`
  &.container {
    margin-top: 40px;
    margin-bottom: 60px;
    max-width: 800px;
  }

  .title.is-5 {
    margin-bottom: 1.25rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid #f0f0f0;
  }

  .field {
    margin-bottom: 1.25rem;
  }

  .vip-expiry {
    margin-left: 12px;
    font-size: 0.85rem;
    color: #7a7a7a;
  }

  .action-buttons {
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid #f0f0f0;
  }
`;
