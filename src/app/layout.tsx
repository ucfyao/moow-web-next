'use client'

// import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import mail from '../assets/icon-mail.png';
import telegram from '../assets/telegram.png';
import wechat from '../assets/wechat.png';
import { useRouter } from 'next/router';
import logo1 from '../assets/logo1.png';
import { useSelector, useDispatch, Provider } from 'react-redux';
import { setLocale, setUser, setIsAuthenticated } from '../store';
import { useTranslation } from 'react-i18next';
import auth from '../app/utils/auth';
import axios from 'axios';
import { store } from '../store';
import i18n from '../i18n';
import { Providers } from '../components/Providers'

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolling, setScrolling] = useState(false);
  const [isHome, setIsHome] = useState(false);

  const locale = useSelector((state: any) => state.locale);
  const user = useSelector((state: any) => state.user);
  const isAuthenticated = useSelector((state: any) => state.isAuthenticated);
  const dispatch = useDispatch();
  const router = useRouter();

  const userEmail = user ? user.email : "";
  const computedLocale = locale === "zh" ? "English" : "中文";

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    // Determine if the current path is home
    setIsHome(window.location.pathname === "/");
    return () => {
      window.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const handleScroll = () => {
    setScrolling(window.scrollY >= 60);
  };

  const switchLocale = () => {
    const newLocale = locale === "zh" ? "en" : "zh";
    auth.setLocale(newLocale);
    dispatch(setLocale(newLocale));
  };

  const handleLogout = () => {
    axios.post("/pub/auth/exit", {})
      .then(response => {
        auth.logout();
        dispatch(setUser(null));
        dispatch(setIsAuthenticated(false));
        router.push("/");
      })
      .catch(e => {
        auth.logout();
        dispatch(setUser(null));
        dispatch(setIsAuthenticated(false));
        router.push("/");
      });
  };

  return (
    <Provider store={store}>
      <html lang="en">
        <body className={inter.className}>
            {/* <Navbar /> */}
            <nav className="relative">
              <div onChange={handleScroll} className={`fixed z-20 top-0 left-0 right-0 bg-black ${scrolling ? 'bg-opacity-30' : ''} h-[60px] px-2 md:px-8 py-3 text-white`}>
                <div className="flex justify-between md:justify-around items-center relative">
                  <div className="flex justify-center items-center gap-6">
                    <Image src={logo1} alt="Logo" width={96} className="mx-2" />
                    <div className="hidden md:inline-flex justify-center items-center">
                      <Link href="/" className="px-1 md:px-3 py-2">
                        Home
                      </Link>
                      <Link href="/strategies" className="px-1 md:px-3 py-2">
                        Investment Plan
                      </Link>
                      <Link href="/" className="px-1 md:px-3 py-2">
                        Arbitrage
                      </Link>
                      <div className="relative inline-block text-left group">
                        <div className="">
                          <button
                            type="button"
                            className="inline-flex w-full justify-center gap-x-1.5 rounded-md px-3 py-2 text-sm"
                            id="menu-button"
                            aria-expanded="true"
                            aria-haspopup="true"
                          >
                            Coins
                            <svg
                              className="-mr-1 h-5 w-5 text-whith"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              aria-hidden="true"
                            >
                              <path
                                fillRule="evenodd"
                                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </div>

                        <div className="hidden hover:block group-hover:block absolute right-0 z-10 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="menu-button">
                          <div className="py-1" role="none">
                            <a href="#" className="text-gray-700 block px-4 py-2 text-sm" role="menuitem" id="menu-item-0">
                              Coins
                            </a>
                            <a href="#" className="text-gray-700 block px-4 py-2 text-sm" role="menuitem" id="menu-item-1">
                              Exchange
                            </a>
                            <a href="#" className="text-gray-700 block px-4 py-2 text-sm" role="menuitem" id="menu-item-2">
                              News
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="hidden md:flex justify-center items-center">
                    {isAuthenticated ? (
                      <div className="relative group">
                        <Link href="" className="flex items-center px-3 py-2">
                          {userEmail}
                        </Link>
                        <div className="absolute right-0 hidden group-hover:block bg-white shadow-lg rounded-md">
                          <div className="py-1">
                            <Link href="/assets" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                              {t('link.my_assets')}
                            </Link>
                            <hr className="my-1 border-gray-200" />
                            <Link href="/invite" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                              {t('link.my_invite')}
                            </Link>
                            <hr className="my-1 border-gray-200" />
                            <Link href="/aip/markets" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                              {t('link.exchange_apikeys')}
                            </Link>
                            <hr className="my-1 border-gray-200" />
                            <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                              {t('sign_out')}
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="px-3 py-2">
                        <Link href="/login">
                          <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full">
                            {t('sign_in')}/{t('sign_up')}
                          </button>
                        </Link>
                      </div>
                    )}
                    <button onClick={switchLocale} className="px-3 py-2">
                      {locale}
                    </button>
                  </div>

                  <div className="md:hidden ml-auto">
                    <button onClick={() => setMenuOpen(!menuOpen)} className="px-3 py-2 focus:outline-none">
                      <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        {menuOpen ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                        )}
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              {menuOpen && (
                <div className="w-full fixed z-20 top-[60px] bg-white left-0">
                  <div className="flex md:hidden shadow-xl">
                    <div className="flex flex-col space-y-2 my-2 text-black">
                      <Link href="/" className="px-3 py-2 ">
                        Home
                      </Link>
                      <Link href="/strategies" className="px-3 py-2 ">
                        Investment
                      </Link>
                      <Link href="/" className="px-3 py-2 ">
                        Arbitrage
                      </Link>
                      <Link href="/" className="px-3 py-2 ">
                        Coins
                      </Link>
                      <Link href="/" className="ml-3 px-3 py-2 ">
                        Coins
                      </Link>
                      <Link href="/" className="ml-3 px-3 py-2 ">
                        exchange
                      </Link>
                      <Link href="/" className="ml-3 px-3 py-2 ">
                        News
                      </Link>
                      {isAuthenticated ? (
                        <>
                          <span className="px-3 py-2">{userEmail}</span>
                          <Link href="/assets" className="px-3 py-2">
                            {t('link.my_assets')}
                          </Link>
                          <Link href="/invite" className="px-3 py-2">
                            {t('link.my_invite')}
                          </Link>
                          <Link href="/aip/markets" className="px-3 py-2">
                            {t('link.exchange_apikeys')}
                          </Link>
                          <button onClick={handleLogout} className="px-3 py-2 text-left">
                            {t('sign_out')}
                          </button>
                        </>
                      ) : (
                        <Link href="/login" className="px-3 py-2">
                          <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full">
                            {t('sign_in')}/{t('sign_up')}
                          </button>
                        </Link>
                      )}
                      <button onClick={switchLocale} className="px-3 py-2">
                        {locale}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </nav>

            {/* Main Content */}
            <div className="flex flex-col min-h-screen">
              <main className="flex-grow">{children}</main>
            </div>

            {/* <Footer /> */}
            <div className="flex flex-col justify-centern bg-[#1b1e2e] text-[#b5b5b5] bottom-0 py-8 px-6 gap-8 text-sm md:text-base">
              <div className="flex flex-col md:flex-row justify-between items-center mx-20 gap-6">
                <div className="flex flex-col md:flex-row justify-center items-center gap-6 whitespace-nowrap">
                  <Link href="/">About us</Link>
                  <Link href="/">FAQ</Link>
                  <Link href="/">Use Tutorial</Link>
                  <Link href="/">Business Partner</Link>
                </div>
                <div className="flex flex-col md:flex-row justify-center items-center gap-6">
                  <Link href="/">
                    <Image src={mail} alt="mail" width={30} />
                  </Link>
                  <Link href="/">
                    <Image src={telegram} alt="mail" width={30} />
                  </Link>
                  <Link href="/">
                    <Image src={wechat} alt="mail" width={30} />
                  </Link>
                </div>
              </div>

              <div className="border-b test-white mx-10"></div>

              <div className="text-center mx-10 ">
                <p>©2023 AntClony All right reserved</p>
              </div>
            </div>
        </body>
      </html>
    </Provider>
  );
}
