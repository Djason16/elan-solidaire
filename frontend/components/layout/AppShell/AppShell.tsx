import type { ReactNode } from 'react'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useEffectEvent, useRef, useState } from 'react'
import Footer from '@/components/layout/Footer/Footer'
import Header from '@/components/layout/Header/Header'
import BackToTop from '@/components/ui/Button/BackToTop'
import Loader from '@/components/ui/Loader/Loader'
import ConfirmDialog from '@/components/ui/Overlays/ConfirmDialog'
import MailPreview from '@/components/ui/Overlays/MailPreview'
import PaymentDialog from '@/components/ui/Overlays/PaymentDialog'
import TourBubble from '@/components/ui/Overlays/TourBubble'
import Toasts from '@/components/ui/Overlays/Toasts'
import PreferencesBanner from '@/components/ui/PreferencesBanner/PreferencesBanner'
import { useOrderTracking } from '@/composables/useOrderTracking'
import { usePageChange } from '@/composables/usePageChange'
import { privateGuard } from '@/middleware/guards'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useUserPreferencesStore } from '@/stores/userPreferences'

// dc-scaffold: adapted (loader of the original design with its fade out, demo banner, global windows, private pages)
// Minimum time of the loader on a page change, so that it does not just blink (milliseconds)
const LOADER_PAGE_TIME = 400
// Longest wait of the loader on the first opening, even if the fonts are not there yet (milliseconds)
const LOADER_FIRST_MAX_TIME = 2000
// Fade out of the loader (milliseconds, the same as assets/css/components/loader.css)
const LOADER_FADE_TIME = 300

interface AppShellProps {
    children?: ReactNode
}

/**
 * Frame of every page (and of the 404 page): demo banner, header, page, footer, floating buttons, cookie window,
 * and the windows of the site (notifications, confirmation, e-mail preview, payment).
 * The single loader of the site covers the page on the first opening, on every page change, and on a private
 * page until the session is checked (an admin page never shows, even for a moment, to a visitor).
 * @param props
 */
export default function AppShell({ children }: AppShellProps) {
    const router = useRouter()
    const { user, checked, checkSession } = useAuthStore()
    // 'shown', 'leaving' (fading out, clicks pass through) or 'hidden'
    const [loader, setLoader] = useState<'shown' | 'leaving' | 'hidden'>('shown')
    const ready = useRef(false)
    const shownAt = useRef(0)

    const hideLoader = useCallback(() => {
        setLoader('leaving')
        setTimeout(() => setLoader((state) => (state === 'leaving' ? 'hidden' : state)), LOADER_FADE_TIME)
    }, [])

    // Loader on every page change: shown when the navigation starts, hidden once the new page is there
    const startLoader = useCallback(() => {
        if (!ready.current) return
        shownAt.current = Date.now()
        setLoader('shown')
    }, [])
    const endLoader = useCallback(() => {
        if (!ready.current) return
        setTimeout(hideLoader, Math.max(0, LOADER_PAGE_TIME - (Date.now() - shownAt.current)))
    }, [hideLoader])
    usePageChange(startLoader, endLoader)
    // Orders move by themselves (simulated carrier): a toast at each new step while the site is open
    useOrderTracking()

    // Reads the latest store actions when the first-opening effect runs, without making them dependencies
    const restoreVisit = useEffectEvent(() => {
        // Choices of a previous visit (cookie), saved cart and session of the demo
        useUserPreferencesStore.getState().loadPreferences()
        useCartStore.getState().load()
        checkSession()
    })

    useEffect(() => {
        restoreVisit()

        // Fonts of utils/fonts.css loaded (the text will not change size), or 2 seconds at most: the loader goes
        Promise.race([document.fonts.ready, new Promise((resolve) => setTimeout(resolve, LOADER_FIRST_MAX_TIME))]).then(() => {
            ready.current = true
            hideLoader()
        })
    }, [hideLoader])

    // Private pages: wait for the session, then send away a visitor who may not see them
    const redirect = checked ? privateGuard(router.pathname, user) : null
    // A private page is one that sends a visitor away
    const waitingForSession = !checked && privateGuard(router.pathname, null) !== null
    useEffect(() => {
        if (redirect) router.replace(redirect === '/connexion/' ? `/connexion/?next=${encodeURIComponent(router.asPath)}` : redirect)
    }, [redirect, router])

    return (
        <>
            {(waitingForSession || redirect) ? <Loader /> : loader !== 'hidden' && <Loader leaving={loader === 'leaving'} />}
            <div className="app-shell">
                <a className="skip-link" href="#content" title="Aller au contenu de la page">Aller au contenu</a>
                <Header />
                <main id="content">{children}</main>
                <Footer />

                <BackToTop />
                <PreferencesBanner />
                <Toasts />
                <ConfirmDialog />
                <MailPreview />
                <PaymentDialog />
                <TourBubble />
            </div>
        </>
    )
}
