'use client';

import React, { memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import mail from '../assets/images/icon-mail.png';
import telegram from '../assets/images/telegram.png';
import wechat from '../assets/images/wechat.png';
import Tip from './Tip';

function Footer() {
  const { t } = useTranslation('');
  return (
    <footer className="footer">
      <div className="container has-text-centered">
        <nav className="level">
          <div className="level-left">
            <div className="level-item">
              <Link href="/" target="_blank">
                {t('about_us')}
              </Link>
            </div>
            <div className="level-item">
              <Link href="/" target="_blank">
                {t('faqs')}
              </Link>
            </div>
            <div className="level-item">
              <Link href="/" target="_blank">
                {t('use_tutorial')}
              </Link>
            </div>
            <div className="level-item">
              <Link href="http://cn.mikecrm.com/ovI6Cub" target="_blank">
                {t('business_cooperation')}
              </Link>
            </div>
          </div>
          <div className="level-right">
            <div className="level-item">
              <ul className="share_list">
                <li className="item">
                  <Tip content={<span>support@xiaobao.io</span>} />
                  <Link href="mailto:support@xiaobao.io">
                    <Image src={mail} className="social-icon" alt="Mail" />
                  </Link>
                </li>
                <li className="item">
                  <Link href="https://t.me/xiaobaoio" target="_blank">
                    <Image src={telegram} className="social-icon" alt="Telegram" />
                  </Link>
                </li>
                <li className="item">
                  <Link href="#">
                    <Tip content={<Image src={wechat} alt="Wechat" />} />
                    <Image src={wechat} className="social-icon" alt="Wechat" />
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>
        <div className="copy-right">
          <p className="has-text-grey-light">{t('copy_right')}</p>
        </div>
      </div>
    </footer>
  );
}

export default memo(Footer);
