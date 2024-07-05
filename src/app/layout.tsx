"use client";

import "./globals.scss";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import Tip from '../components/tip';
import auth from './utils/auth'; 
import Image from 'next/image'
import logo1 from '../assets/images/logo1.png'
import mail from '../assets/images/icon-mail.png'
import telegram from '../assets/images/telegram.png'
import wechat from '../assets/images/wechat.png'
import wechatGroup from '../assets/images/wechat-group.jpg'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [burgerActive, setBurgerActive] = useState(false);
  const [isHome, setIsHome] = useState(false);
  const [locale, setLocale] = useState(auth.getLocale());
  const [isAuthenticated, setIsAuthenticated] = useState(auth.isAuthenticated());
  const [userEmail, setUserEmail] = useState('');
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setLocale(auth.getLocale());
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

  const switchLocale = () => {
    const newLocale = locale === 'Engish' ? 'en' : 'zh';
    setLocale(newLocale);
    if (typeof window !== 'undefined') {
      auth.setLocale(newLocale);
    }
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
    <html lang="en">
      <body>
        <div>
          {/* Nav bar */}
          <nav className={`navbar is-transparent is-spaced is-fixed-top ${isHome ? 'home-navbar' : 'has-shadow'}`}>
            <div className="container">
              <div className="navbar-brand logo">
                <Link href="/signup" legacyBehavior>
                  <a className="navbar-item">
                    {isHome ? (
                      <Image src={logo1} alt="AntClony: Big Data Smart Investment Advisory Platform" width="30" height="30" layout="intrinsic" />
                    ) : (
                      <Image src={logo1} alt="AntClony: Big Data Smart Investment Advisory Platform" width="30" height="30" layout="intrinsic" />
                    )}
                  </a>
                </Link>
                <div className={`navbar-burger burger ${burgerActive ? 'is-active' : ''}`} onClick={toggleNavbarMenu}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>

              <div className={`navbar-menu ${burgerActive ? 'is-active' : ''}`}>
                <div className="navbar-start">
                  <Link href="/" legacyBehavior>
                    <a className="navbar-item">Home</a>
                  </Link>
                  <Link href="/aip" legacyBehavior>
                    <a className="navbar-item">Investment</a>
                  </Link>
                  <a href="/hq/arbitrage" className="navbar-item" target="_self">Arbitrage</a>
                  <div className="navbar-item has-dropdown is-hoverable">
                    <a href="/market" className="navbar-link">
                      Market
                    </a>
                    <div className="navbar-dropdown is-boxed">
                      <a href="/hq/coin" className="navbar-item" target="_self">Coins</a>
                      <a href="/hq/exchange" className="navbar-item" target="_self">Exchange</a>
                      <a href="/hq/news" className="navbar-item" target="_self">News</a>
                    </div>
                  </div>
                </div>

                <div className="navbar-end">
                  {isAuthenticated ? (
                    <div className="navbar-item has-dropdown is-hoverable">
                      <a className="navbar-link">{userEmail}</a>
                      <div className="navbar-dropdown is-boxed">
                        <Link href="/assets" legacyBehavior>
                          <a className="navbar-item">My Assets</a>
                        </Link>
                        <hr className="navbar-divider" />
                        <Link href="/invite" legacyBehavior>
                          <a className="navbar-item">My Invites</a>
                        </Link>
                        <hr className="navbar-divider" />
                        <Link href="/aip/markets" legacyBehavior>
                          <a className="navbar-item">Exchange API</a>
                        </Link>
                        <hr className="navbar-divider" />
                        <a className="navbar-item" onClick={handleLogout}>
                          Log out
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="navbar-item">
                      <div className="field is-grouped">
                        <p className="control">
                          <Link href="/login" legacyBehavior>
                            <a className="button is-link is-rounded">Login/Register</a>
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

          {/* Main Content */}
          <div className="main-content">{children}</div>

          {/* Footer */}
          <footer className="footer">
            <div className="container has-text-centered">
              <nav className="level">
                <div className="level-left">
                  <div className="level-item">
                    <a href="/hq/company/about" target="_blank">About us</a>
                  </div>
                  <div className="level-item">
                    <a href="/hq/company/faqs" target="_blank">FAQ</a>
                  </div>
                  <div className="level-item">
                    <a href="/hq/company/usetutorial" target="_blank">Use Tutorial</a>
                  </div>
                  <div className="level-item">
                    <a href="http://cn.mikecrm.com/ovI6Cub" target="_blank">Business Partner</a>
                  </div>
                </div>
                <div className="level-right">
                  <div className="level-item">
                    <ul className="share_list">
                      <li className="item">
                        <Tip content={<span>support@xiaobao.io</span>} />
                        <a href="mailto:support@xiaobao.io">
                          <Image src={mail} className="social-icon" alt="Mail" />
                        </a>
                      </li>
                      <li className="item">
                        <a href="https://t.me/xiaobaoio" target="_blank">
                          <Image src={telegram} className="social-icon" alt="Telegram" />
                        </a>
                      </li>
                      <li className="item">
                        <a>
                          <Tip content={<Image src={wechatGroup} alt="Wechat" />} />
                          <Image src={wechat} className="social-icon" alt="Wechat" />
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </nav>
              <div className="copy-right">
                <p className="has-text-grey-light">© 2024  AntClony All right reserved</p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>  
  );
};