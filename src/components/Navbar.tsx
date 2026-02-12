'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import auth from '@/utils/auth';
import '@/i18n';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import useUserStore from "../store/user";
import HTTP from '../lib/http';
import logo1 from '@/assets/images/logo1.png';
import logo2 from '@/assets/images/logo2.png';

export default function Header({ isFixed = true }: { isFixed?: boolean }) {
  const { t, i18n } = useTranslation();
  const [locale, setLocale] = useState('English');
  const [burgerActive, setBurgerActive] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === '/';
  const userInfo = useUserStore((state) => state.userInfo);
  const setUserInfo = useUserStore((state) => state.setUserInfo);
  const isAuthenticated = !!userInfo?.email;


  const switchLocale = () => {
    i18n.changeLanguage(i18n.language === 'zh' ? 'en' : 'zh');
    setLocale(i18n.language === 'zh' ? 'English' : '中文');
    auth.setLocale(i18n.language);
  };

  const handleLogout = async () => {
    try {
      const response = await HTTP.post('/api/v1/auth/logout');
      auth.logout();
      setUserInfo(null);
      router.push('/');
      //console.log('Logout successful', response);
    } catch (error: any) {
      //console.error('Logout failed', error);
      auth.logout();
      setUserInfo(null);
      router.push('/');
    }
  };

  const toggleNavbarMenu = () => {
    setBurgerActive(!burgerActive);
  };

  useEffect(() => {
    setBurgerActive(false);
  }, [pathname]);

  //useEffect(() => {
    //console.log('Current user info:', userInfo);
    //console.log('Is authenticated:', isAuthenticated);
  //}, [userInfo, isAuthenticated]);

  return (
    <nav
      className={
        `navbar is-transparent is-spaced is-fixed-top ${isHome ? 'home-navbar' : 'has-shadow'}`
      }
    >
      <div className="container">
        <div className="navbar-brand logo">
          <Link className="navbar-item" href="/">
            {isHome ? (
              <Image src={logo1} alt="Moow: Big data robo-advisory platform" />
            ) : (
              <Image src={logo2} alt="Moow: Big data robo-advisory platform" />
            )}
          </Link>
          <div className={`navbar-burger burger ${burgerActive ? 'is-active' : ''}`} onClick={toggleNavbarMenu}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        <div className={`navbar-menu ${burgerActive ? 'is-active' : ''}`}>
          <div className="navbar-start">
            <Link href="/" className="navbar-item">{t('link.home')}</Link>
            <Link href="/aip" className="navbar-item">{t('link.coin_aip')}</Link>
            <a href="/hq/arbitrage" className="navbar-item" target="_self">{t('link.arbitrage')}</a>
            <div className="navbar-item has-dropdown is-hoverable">
              <a href="/hq/coin" className="navbar-link">{t('link.coin')}</a>
              <div className="navbar-dropdown is-boxed">
                <a href="/hq/coin" className="navbar-item" target="_self">{t('link.coins')}</a>
                <a href="/hq/exchange" className="navbar-item" target="_self">{t('link.exchanges')}</a>
                <a href="/hq/news" className="navbar-item" target="_self">{t('link.news')}</a>
              </div>
            </div>
          </div>

          <div className="navbar-end">
            {isAuthenticated ? (
              <div className="navbar-item has-dropdown is-hoverable">
                <Link href="" className="navbar-link">
                  {userInfo.email}
                </Link>
                <div className="navbar-dropdown is-boxed">
                  <Link href="/assets" className="navbar-item">{t('link.my_assets')}</Link>
                  <hr className="navbar-divider" />
                  <Link href="/invite" className="navbar-item">{t('link.my_invite')}</Link>
                  <hr className="navbar-divider" />
                  <Link href="/aip/markets" className="navbar-item">{t('link.exchange_apikeys')}</Link>
                  <hr className="navbar-divider" />
                  <a className="navbar-item" onClick={handleLogout}>{t('sign_out')}</a>
                </div>
              </div>
            ) : (
              <div className="navbar-item">
                <div className="field is-grouped">
                  <p className="control">
                    <Link href="/login" className="button is-link is-rounded">
                      {t('sign_in')}/{t('sign_up')}
                    </Link>
                  </p>
                </div>
              </div>
            )}
            <a className="navbar-item" onClick={switchLocale}>
              {locale}
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
