import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang='ja'>
      <Head>
        <title>BookStore</title>
        <meta name='description' content='本のECサイト' />
        <meta name='viewport' content='width=device-width, initial-scale=1.0' />
        <meta name='theme-color' content='#000000' />
        <meta name='apple-mobile-web-app-capable' content='yes' />
        <meta name='apple-mobile-web-app-status-bar-style' content='black' />
        <meta name='apple-mobile-web-app-title' content='BookStore' />
        <meta name='msapplication-TileColor' content='#000000' />
        <meta name='msapplication-config' content='/browserconfig.xml' />
        <meta name='msapplication-tap-highlight' content='no' />
        <meta name='msapplication-navbutton-color' content='#000000' />
        <meta name='msapplication-starturl' content='/' />
        <meta
          name='msapplication-window'
          content='width=device-width, initial-scale=1.0'
        />
        <meta name='msapplication-window-color' content='#000000' />
        <meta name='msapplication-window-status-bar-color' content='#000000' />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
