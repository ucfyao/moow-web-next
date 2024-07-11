import Head from 'next/head';
import { ReactNode } from 'react';

import Navbar from './Navbar';
import Footer from './Footer';

type LayoutProps = {
  children: ReactNode;
  title?: string;
};

export default function Layout({ children, title = 'Default Title' }: LayoutProps) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <Navbar />
      <main> {children} </main>
      <Footer />
    </>
  );
}
