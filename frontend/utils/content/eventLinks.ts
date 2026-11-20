import type { Event, EventStatus } from '../types'
import { events } from '../demo/seed/extras'

/**
 * Address of an event page. The events of the starting data have their own built page (/evenements/<slug>/); an
 * event added in the admin exists only in this browser and is shown by one shared page (/evenements/apercu/?evenement=<slug>).
 * @module utils/content/eventLinks
 */
const BUILT_SLUGS = new Set(events.map((event) => event.slug))

/** Address of the page of an event. */
export const eventHref = (event: Pick<Event, 'slug'>) => (BUILT_SLUGS.has(event.slug)
    ? `/evenements/${event.slug}/`
    : `/evenements/apercu/?evenement=${encodeURIComponent(event.slug)}`)

/** Slugs of the events that get their own built page. */
export const builtEventSlugs = () => [...BUILT_SLUGS]

const DATE = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })

/**
 * "samedi 13 décembre 2026 à 10 h 00"
 * @param event
 */
export const eventWhen = ({ date, time }: Pick<Event, 'date' | 'time'>) => `${DATE.format(new Date(`${date}T00:00:00Z`))} à ${time.replace(':', ' h ')}`

const MONTH = new Intl.DateTimeFormat('fr-FR', { month: 'short', timeZone: 'UTC' })

/** Day and short month of an event, for the date block of the cards: { day: '13', month: 'déc.' }. */
export const dateParts = ({ date }: Pick<Event, 'date'>) => {
    const value = new Date(`${date}T00:00:00Z`)
    return { day: String(value.getUTCDate()), month: MONTH.format(value) }
}

/** Whether an event is over (its day is before today). */
export const isPast = ({ date }: Pick<Event, 'date'>) => date < new Date().toISOString().slice(0, 10)

/**
 * Status badge of an event: over, full, few places left (an indication, not a count) or open.
 */
export const eventStatus = (event: Pick<Event, 'date' | 'capacity' | 'registered'>): EventStatus => {
    const left = Math.max(0, event.capacity - event.registered)
    if (isPast(event)) return { label: 'Passé', tone: 'past' }
    if (left === 0) return { label: 'Complet', tone: 'full' }
    if (left <= 10) return { label: 'Dernières places', tone: 'few' }
    return { label: 'Places disponibles', tone: 'open' }
}
