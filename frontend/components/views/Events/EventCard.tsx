import type { CSSProperties } from 'react'
import type { Event } from '@/utils/types'
import BaseButton from '@/components/ui/BaseButton/BaseButton'
import Icon from '@/components/ui/Icon/Icon'
import SiteImage from '@/components/ui/SiteImage/SiteImage'
import { dateParts, eventHref, eventStatus } from '@/utils/content/eventLinks'
import { cx } from '@/utils/cx'
import { clock, locationDot } from '@/utils/icons'

/**
 * Card of an event, in the style of the shop cards: photo with the date block (day and month) and the status badge,
 * then the title, the time and the place with the icons of the site, and the button at the bottom.
 * A past event is shown greyed (only its photo: the texts keep their contrast).
 * @param props
 */
export default function EventCard({ event, index = 0, priority = false }: { event: Event, index?: number, priority?: boolean }) {
    const { day, month } = dateParts(event)
    const status = eventStatus(event)

    return (
        <article className={cx('event-card', status.tone === 'past' && 'is-past')} style={{ '--item-index': index } as CSSProperties}>
            <div className="event-image">
                <SiteImage src={event.image ?? '/photos/gallery/volunteers'} alt={event.imageAlt ?? event.title} title={event.title}
                    sizes="(max-width: 600px) 92vw, (max-width: 1024px) 45vw, 30vw" width="640" height="420" priority={priority} />
                <p className="event-date-block" aria-hidden="true"><strong>{day}</strong><span>{month}</span></p>
                <p className={cx('event-badge text-bold', `is-${status.tone}`, 'text-small')}>{status.label}</p>
            </div>
            <div className="event-body">
                <h3 className="event-title text-bold text-large">{event.title}</h3>
                <ul className="event-meta text-normal">
                    <li><Icon icon={clock} /> <span>{dateParts(event).day} {dateParts(event).month} à {event.time.replace(':', '\u00a0h\u00a0')}</span></li>
                    <li><Icon icon={locationDot} /> <span>{event.place}</span></li>
                </ul>
                <BaseButton href={eventHref(event)} title={`Voir l’événement ${event.title}`} squared full variant={status.tone === 'past' ? 'secondary' : 'primary'}>
                    {status.tone === 'past' || status.tone === 'full' ? 'Voir l’événement' : 'S’inscrire'}
                </BaseButton>
            </div>
        </article>
    )
}
