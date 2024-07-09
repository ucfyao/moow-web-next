import type { NextPage } from "next";
import type { AppProps } from "next/app";
import { appWithTranslation } from 'next-i18next';
//import "../app/globals.scss";
import './styles/globals.scss';
import { Provider } from 'react-redux';
import store from '../store';

export type NextPageWithLayout = NextPage & {
  getLayout?: (page: React.ReactElement) => React.ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <Provider store={store}>
      {getLayout(<Component {...pageProps} />)}
    </Provider>
  );
}

export default appWithTranslation(MyApp);