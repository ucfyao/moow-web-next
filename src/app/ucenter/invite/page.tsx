/** @jsxImportSource @emotion/react */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { format } from 'date-fns';
import { css } from '@emotion/react';
import Image from 'next/image';
import { QRCodeCanvas } from 'qrcode.react';
import { useTranslation } from 'react-i18next';
import auth from '@/utils/auth';
import Skeleton from '@/components/Skeleton';
import no_record from '@/assets/images/no_record.png';

const invitePageStyle = css`
  &.container {
    margin-top: 40px;
    margin-bottom: 60px;
    max-width: 1344px;
  }

  .section + .section {
    padding-top: 0;
  }

  .title.is-5 {
    margin-bottom: 1.25rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid #f0f0f0;
  }

  .promo-text {
    font-size: 0.9rem;
    line-height: 1.8;
    margin-bottom: 1.5rem;
    color: #4a4a4a;
  }

  .promo-text .col-red {
    color: #ff3860;
    font-weight: 600;
    font-size: 1rem;
  }

  .invite-link-section {
    margin-bottom: 1.5rem;
  }

  .invite-link-section p {
    margin-bottom: 0.5rem;
    font-weight: 500;
  }

  .invite-link-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .invite-link-row input {
    max-width: 30rem;
    font-size: 0.85rem;
    flex: 1;
  }

  .invite-code-display {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .invite-code-display .code {
    font-size: 1.25rem;
    font-weight: 700;
    color: #3273dc;
    letter-spacing: 2px;
  }

  .stats-row {
    font-size: 0.9rem;
    margin-bottom: 1.5rem;
    color: #4a4a4a;
  }

  .stats-row .col-red {
    color: #ff3860;
    font-weight: 600;
  }

  .table-wrapper {
    overflow-x: auto;
  }

  .table {
    min-width: 500px;
    font-size: 0.85rem;
  }

  thead,
  th {
    background-color: #fafafa;
    color: #4f6475;
    font-weight: 400;
    text-align: center;
  }

  td {
    vertical-align: middle;
    text-align: center;
  }

  .no-record {
    width: 61px;
    margin: 60px auto;
    display: block;
  }

  .qr-section {
    display: flex;
    align-items: flex-start;
    gap: 2rem;
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid #f0f0f0;
  }

  .qr-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .qr-info p {
    font-size: 0.8rem;
    color: #7a7a7a;
  }

  .toast {
    position: fixed;
    top: 80px;
    left: 50%;
    transform: translateX(-50%);
    background: #363636;
    color: #fff;
    padding: 8px 20px;
    border-radius: 4px;
    font-size: 0.85rem;
    z-index: 100;
    animation: fadeInOut 2s ease-in-out;
  }

  @keyframes fadeInOut {
    0% {
      opacity: 0;
    }
    15% {
      opacity: 1;
    }
    85% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }
`;

const posterOverlayStyle = css`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  z-index: 200;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;

  img {
    max-width: 375px;
    max-height: 70vh;
    border-radius: 8px;
  }

  .poster-actions {
    margin-top: 1.5rem;
    display: flex;
    gap: 1rem;
  }
`;

const posterContentStyle = css`
  width: 375px;
  height: 645px;
  padding-top: 90px;
  background: #438dec;
  text-align: center;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'PingFang SC',
    'Microsoft YaHei', sans-serif;
  position: absolute;
  left: -9999px;
  top: 0;

  .poster-logo {
    position: absolute;
    top: 20px;
    left: 20px;
    font-size: 20px;
    font-weight: 700;
    color: #fff;
  }

  .poster-slogan {
    position: absolute;
    top: 27px;
    right: 20px;
    font-size: 17px;
    color: #fff;
  }

  .poster-title {
    line-height: 43px;
    font-size: 35px;
    color: #fff0a2;
    font-weight: 800;
    margin-bottom: 5px;
  }

  .poster-describe {
    line-height: 35px;
    font-size: 23px;
    color: #fff;
  }

  .poster-describe b {
    font-weight: 700;
  }

  .poster-card {
    width: 355px;
    height: 420px;
    margin: 30px auto 0;
    border-radius: 12px;
    overflow: hidden;
    background: #fff;
  }

  .card-top {
    height: 330px;
    padding-top: 25px;
  }

  .card-top .card-header-text {
    font-size: 16px;
    color: #048ef2;
    text-align: center;
    line-height: 30px;
  }

  .qr-box {
    padding-top: 20px;
    text-align: center;
  }

  .qr-box p {
    font-size: 15px;
    color: #000;
    line-height: 40px;
  }

  .card-bottom {
    height: 95px;
    padding: 10px;
    background-color: #e5f3fe;
    text-align: center;
  }

  .card-bottom-label {
    color: #aac8e2;
    font-size: 0.85rem;
    margin-bottom: 4px;
  }

  .card-bottom-code {
    font-size: 24px;
    font-weight: 700;
    color: #006299;
    line-height: 45px;
  }
`;

