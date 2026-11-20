import type { IconData } from '@/utils/icons'
import Icon from '@/components/ui/Icon/Icon'
import SectionIntro from '@/components/ui/SectionIntro/SectionIntro'
import SiteImage from '@/components/ui/SiteImage/SiteImage'
import { useReveal } from '@/composables/useReveal'
import { association } from '@/utils/content/site'
import { envelope, locationDot, phone } from '@/utils/icons'
import { cx } from '@/utils/cx'

// City of the (fictional) address: "12 rue des Tilleuls, 69000 Lyon" -> "69000 Lyon, France"
const city = `${(association.address.split(',').pop() ?? '').trim()}, France`

interface ContactCard {
    id: string
    title: string
    info: string
    note: string
    icon: IconData
    href: string
    linkTitle: string
    external?: boolean
}

const cards: ContactCard[] = [
    { id: 'phone', title: 'Téléphone', info: association.phone, note: 'Lundi à vendredi, 9h-18h', icon: phone, href: `tel:${association.phone.replaceAll(' ', '')}`, linkTitle: `Appeler ${association.name}` },
    { id: 'email', title: 'Email', info: association.email, note: 'Réponse sous 24-48h', icon: envelope, href: `mailto:${association.email}`, linkTitle: `Écrire à ${association.name}` },
    { id: 'address', title: 'Adresse', info: city, note: 'Siège social (fictif)', icon: locationDot, href: `https://www.openstreetmap.org/search?query=${encodeURIComponent(city)}`, linkTitle: 'Voir la ville sur OpenStreetMap', external: true },
]

/**
 * Details of the association (original design): on a large screen an illustration on a dark rounded block on the left,
 * then the title and the three green cards (phone, e-mail, address), each a link. The details are fictional.
 * Fixed from the original: the title of this part was never shown (its reveal never started).
 */
export default function ContactDetails() {
    const [ref, visible] = useReveal<HTMLUListElement>()

    return (
        <div className="contact-wrapper">
            <div className="contact-image-wrapper" aria-hidden="true">
                <div className="contact-image-layered">
                    <div className="contact-bg">
                        <SiteImage className="contact-img" src="/photos/support/contact" sizes="(max-width: 1024px) 320px, 400px" alt="Bénévole au téléphone prenant des notes à son bureau" title="Nous contacter" width="400" height="400" />
                    </div>
                </div>
            </div>

            <div className="contact-section">
                <SectionIntro title="Nous joindre" align="left" titleClass="text-xlarge">
                    <p>Par téléphone, par e-mail ou <mark>de passage à Lyon</mark>.</p>
                </SectionIntro>
                <ul ref={ref} className={cx('contact-cards', visible && 'is-visible')}>
                    {cards.map((card) => (
                        <li key={card.id}>
                            <a href={card.href} title={card.linkTitle} className="contact-card"
                                {...(card.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                                <span className="contact-icon" aria-hidden="true"><Icon icon={card.icon} /></span>
                                <span className="contact-text gap-xxs">
                                    <strong>{card.title}</strong>
                                    <strong>{card.info}</strong>
                                    <span>{card.note}</span>
                                </span>
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}
