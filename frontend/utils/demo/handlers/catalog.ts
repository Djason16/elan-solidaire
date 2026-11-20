import type { Route, RouteContext } from '../routeTypes'
import { contactRules, newsletterRules, validate } from '../../validation'
import { DemoError, assertValid } from '../errors'
import { contactMail } from '../mail'
import { change, getDatabase, nextId, now } from '../storage'
import { randomToken } from '../crypto'
import { requireAdmin } from '../session'
import type { Database, Product } from '../../types'

/**
 * Public routes of the demo API: shop catalog, map, gallery, contact form and newsletter.
 * @module utils/demo/handlers/catalog
 */

const SORTS: Record<string, (a: Product, b: Product) => number> = {
    popular: (a, b) => (b.popularity ?? 0) - (a.popularity ?? 0),
    'price-asc': (a, b) => a.price - b.price,
    'price-desc': (a, b) => b.price - a.price,
    newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
}

// Accents and case ignored by the search: "velo" finds "Vélo"
const normalize = (text: string | undefined) => String(text ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

/**
 * GET /products: filtered, sorted and paginated catalog.
 * @param request
 */
const listProducts = ({ query }: RouteContext) => {
    const { products } = getDatabase()
    const search = normalize(query.search).trim()
    const limit = Math.min(48, Math.max(1, Number(query.limit) || 9))
    const filtered = products
        .filter((product) => !query.category || product.category === query.category)
        .filter((product) => !search || normalize(`${product.name} ${product.description}`).includes(search))
        .sort(SORTS[query.sort ?? ''] ?? SORTS['popular'])
    const pages = Math.max(1, Math.ceil(filtered.length / limit))
    const page = Math.min(pages, Math.max(1, Number(query.page) || 1))

    return {
        products: filtered.slice((page - 1) * limit, page * limit),
        total: filtered.length,
        page,
        pages,
        categories: [...new Set(products.map((product) => product.category))].sort(),
    }
}

/**
 * GET /products/{id}
 * @throws 404 for an unknown product.
 */
const getProduct = ({ params }: RouteContext) => {
    // By number or by readable address (/products/t-shirt-elan-coton-bio)
    const product = getDatabase().products.find((row) => row.id === Number(params.id) || row.slug === params.id)
    if (!product) throw new DemoError('Produit introuvable', 404)
    return { product }
}

/**
 * GET /locations: active places of the map and their totals (every place with ?all=1, admin only).
 */
const listLocations = ({ query }: RouteContext) => {
    // ?all=1: the admin also sees the hidden places
    if (query.all) requireAdmin()
    const locations = getDatabase().locations.filter((location) => query.all || location.isActive)
    return {
        locations,
        stats: {
            countries: new Set(locations.map((location) => location.country)).size,
            cities: locations.length,
            centers: locations.reduce((sum, location) => sum + Number(location.centers), 0),
            children: locations.reduce((sum, location) => sum + Number(location.children), 0),
        },
    }
}

/**
 * POST /contact: saves the message and returns the acknowledgement e-mail (never sent).
 */
const sendContact = ({ body }: RouteContext) => {
    assertValid(validate(body, contactRules))
    const message = change((database) => {
        const row = {
            id: nextId(database.messages),
            fullName: body.fullName.trim(),
            email: body.email.trim(),
            phone: body.phone?.trim() ?? '',
            subject: body.subject.trim(),
            message: body.message.trim(),
            createdAt: now(),
        }
        database.messages.unshift(row)
        return row
    })
    return { message: 'Message envoyé', mail: contactMail(message) }
}

/**
 * Adds an e-mail address to the newsletter, or reactivates it. Also used by donations and memberships.
 * @param database - Demo database (inside change()).
 * @param person
 * @param source - Where the subscription comes from.
 */
export const subscribe = (database: Database, { fullName, email }: { fullName: string, email: string }, source: string): void => {
    const existing = database.subscribers.find((row) => row.email.toLowerCase() === email.toLowerCase())
    if (existing) {
        existing.isActive = true
        return
    }
    database.subscribers.unshift({
        id: nextId(database.subscribers),
        fullName,
        email,
        source,
        isActive: true,
        unsubscribeToken: randomToken(),
        subscribedAt: now(),
    })
}

/**
 * POST /newsletter. The same answer whether the address was already subscribed or not
 * (nobody can learn who is subscribed).
 */
const subscribeNewsletter = ({ body }: RouteContext) => {
    assertValid(validate(body, newsletterRules))
    change((database) => subscribe(database, { fullName: body.fullName.trim(), email: body.email.trim() }, 'form'))
    return { message: 'Inscription enregistrée' }
}

/**
 * GET /newsletter/unsubscribe?token=: the link of every newsletter e-mail.
 */
const unsubscribe = ({ query }: RouteContext) => {
    const done = change((database) => {
        const subscriber = database.subscribers.find((row) => row.unsubscribeToken === query.token)
        if (subscriber) subscriber.isActive = false
        return Boolean(subscriber)
    })
    if (!done) throw new DemoError('Lien de désinscription invalide', 404)
    return { message: 'Désinscription enregistrée' }
}

/** Routes of this file: [method, path, handler]. */
export const catalogRoutes: Route[] = [
    ['GET', '/products', listProducts],
    ['GET', '/products/{id}', getProduct],
    ['GET', '/locations', listLocations],
    ['GET', '/media', () => ({ media: getDatabase().media })],
    ['POST', '/contact', sendContact],
    ['POST', '/newsletter', subscribeNewsletter],
    ['GET', '/newsletter/unsubscribe', unsubscribe],
]