interface Invitation {
  _id: string;
  email: string;
  created_at: string;
}

function desensitizeEmail(email: string): string {
  const atIndex = email.indexOf('@');
  if (atIndex <= 3) return email;
  return email.substring(0, 3) + '***' + email.substring(atIndex);
}

export default function InvitePage() {
  const { t } = useTranslation('');
  const router = useRouter();
  const posterRef = useRef<HTMLDivElement>(null);

  const [inviteCode, setInviteCode] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [inviteReward, setInviteReward] = useState('0');
  const [inviteTotal, setInviteTotal] = useState('0');
  const [inviteList, setInviteList] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState('');
  const [posterImg, setPosterImg] = useState<string | null>(null);
  const [showPoster, setShowPoster] = useState(false);
  const [posterLoading, setPosterLoading] = useState(false);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2000);
  }, []);

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

    const userId = localUser.seq_id || localUser._id;

    async function fetchData() {
      try {
        const token = auth.getToken();
        const headers: Record<string, string> = {};
        if (token) headers.token = token;
        if (localUser._id) headers.user_id = localUser._id;

        const [userRes, invitationsRes] = await Promise.all([
          axios.get(`/api/v1/users/${userId}`, { headers }),
          axios.get(`/api/v1/users/${userId}`, {
            headers,
            params: { invitations: true },
          }),
        ]);

        const userData = userRes.data?.data;
        if (userData) {
          const code = userData.invitation_code || '';
          setInviteCode(code);
          setInviteReward(userData.invite_reward || '0');
          setInviteTotal(userData.invite_total || '0');

          if (code) {
            const origin = window.location.origin;
            setInviteLink(`${origin}/signup?ref_code=${code}`);
          }
        }

        const invitationData = invitationsRes.data?.data;
        if (invitationData?.invitations) {
          setInviteList(invitationData.invitations);
        }
      } catch (error) {
        console.error('Failed to fetch invite data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [router]);

  async function handleCopyLink() {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      showToast(t('invite.link_copied'));
    } catch {
      showToast(t('invite.copy_failed'));
    }
  }

  async function handleGenPoster() {
    if (!inviteLink || posterLoading) return;

    if (posterImg) {
      setShowPoster(true);
      return;
    }

    setPosterLoading(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const node = posterRef.current;
      if (!node) return;

      const cloned = node.cloneNode(true) as HTMLElement;
      cloned.style.position = 'static';
      cloned.style.left = '0';
      document.body.appendChild(cloned);

      const canvas = await html2canvas(cloned, {
        height: 645,
        width: 375,
        scale: 2,
      });

      document.body.removeChild(cloned);
      const imgData = canvas.toDataURL('image/jpeg');
      setPosterImg(imgData);
      setShowPoster(true);
    } catch (error) {
      console.error('Failed to generate poster:', error);
    } finally {
      setPosterLoading(false);
    }
  }

  function renderPromoText() {
    const text = t('invite.promo_text');
    const parts = text.split(/<red>|<\/red>/);
    return parts.map((part, i) =>
      i % 2 === 1 ? (
        <span key={i} className="col-red">
          {part}
        </span>
      ) : (
        <span key={i}>{part}</span>
      ),
    );
  }

  if (loading) {
    return (
      <div css={invitePageStyle} className="container">
        <section className="section">
          <div className="box">
            <Skeleton variant="text" count={3} height="1.5rem" width="70%" />
          </div>
        </section>
        <section className="section">
          <div className="box">
            <Skeleton variant="text" count={5} height="2.5rem" />
          </div>
        </section>
      </div>
    );
  }

  return (
    <div css={invitePageStyle} className="container">
      {toastMsg && <div className="toast">{toastMsg}</div>}

      <section className="section">
        <div className="box">
          <h2 className="title is-5">{t('invite.title')}</h2>

          {/* Promo Text */}
          <div className="promo-text">{renderPromoText()}</div>

          {/* Invite Code */}
          <div className="invite-code-display">
            <span>{t('invite.your_invite_code')}</span>
            <span className="code">{inviteCode || '-'}</span>
          </div>

          {/* Invite Link */}
          <div className="invite-link-section">
            <p>{t('invite.your_invite_link')}</p>
            <div className="invite-link-row">
              <input className="input" type="text" value={inviteLink} readOnly disabled />
              <button
                type="button"
                className="button is-info"
                onClick={handleCopyLink}
                disabled={!inviteLink}
              >
                {t('invite.copy_link')}
              </button>
              <button
                type="button"
                className={`button is-primary ${posterLoading ? 'is-loading' : ''}`}
                onClick={handleGenPoster}
                disabled={!inviteLink}
              >
                {t('invite.gen_poster')}
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="stats-row">
            {t('invite.invited_count')}
            <span className="col-red"> {inviteReward}</span>
            {t('invite.invited_count_unit')}
            {', '}
            {t('invite.invite_reward')}
            <span className="col-red"> {inviteTotal}</span> XBT
          </div>

          {/* QR Code */}
          {inviteLink && (
            <div className="qr-section">
              <div className="qr-info">
                <QRCodeCanvas value={inviteLink} size={180} />
                <p>{t('invite.poster_scan_qr')}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Invite History */}
      <section className="section">
        <div className="box">
          <div className="table-wrapper">
            {inviteList.length > 0 ? (
              <table className="table is-fullwidth is-striped">
                <thead>
                  <tr>
                    <th>{t('invite.invitee')}</th>
                    <th>{t('invite.invite_time')}</th>
                  </tr>
                </thead>
                <tbody>
                  {inviteList.map((item) => (
                    <tr key={item._id}>
                      <td>{desensitizeEmail(item.email)}</td>
                      <td>{format(new Date(item.created_at), 'yyyy/MM/dd HH:mm')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="has-text-centered">
                <Image className="no-record" src={no_record} alt="No records" />
                <p className="has-text-grey">{t('invite.no_invites')}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Hidden Poster Content for html2canvas */}
      <div ref={posterRef} css={posterContentStyle}>
        <div className="poster-logo">moow.cc</div>
        <div className="poster-slogan">{t('invite.poster_slogan')}</div>
        <div className="poster-title">{t('invite.poster_title')}[888 XBT]</div>
        <div className="poster-describe">
          {t('invite.poster_subtitle')} <b>2BTC</b>
        </div>
        <div className="poster-card">
          <div className="card-top">
            <p className="card-header-text">{t('invite.poster_invite_friend')}</p>
            <div className="qr-box">
              {inviteLink && <QRCodeCanvas value={inviteLink} size={180} />}
              <p>{t('invite.poster_scan_qr')}</p>
            </div>
          </div>
          <div className="card-bottom">
            <div className="card-bottom-label">{t('invite.poster_invite_code')}</div>
            <div className="card-bottom-code">{inviteCode}</div>
          </div>
        </div>
      </div>

      {/* Poster Overlay */}
      {showPoster && posterImg && (
        <div css={posterOverlayStyle} onClick={() => setShowPoster(false)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={posterImg} alt="Invite Poster" onClick={(e) => e.stopPropagation()} />
          <div className="poster-actions" onClick={(e) => e.stopPropagation()}>
            <a
              href={posterImg}
              download={`moow_invite_${inviteCode}`}
              className="button is-info"
            >
              {t('invite.poster_save')}
            </a>
            <button
              type="button"
              className="button is-light"
              onClick={() => setShowPoster(false)}
            >
              {t('action.cancel')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
