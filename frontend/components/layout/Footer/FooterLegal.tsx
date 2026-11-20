import type { Link } from '@/utils/types'
import { Fragment } from 'react'
import AppLink from '@/components/ui/AppLink/AppLink'
import { association } from '@/utils/content/site'
import { useIsCurrent } from '@/composables/useIsCurrent'

interface FooterLegalProps {
    links: Link[]
}

/**
 * Last line of the dark footer: copyright and legal pages (the reset of the demo is in the demo banner).
 * @param props - Legal pages.
 */
export default function FooterLegal({ links }: FooterLegalProps) {
    const isCurrent = useIsCurrent()


    return (
        <div className="footer-legal gap-m text-normal">
            <p className="footer-copyright">© {new Date().getFullYear()} {association.name} (association fictive). Tous droits réservés.</p>
            <ul className="legal-links">
                {links.map((link, index) => (
                    <Fragment key={link.href}>
                        <li>
                            <AppLink href={link.href} title={link.title} className="legal-link" aria-current={isCurrent(link.href) ? 'page' : undefined}>
                                {link.label}
                            </AppLink>
                        </li>
                        {index < links.length - 1 && <li aria-hidden="true" className="legal-separator">•</li>}
                    </Fragment>
                ))}
            </ul>
        </div>
    )
}
