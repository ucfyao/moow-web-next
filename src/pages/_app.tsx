import { appWithTranslation } from 'next-i18next';
import "../app/globals.scss";
const MyApp = ({ Component, pageProps }) => (
  <Component {...pageProps} />
)

export default appWithTranslation(MyApp)