import { Head, Html, Main, NextScript } from 'next/document'

/**
 * HTML of every exported page, in the language of the site. The two font files seen at the top of every page are
 * preloaded, so the text does not change size when they arrive (Lighthouse).
 */
export default function Document() {
    return (
        <Html lang="fr">
            <Head>
                <link rel="icon" href="/favicon.ico" sizes="16x16 32x32" />
                <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
                <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
                <link rel="manifest" href="/site.webmanifest" />
                <meta name="theme-color" content="#1A6FA8" />
                <link rel="preload" href="/fonts/PublicSans/PublicSans-Regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
                <link rel="preload" href="/fonts/PublicSans/PublicSans-SemiBold.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    )
}
