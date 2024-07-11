'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import auth from '@/utils/auth';
import { useTranslation } from 'next-i18next';
import logo1 from '@/assets/images/logo1.png';
import logo2 from '@/assets/images/logo2.png';

export default function Navbar() {
  const { t, i18n } = useTranslation('common');
  const [burgerActive, setBurgerActive] = useState(false);
  const [isHome, setIsHome] = useState(false);
  const [locale, setLocale] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(auth.isAuthenticated());
  const [userEmail, setUserEmail] = useState('');
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const initialLocale = auth.getLocale();
      setLocale(initialLocale);
      i18n.changeLanguage(initialLocale);
      setIsAuthenticated(auth.isAuthenticated());
      setIsHome(pathname === '/');
      const user = auth.getUser();
      if (user) {
        setUserEmail(user.email);
      }
    }
  }, [pathname]);
  const toggleNavbarMenu = () => {
    setBurgerActive(!burgerActive);
  };

  const switchLocale = async () => {
    const newLocale = locale === 'zh' ? 'en' : 'zh';
    setLocale(newLocale);
    auth.setLocale(newLocale);
    await i18n.changeLanguage(newLocale);
    router.refresh();
  };

  const handleLogout = async () => {
    if (typeof window !== 'undefined') {
      auth.logout();
      setIsAuthenticated(false);
      setUserEmail('');
      router.push('/');
    }
  };

  return (
    <nav
      className={`navbar is-transparent is-spaced is-fixed-top ${isHome ? 'home-navbar' : 'has-shadow'}`}
    >
      <div className="container">
        <div className="navbar-brand logo">
          <Link href="/" legacyBehavior>
            <a className="navbar-item">
              {isHome ? (
                <Image src={logo1} alt="Moow: Big Data Intelligent Investment Platform" />
              ) : (
                <Image src={logo2} alt="Moow: Big Data Intelligent Investment Platform" />
              )}
            </a>
          </Link>
          <div
            className={`navbar-burger burger ${burgerActive ? 'is-active' : ''}`}
            onClick={toggleNavbarMenu}
          >
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        <div className={`navbar-menu ${burgerActive ? 'is-active' : ''}`}>
          <div className="navbar-start">
            <Link href="/" legacyBehavior>
              <a className="navbar-item">{t('link.home')}</a>
            </Link>
            <Link href="/" legacyBehavior>
              <a className="navbar-item">{t('link.coin_aip')}</a>
            </Link>
            <a href="/" className="navbar-item" target="_self">
              {t('link.arbitrage')}
            </a>
            <div className="navbar-item has-dropdown is-hoverable">
              <a href="/" className="navbar-link">
                {t('link.coin')}
              </a>
              <div className="navbar-dropdown is-boxed">
                <a href="/" className="navbar-item" target="_self">
                  {t('link.coins')}
                </a>
                <a href="/" className="navbar-item" target="_self">
                  {t('link.exchanges')}
                </a>
                <a href="/" className="navbar-item" target="_self">
                  {t('link.news')}
                </a>
              </div>
            </div>
          </div>

          <div className="navbar-end">
            {isAuthenticated ? (
              <div className="navbar-item has-dropdown is-hoverable">
                <a className="navbar-link">{userEmail}</a>
                <div className="navbar-dropdown is-boxed">
                  <Link href="/" legacyBehavior>
                    <a className="navbar-item">{t('link.my_assets')}</a>
                  </Link>
                  <hr className="navbar-divider" />
                  <Link href="/" legacyBehavior>
                    <a className="navbar-item">{t('link.my_invite')}</a>
                  </Link>
                  <hr className="navbar-divider" />
                  <Link href="/aip/markets" legacyBehavior>
                    <a className="navbar-item">{t('link.exchange_apikeys')}</a>
                  </Link>
                  <hr className="navbar-divider" />
                  <a className="navbar-item" onClick={handleLogout}>
                    {t('sign_out')}
                  </a>
                </div>
              </div>
            ) : (
              <div className="navbar-item">
                <div className="field is-grouped">
                  <p className="control">
                    <Link href="/login" legacyBehavior>
                      <a className="button is-link is-rounded">
                        {t('sign_in')}/{t('sign_up')}
                      </a>
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
