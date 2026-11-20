import { locations, media, products } from './seed/catalog'
import { campaigns, donations, memberships, messages, orders, subscribers, users } from './seed/records'
import { events, fundraiser } from './seed/extras'
import type { Database } from '../types'
import type { TableName } from './routeTypes'

/*
 * The "database" of the demo: the starting data (seed/) plus what the visitor did, kept in localStorage.
 * During the build (no browser) every call reads the starting data, so the exported pages show it in their HTML.
 * SEED_VERSION: increase it whenever the starting data or its shape changes (new photos, new product fields...).
 * Data saved by an older version is replaced by the new starting data when it is read (the visitor's session and
 * changes of the old version are dropped: they could point to files that no longer exist).
 */
const STORAGE_KEY = 'elan-solidaire-demo'
export const SEED_VERSION = 8

const freshDatabase = (): Database => structuredClone<Database>({
    version: SEED_VERSION,
    users,
    products,
    locations,
    media,
    donations,
    memberships,
    orders,
    messages,
    subscribers,
    campaigns,
    events,
    registrations: [],
    fundraiser,
    passwordResets: [],
    // Id of the logged-in user of this browser (the demo "session")
    sessionUserId: null,
})

const inBrowser = () => typeof window !== 'undefined'

// Tables of the database: each one an array of rows with a numeric id
const TABLES: TableName[] = ['users', 'products', 'locations', 'media', 'donations', 'memberships', 'orders', 'messages', 'subscribers', 'campaigns', 'events', 'registrations']
/**
 * Images the pages may show: a photo of public/photos/ (prepared widths, utils/imageLoader.js), a file of
 * public/images/, or a picture compressed in the browser (utils/image.js). Nothing from another site.
 */
export const SAFE_IMAGE = /^(\/photos\/[\w\-/]+|\/images\/[\w\-/]+\.(svg|png|jpe?g|webp)|data:image\/(webp|png|jpeg);base64,[A-Za-z0-9+/=]+)$/

/**
 * Checks the data read back from localStorage before using it: anyone can edit it in the browser tools, so a broken
 * or tampered value must never crash the site nor load an image from elsewhere. Anything unexpected = starting data.
 * @param saved - Parsed content of localStorage.
 * @returns true when the shape is the expected one.
 */
const isValidDatabase = (saved: unknown): saved is Database => {
    if (!saved || typeof saved !== 'object' || (saved as Partial<Database>).version !== SEED_VERSION) return false
    const data = saved as Database
    const rowsOk = TABLES.every((table) => Array.isArray(data[table])
        && data[table].every((row) => row && typeof row === 'object' && Number.isInteger(row.id)))
    if (!rowsOk || !Array.isArray(data.passwordResets)) return false
    // Products and gallery: a prepared photo or an upload, never an old drawing of /images/
    const photoOk = (src: unknown) => SAFE_IMAGE.test(String(src)) && !String(src).startsWith('/images/')
    const imagesOk = data.products.every((product) => photoOk(product.image)) && data.media.every((photo) => photoOk(photo.src))
    const fundraiserOk = Number.isFinite(data.fundraiser?.goal) && Number.isFinite(data.fundraiser?.raised)
    if (!fundraiserOk) return false
    const sessionOk = data.sessionUserId === null || data.users.some((user) => user.id === data.sessionUserId)
    return imagesOk && sessionOk
}

let cache: Database | null = null

const read = (): Database => {
    if (!inBrowser()) return freshDatabase()
    if (cache) return cache
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
        if (isValidDatabase(saved)) {
            cache = saved
            return cache
        }
    } catch {
        // Unreadable: replaced below
    }
    // Older version, tampered or missing data: the starting data of this version, saved at once
    const fresh = freshDatabase()
    write(fresh)
    return fresh
}

const write = (database: Database) => {
    cache = database
    if (!inBrowser()) return
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(database))
    } catch {
        // Storage full or blocked (private window): the demo keeps working until the page is reloaded
    }
}

/** The whole database (read only: use change() to modify it). */
export const getDatabase = (): Database => read()

/** Runs "update" on the database and saves it: change((db) => db.products.push(product)). */
export const change = <T>(update: (database: Database) => T): T => {
    const database = read()
    const result = update(database)
    write(database)
    return result
}

/** Back to the starting data: every donation, order, account and change of the visitor is forgotten. */
export const resetDatabase = () => write(freshDatabase())

/** Next free id of a table. */
export const nextId = (rows: { id: number }[]) => rows.reduce((max, row) => Math.max(max, row.id), 0) + 1

/** Current date as stored in the tables: "2026-11-20 14:05:00". */
export const now = () => {
    const date = new Date()
    const pad = (value: number) => String(value).padStart(2, '0')
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}
