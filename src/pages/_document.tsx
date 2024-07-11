import Document, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentContext,
  DocumentInitialProps,
} from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en" className="has-navbar-fixed-top">
        <Head>
          <meta name="description" content="" />

          <link rel="icon" href="/favicon.ico" />
          <link
            href="https://cdn.bootcss.com/font-awesome/4.7.0/css/font-awesome.min.css"
            rel="stylesheet"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
          <script
            dangerouslySetInnerHTML={{
              __html: `
            var _hmt = _hmt || [];
            (function() {
              var hm = document.createElement("script");
              hm.src = "https://hm.baidu.com/hm.js?36110cb9733fa64edfee47fc0c251d85";
              var s = document.getElementsByTagName("script")[0];
              s.parentNode.insertBefore(hm, s);
            })();
          `,
            }}
          />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
