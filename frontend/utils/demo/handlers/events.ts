import type { Route, RouteContext } from '../routeTypes'
import { registrationRules, validate } from '../../validation'
import { DemoError, assertValid } from '../errors'
import { currentUser } from '../session'
import { change, getDatabase, nextId, now } from '../storage'

/**
 * Routes of the fundraiser in progress and of the agenda: list, one event, registration.
 * @module utils/demo/handlers/events
 */

/**
 * GET /fundraiser: the collect in progress (goal, amount raised). A copy: the stores compare by reference, and the
 * saved object is changed in place by the payments.
 */
const getFundraiser = () => ({ fundraiser: { ...getDatabase().fundraiser } })

/**
 * GET /events: events sorted by date; ?all=1 (admin) also returns the unpublished ones.
 */
const listEvents = ({ query }: RouteContext) => {
    const admin = query.all === '1' && currentUser()?.role === 'admin'
    const rows = getDatabase().events.filter((row) => admin || row.isPublished)
    return { events: [...rows].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)) }
}

/** GET /events/{id}: by number or by slug (/events/marche-solidaire-du-parc). */
const getEvent = ({ params }: RouteContext) => {
    const event = getDatabase().events.find((row) => (row.id === Number(params.id) || row.slug === params.id) && row.isPublished)
    if (!event) throw new DemoError('Événement introuvable', 404)
    return { event }
}

/**
 * POST /events/{id}/register: registration with a name and an e-mail, once per e-mail, within the places left.
 */
const register = ({ params, body }: RouteContext) => {
    assertValid(validate(body, registrationRules))
    return change((database) => {
        const event = database.events.find((row) => row.id === Number(params.id) && row.isPublished)
        if (!event) throw new DemoError('Événement introuvable', 404)
        if (event.registered >= event.capacity) throw new DemoError('Il n’y a plus de place pour cet événement.', 409)
        const email = String(body.email).trim().toLowerCase()
        if (database.registrations.some((row) => row.eventId === event.id && row.email === email)) {
            throw new DemoError('Vous êtes déjà inscrit à cet événement avec cette adresse.', 409)
        }
        database.registrations.unshift({ id: nextId(database.registrations), eventId: event.id, fullName: String(body.fullName).trim(), email, createdAt: now() })
        event.registered += 1
        return { event, message: `Inscription confirmée pour « ${event.title} » (démonstration : aucun e-mail envoyé).` }
    })
}

/** Routes of this file: [method, path, handler]. */
export const eventRoutes: Route[] = [
    ['GET', '/fundraiser', getFundraiser],
    ['GET', '/events', listEvents],
    ['GET', '/events/{id}', getEvent],
    ['POST', '/events/{id}/register', register],
]
