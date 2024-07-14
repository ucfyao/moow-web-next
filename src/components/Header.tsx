'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import auth from '@/utils/auth';
import '@/i18n';

import logo1 from '@/assets/images/logo1.png';
import logo2 from '@/assets/images/logo2.png';

export default function Header({ isFixed = true }: { isFixed?: boolean }) {
  const { t, i18n } = useTranslation();
  const [locale, setLocale] = useState('English');

  const switchLocale = () => {
    i18n.changeLanguage(i18n.language === 'zh' ? 'en' : 'zh');
    setLocale(i18n.language === 'zh' ? 'English' : '中文');
    auth.setLocale(i18n.language);
  };

  return (
      <nav
        className={
          isFixed
            ? 'navbar is-transparent is-spaced is-fixed-top home-navbar'
            : 'navbar is-transparent is-spaced'
        }
      >
        <div className="container">
          <div className="navbar-brand logo">
            <a className="navbar-item" href="/">
              {isFixed ? (
                <Image src={logo1} alt="币小宝: 大数据智能投顾平台" width="30" height="30" />
              ) : (
                <Image src={logo2} alt="币小宝: 大数据智能投顾平台" width="30" height="30" />
              )}
            </a>
            <div className="navbar-burger burger">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>

          <div className="navbar-menu">
            <div className="navbar-start">
              {/* <router-link to="/" className="navbar-item">{{ $t('link.home') }}</router-link> */}
              {/* <router-link to="/aip" className="navbar-item">{{ $t('link.coin_aip') }}</router-link> */}
              <a href="/hq/arbitrage" className="navbar-item" target="_self">
                {/* {{ $t('link.arbitrage') }} */}
              </a>
              <div className="navbar-item has-dropdown is-hoverable">
                <a href="/hq/coin" className="navbar-link">
                  {/* {{ $t('link.coin') }} */}111
                </a>
                <div className="navbar-dropdown is-boxed">
                  <a href="/hq/coin" className="navbar-item" target="_self">
                    {/* {{ $t('link.coins') }} */}222
                  </a>
                  <a href="/hq/exchange" className="navbar-item" target="_self">
                    {/* {{ $t('link.exchanges') }} */}333
                  </a>
                  <a href="/hq/news" className="navbar-item" target="_self">
                    {/* {{ $t('link.news') }} */}444
                  </a>
                </div>
              </div>
            </div>

            <div data-v-2e88caf6="" className="navbar-end">
              <div data-v-2e88caf6="" className="navbar-item">
                <div data-v-2e88caf6="" className="field is-grouped">
                  <p data-v-2e88caf6="" className="control">
                    <a data-v-2e88caf6="" href="/login" className="button is-link is-rounded">
                      登录/注册
                    </a>
                  </p>
                </div>
              </div>
              <a className="navbar-item" onClick={switchLocale}>
                {locale}
              </a>
            </div>
          </div>
        </div>
      </nav>
  );
}
