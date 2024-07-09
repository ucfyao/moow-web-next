import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en" className="has-navbar-fixed-top">
        <Head>
          <meta charSet="utf-8" />
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <link rel="icon" href="/favicon.ico" />
          <link defer href="https://cdn.bootcss.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet" />
          <title>xiaobao.io</title>
        </Head>
        <body>
          <noscript>
            <strong>We're sorry but this doesn't work properly without JavaScript enabled. Please enable it to continue.</strong>
          </noscript>
          <Main />
          <NextScript />
          <script dangerouslySetInnerHTML={{ __html: `
            var _hmt = _hmt || [];
            (function() {
              var hm = document.createElement("script");
              hm.src = "https://hm.baidu.com/hm.js?36110cb9733fa64edfee47fc0c251d85";
              var s = document.getElementsByTagName("script")[0];
              s.parentNode.insertBefore(hm, s);
            })();
          ` }} />
        </body>
      </Html>
    );
  }
}

export default MyDocument;