import AppLink from '@/components/ui/AppLink/AppLink'
import Icon from '@/components/ui/Icon/Icon'
import SiteImage from '@/components/ui/SiteImage/SiteImage'
import { association, developer, legalLinks, navigationLinks, socialLinks } from '@/utils/content/site'
import FooterLegal from './FooterLegal'
import { useIsCurrent } from '@/composables/useIsCurrent'

// Second column of links: the sections of the home page
const aboutLinks = [
    { href: '/#notre-mission', label: 'Notre mission', title: 'Lire la mission de l’association' },
    { href: '/#nos-actions', label: 'Nos actions', title: 'Nos projets sur le terrain' },
]

/**
 * Bottom of every page, as in the original design: a dark block with rounded bottom corners (logo, slogan, networks,
 * two columns of links, legal links), over a blue band with the credit of the developer.
 */
export default function Footer() {
    const isCurrent = useIsCurrent()
    const columns = [
        { title: 'Navigation', links: navigationLinks.filter((link) => link.href !== '/') },
        { title: 'L’association', links: aboutLinks },
    ]

    return (
        <footer className="site-footer">
            <div className="footer-top gap-xxxl">
                <div className="footer-main gap-l text-normal">
                    <section className="association-info gap-xs" aria-label={association.name}>
                        <div className="footer-logo-name">
                            <SiteImage src="/images/logo.svg" alt="Logo d’Élan Solidaire" title="Élan Solidaire" width="40" height="40" />
                            <span>{association.name}</span>
                        </div>
                        <p>
                            Une <mark>main tendue</mark> pour un <mark>vrai élan</mark> !{' '}
                            <mark>Avec vous, nous changeons le quotidien</mark> des enfants et des familles des villages que nous soutenons.
                        </p>
                        <div className="social-icons text-xlarge">
                            {socialLinks.map((link) => (
                                <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer" title={link.title} aria-label={link.title}>
                                    <span className="social-icon"><Icon icon={link.icon} /></span>
                                </a>
                            ))}
                        </div>
                    </section>

                    <div className="footer-navigation">
                        {columns.map((column) => (
                            <nav key={column.title} className="footer-nav-section" aria-label={column.title}>
                                <h2 className="footer-nav-title text-bold text-normal">{column.title}</h2>
                                <ul className="footer-nav-list gap-l">
                                    {column.links.map((link) => (
                                        <li key={link.href}>
                                            <AppLink href={link.href} title={link.title} className="footer-nav-link"
                                                aria-current={isCurrent(link.href) ? 'page' : undefined}>{link.label}</AppLink>
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                        ))}
                    </div>
                </div>

                <FooterLegal links={legalLinks} />
            </div>

            <div className="footer-bottom">
                <p className="text-normal">
                    Site conçu et réalisé par{' '}
                    <a href={developer.href} target="_blank" rel="noopener" title={developer.title}>{developer.name}</a>
                </p>
            </div>
        </footer>
    )
}
