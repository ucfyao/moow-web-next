import type { NextPage } from 'next';
import type { AppProps } from 'next/app';
import { appWithTranslation } from 'next-i18next';
import { Provider } from 'react-redux';
import store from '../store';
import '@/styles/globals.scss';
import Head from 'next/head';
import '../i18n';

export type NextPageWithLayout = NextPage & {
  getLayout?: (page: React.ReactElement) => React.ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page);
  return (
    <>
      <Head>
        <title>My Next.js App</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <Provider store={store}>{getLayout(<Component {...pageProps} />)}</Provider>;
    </>
  );
}

export default appWithTranslation(MyApp);
