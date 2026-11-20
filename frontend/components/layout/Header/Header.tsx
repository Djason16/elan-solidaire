import { useRouter } from 'next/router'
import { useState } from 'react'
import AppLink from '@/components/ui/AppLink/AppLink'
import BaseButton from '@/components/ui/BaseButton/BaseButton'
import CircleButton from '@/components/ui/Button/CircleButton'
import Icon from '@/components/ui/Icon/Icon'
import SiteImage from '@/components/ui/SiteImage/SiteImage'
import { useAuthStore } from '@/stores/auth'
import { selectCount, useCartStore } from '@/stores/cart'
import { navigationLinks } from '@/utils/content/site'
import { cartShopping } from '@/utils/icons'
import HeaderMenu from './HeaderMenu'
import { cx } from '@/utils/cx'
import { useIsCurrent } from '@/composables/useIsCurrent'
import { useHeaderScroll } from '@/composables/useHeaderScroll'
import DemoBanner from '@/components/ui/Overlays/DemoBanner'

/**
 * Top of every page, as in the original design: logo and name, main links, donation button, round cart and menu
 * buttons, under the thin "Site de démonstration" banner. Under 1440 px only the logo, the cart and the menu stay; the
 * banner and the header are then ONE fixed block: the header floats as a blurred pill while scrolling, and the whole
 * block hides when the visitor scrolls down and comes back when they go up (same transform, same duration). It is
 * sticky, so it keeps its place in the page and nothing jumps. Rendered in the HTML of every page.
 */
export default function Header() {
    const router = useRouter()
    const user = useAuthStore((state) => state.user)
    const cartCount = useCartStore(selectCount)
    const [open, setOpen] = useState(false)
    const [headerRef, scroll] = useHeaderScroll()

    // The menu closes when the page changes (state adjusted during render, not in an effect)
    const [path, setPath] = useState(router.asPath)
    if (path !== router.asPath) {
        setPath(router.asPath)
        setOpen(false)
    }

    // Current page (composables/useIsCurrent.js): a section is also current on its sub-pages (/adhesion/)
    const isCurrent = useIsCurrent({ prefix: true })
    const accountLinks = user
        ? [
            user.role === 'admin'
                ? { href: '/admin/', label: 'Admin', title: 'Ouvrir l’administration' }
                : { href: '/espace-membre/', label: 'Mon espace', title: 'Ouvrir mon espace membre' },
        ]
        : [{ href: '/connexion/', label: 'Connexion', title: 'Se connecter à son compte' }]

    return (
        <>
        <header ref={headerRef} className={cx('site-header', scroll.scrolled && 'is-scrolled', scroll.hidden && !open && 'is-hidden')}>
            <DemoBanner />
            <div className={cx('header-wrapper gap-xl', scroll.scrolled && 'scrolled')}>
                <AppLink href="/" className="header-logo" title="Accueil - Élan Solidaire" aria-current={isCurrent('/') ? 'page' : undefined}>
                    <SiteImage src="/images/logo.svg" alt="Logo d’Élan Solidaire : deux chevrons qui montent, blanc et vert, dans un rond bleu" title="Logo - Élan Solidaire" width="40" height="40" loading="eager" />
                    <span className="text-normal" aria-hidden="true">Élan<br />Solidaire</span>
                </AppLink>

                <nav className="header-nav text-normal" aria-label="Menu principal">
                    <ul className="nav-list gap-xl">
                        {navigationLinks.map((link) => (
                            <li key={link.href}>
                                <AppLink href={link.href} title={link.title} className={cx('nav-link text-semibold', isCurrent(link.href) && 'active')}
                                    aria-current={isCurrent(link.href) ? 'page' : undefined}>{link.label}</AppLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="header-actions">
                    <BaseButton href="/don/" title="Faire un don à l’association" className="header-donate"
                        aria-current={isCurrent('/don/') ? 'page' : undefined}>Faire un don</BaseButton>
                    <CircleButton active={isCurrent('/panier/')} title={`Voir le panier (${cartCount} article${cartCount > 1 ? 's' : ''})`}
                        onClick={() => router.push('/panier/')}>
                        <Icon icon={cartShopping} />
                        {cartCount > 0 && <span className="cart-badge" aria-hidden="true">{cartCount}</span>}
                    </CircleButton>
                    <CircleButton active={!open} title={open ? 'Fermer le menu' : 'Ouvrir le menu'} aria-expanded={open}
                        aria-controls="site-menu" onClick={() => setOpen(!open)}>
                        <span className={cx('burger-line', open && 'open')} aria-hidden="true" />
                        <span className={cx('burger-line', open && 'open')} aria-hidden="true" />
                        <span className={cx('burger-line', open && 'open')} aria-hidden="true" />
                    </CircleButton>
                </div>
            </div>
        </header>
        {/* Outside the moving block: a transformed parent would hold the fixed menu inside it */}
        <HeaderMenu open={open} onClose={() => setOpen(false)} accountLinks={accountLinks} isCurrent={isCurrent} />
        </>
    )
}
