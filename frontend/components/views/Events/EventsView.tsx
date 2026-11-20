import type { ApiSuccess, Event } from '@/utils/types'
import SectionIntro from '@/components/ui/SectionIntro/SectionIntro'
import { useApiData } from '@/composables/useApiData'
import { useReveal } from '@/composables/useReveal'
import { isPast } from '@/utils/content/eventLinks'
import { cx } from '@/utils/cx'
import EventCard from './EventCard'

/**
 * Agenda of the association (/evenements/), in the style of the shop: a grid of event cards (stacked on a phone),
 * the coming events first, the past ones apart and greyed. The list is built into the page, then read again from the
 * demo of this browser (registrations, admin changes).
 * @param props
 */
export default function EventsView({ initial }: { initial: ApiSuccess<{ events: Event[] }> }) {
    const { data } = useApiData<{ events: Event[] }>('/events', initial)
    const events = data?.events ?? initial.events
    const coming = events.filter((event) => !isPast(event))
    const past = events.filter(isPast).reverse()
    const [ref, visible] = useReveal<HTMLDivElement>(0.05)
    const [pastRef, pastVisible] = useReveal<HTMLDivElement>(0.05)

    return (
        <>
            <SectionIntro title="Agenda" level={1}>
                <p>Marches, ateliers, soirées : <mark>venez nous rencontrer</mark> et <mark>réservez votre place</mark> en ligne.</p>
            </SectionIntro>
            <div className="page-content agenda">
                <section aria-labelledby="coming-title">
                    <h2 id="coming-title" className="visually-hidden">Prochains événements</h2>
                    <div ref={ref} className={cx('event-grid', visible && 'is-visible')}>
                        {coming.map((event, index) => <EventCard key={event.id} event={event} index={index} priority={index === 0} />)}
                    </div>
                    {coming.length === 0 && <p className="text-normal">Aucun événement prévu pour le moment : revenez bientôt.</p>}
                </section>
                {past.length > 0 && (
                    <section className="agenda-past" aria-labelledby="past-title">
                        <h2 id="past-title" className="section-title text-xlarge">Événements passés</h2>
                        <div ref={pastRef} className={cx('event-grid', pastVisible && 'is-visible')}>
                            {past.map((event, index) => <EventCard key={event.id} event={event} index={index} />)}
                        </div>
                    </section>
                )}
            </div>
        </>
    )
}
