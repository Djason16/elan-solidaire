import type { AppProps } from 'next/app'
import Head from 'next/head'
import AppShell from '@/components/layout/AppShell/AppShell'
import '@/assets/css/main.css'

/**
 * Root of the site (Pages Router): global CSS, and every page inside the frame of the site (AppShell).
 * @param props
 */
export default function App({ Component, pageProps }: AppProps) {
    return (
        <>
            <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>
            <AppShell>
                <Component {...pageProps} />
            </AppShell>
        </>
    )
}
