import type { Link } from '@/utils/types'
import { useEffect, useRef, type CSSProperties } from 'react'
import { usePresence } from '@/composables/usePresence'
import AppLink from '@/components/ui/AppLink/AppLink'
import { navigationLinks } from '@/utils/content/site'
import { cx } from '@/utils/cx'

interface HeaderMenuProps {
    open: boolean
    onClose: () => void
    accountLinks: Link[]
    isCurrent: (href?: string) => boolean
}

/**
 * Menu opened by the round menu button: a centered card on a large screen (account links), a sheet rising from the
 * bottom on a smaller one (every link). The dark veil and Escape close it. Entry and exit animated (usePresence);
 * the focus goes to the first link when it opens, back to the menu button when it closes.
 * @param props
 * @param props.open
 * @param props.onClose
 * @param props.accountLinks - Login, member space or admin.
 * @param props.isCurrent - Whether a link is the current page.
 */
export default function HeaderMenu({ open, onClose, accountLinks, isCurrent }: HeaderMenuProps) {
    useEffect(() => {
        if (!open) return undefined
        const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [open, onClose])

    const { mounted, closing } = usePresence(open)
    const list = useRef<HTMLUListElement | null>(null)

    // Focus: first link at the opening, back to the button that opened the menu at the closing
    useEffect(() => {
        if (!open) return undefined
        const opener = document.activeElement
        list.current?.querySelector('a')?.focus({ preventScroll: true })
        return () => (opener as HTMLElement | null)?.focus?.({ preventScroll: true })
    }, [open])

    if (!mounted) return null

    const links: (Link & { main?: boolean })[] = [...navigationLinks.map((link) => ({ ...link, main: true })), ...accountLinks]

    return (
        <div className={cx('menu-overlay', 'text-normal', closing && 'is-closing')} onClick={onClose} role="presentation">
            <div className="menu-container" onClick={(event) => event.stopPropagation()} role="presentation">
                <nav id="site-menu" className="menu" aria-label="Menu">
                    <ul ref={list} className="menu-list">
                        {links.map((link, index) => (
                            <li key={link.href} className={link.main ? 'menu-main-link' : ''} style={{ '--item-index': index, '--account-index': index - navigationLinks.length } as CSSProperties}>
                                <AppLink href={link.href} title={link.title} className={cx('menu-link text-semibold', isCurrent(link.href) && 'active')}
                                    aria-current={isCurrent(link.href) ? 'page' : undefined} onClick={onClose}>
                                    <span className="link-text">{link.label}</span>
                                    <span className="arrow" aria-hidden="true">→</span>
                                </AppLink>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </div>
    )
}
