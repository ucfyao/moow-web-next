'use client';

import Image from 'next/image';
import { useState, useEffect, useRef, useCallback, KeyboardEvent } from 'react';
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
  const [burgerActive, setBurgerActive] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const coinDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === '/';
  const userInfo = useUserStore((state) => state.userInfo);
  const setUserInfo = useUserStore((state) => state.setUserInfo);
  const isAuthenticated = !!userInfo?.email;

  const closeDropdown = useCallback(() => {
    setActiveDropdown(null);
    setFocusedIndex(-1);
  }, []);

  const handleDropdownKeyDown = useCallback(
    (e: KeyboardEvent, dropdownId: string, itemCount: number) => {
      switch (e.key) {
        case 'Enter':
        case ' ': {
          e.preventDefault();
          if (activeDropdown === dropdownId) {
            if (focusedIndex >= 0) {
              const ref = dropdownId === 'coin' ? coinDropdownRef : userDropdownRef;
              const items = ref.current?.querySelectorAll('[role="menuitem"]');
              if (items?.[focusedIndex]) {
                (items[focusedIndex] as HTMLElement).click();
              }
              closeDropdown();
            } else {
              closeDropdown();
            }
          } else {
            setActiveDropdown(dropdownId);
            setFocusedIndex(0);
          }
          break;
        }
        case 'Escape':
          e.preventDefault();
          closeDropdown();
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (activeDropdown !== dropdownId) {
            setActiveDropdown(dropdownId);
            setFocusedIndex(0);
          } else {
            setFocusedIndex((prev) => (prev + 1) % itemCount);
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (activeDropdown !== dropdownId) {
            setActiveDropdown(dropdownId);
            setFocusedIndex(itemCount - 1);
          } else {
            setFocusedIndex((prev) => (prev - 1 + itemCount) % itemCount);
          }
          break;
      }
    },
    [activeDropdown, focusedIndex, closeDropdown],
  );

  useEffect(() => {
    if (activeDropdown) {
      const ref = activeDropdown === 'coin' ? coinDropdownRef : userDropdownRef;
      const items = ref.current?.querySelectorAll('[role="menuitem"]');
      if (items?.[focusedIndex]) {
        (items[focusedIndex] as HTMLElement).focus();
      }
    }
  }, [activeDropdown, focusedIndex]);

  const localeLabel = i18n.language === 'zh' ? 'English' : '中文';

  const switchLocale = () => {
    const newLang = i18n.language === 'zh' ? 'en' : 'zh';
    i18n.changeLanguage(newLang);
    auth.setLocale(newLang);
  };

  const handleLogout = async () => {
    if (!window.confirm(t('prompt.confirm_logout'))) return;
    try {
      await HTTP.post('/api/v1/auth/logout');
      auth.logout();
      setUserInfo(null);
      router.push('/');
    } catch (error: any) {
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
    closeDropdown();
  }, [pathname, closeDropdown]);

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
            <Link href="/arbitrage" className="navbar-item">{t('link.arbitrage')}</Link>
            <div
              className={`navbar-item has-dropdown is-hoverable ${activeDropdown === 'coin' ? 'is-active' : ''}`}
              ref={coinDropdownRef}
            >
              <a
                href="/hq/coin"
                className="navbar-link"
                aria-haspopup="true"
                aria-expanded={activeDropdown === 'coin'}
                onKeyDown={(e) => handleDropdownKeyDown(e, 'coin', 3)}
              >
                {t('link.coin')}
              </a>
              <div className="navbar-dropdown is-boxed" role="menu">
                <a href="/hq/coin" className="navbar-item" role="menuitem" tabIndex={-1} target="_self">{t('link.coins')}</a>
                <a href="/hq/exchange" className="navbar-item" role="menuitem" tabIndex={-1} target="_self">{t('link.exchanges')}</a>
                <a href="/hq/news" className="navbar-item" role="menuitem" tabIndex={-1} target="_self">{t('link.news')}</a>
              </div>
            </div>
          </div>

          <div className="navbar-end">
            {isAuthenticated ? (
              <div
                className={`navbar-item has-dropdown is-hoverable ${activeDropdown === 'user' ? 'is-active' : ''}`}
                ref={userDropdownRef}
              >
                <Link
                  href=""
                  className="navbar-link"
                  aria-haspopup="true"
                  aria-expanded={activeDropdown === 'user'}
                  onKeyDown={(e) => handleDropdownKeyDown(e, 'user', 6)}
                >
                  {userInfo.email}
                </Link>
                <div className="navbar-dropdown is-boxed" role="menu">
                  <Link href="/assets" className="navbar-item" role="menuitem" tabIndex={-1}>{t('link.my_assets')}</Link>
                  <hr className="navbar-divider" />
                  <Link href="/invite" className="navbar-item" role="menuitem" tabIndex={-1}>{t('link.my_invite')}</Link>
                  <hr className="navbar-divider" />
                  <Link href="/aip/markets" className="navbar-item" role="menuitem" tabIndex={-1}>{t('link.exchange_apikeys')}</Link>
                  <hr className="navbar-divider" />
                  <Link href="/aip/orders" className="navbar-item" role="menuitem" tabIndex={-1}>{t('link.orders')}</Link>
                  <hr className="navbar-divider" />
                  <Link href="/ucenter/profile" className="navbar-item" role="menuitem" tabIndex={-1}>{t('link.my_profile')}</Link>
                  <hr className="navbar-divider" />
                  <a className="navbar-item" role="menuitem" tabIndex={-1} onClick={handleLogout}>{t('sign_out')}</a>
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
              {localeLabel}
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
