import type { RequestBody, Route, RouteContext } from '../routeTypes'
import { eventRules, locationRules, mediaRules, productRules, validate } from '../../validation'
import { parseSizes, sizesToText } from '../../products'
import { DemoError, assertValid } from '../errors'
import { requireAdmin } from '../session'
import { change, nextId, now } from '../storage'
import { uniqueSlug } from '../../slugify'
import type { Database, Product } from '../../types'
import type { Rules } from '../../validation'

/**
 * Create, update and delete routes of the admin for the shop products, the map places and the gallery.
 * One generic editor (crudRoutes) is configured per table.
 * @module utils/demo/handlers/adminCatalog
 */

// Images sent by the admin: compressed to WebP in the browser (utils/image.js), checked again here
const IMAGE_DATA_URL = /^data:image\/(webp|png|jpeg);base64,[A-Za-z0-9+/=]+$/
const MAX_IMAGE_LENGTH = 700_000

/**
 * Checks an image sent as a data URL: real image type and size, like the first bytes check of a real API.
 * @param image
 * @throws 400 not an image, 413 too large.
 */
const checkImage = (image: string) => {
    if (!IMAGE_DATA_URL.test(image)) throw new DemoError('Image invalide : JPEG, PNG ou WebP seulement')
    if (image.length > MAX_IMAGE_LENGTH) throw new DemoError('Image trop lourde (500 Ko au plus)', 413)
}

const toNumber = (value: unknown) => Number(value)
const sameForm = (row: Row): AnyRow => ({ ...row })
const sameRow = (row: AnyRow): AnyRow => row
const toText = (value: unknown) => String(value ?? '').trim()

/**
 * Table settings: validation rules, fields kept from the request (and how to convert them), defaults of a new row.
 * `image` is the field holding an image (data URL, or a path of public/ already saved).
 */
type CrudTable = 'products' | 'locations' | 'events' | 'media'
/** A row of one of the editable tables. */
type Row = Database[CrudTable][number]
/** The same row as a plain record of fields, to build and merge it field by field. */
type AnyRow = Record<string, unknown>

interface TableSettings {
    key: string
    rules: Rules
    fields: Record<string, (value: unknown) => unknown>
    image?: string
    create: (database: Database, body: RequestBody) => AnyRow
    toForm: (row: Row) => AnyRow
    toRow: (row: AnyRow) => AnyRow
}

const TABLES: Record<CrudTable, TableSettings> = {
    products: {
        key: 'product',
        rules: productRules,
        fields: { name: toText, price: toNumber, category: toText, stock: toNumber, weight: toNumber, length: toNumber, width: toNumber, height: toNumber, sizes: toText, description: toText },
        image: 'image',
        // A new product gets its readable address from its name (kept when the name changes later: links stay valid)
        create: (database, body) => ({ popularity: 50, createdAt: now(), slug: uniqueSlug(body.name, database.products.map((row) => row.slug)) }),
        // The form has flat fields (length, width, height, "S:8, M:12"); the product keeps an object and a list
        toForm: (row) => ({ ...row, ...(row as Product).dimensions, sizes: sizesToText((row as Product).sizes) }),
        toRow: ({ length, width, height, sizes, ...row }) => {
            const list = parseSizes(sizes)
            return { ...row, dimensions: { length, width, height }, sizes: list, stock: list ? list.reduce((sum, size) => sum + size.stock, 0) : row.stock }
        },
    },
    locations: {
        key: 'location',
        rules: locationRules,
        fields: { city: toText, country: toText, latitude: toNumber, longitude: toNumber, centers: toNumber, children: toNumber, program: toText, isActive: Boolean },
        create: () => ({ isActive: true, program: 'water' }),
        toForm: sameForm,
        toRow: sameRow,
    },
    events: {
        key: 'event',
        rules: eventRules,
        fields: { title: toText, date: toText, time: toText, place: toText, capacity: toNumber, description: toText, isPublished: Boolean },
        // A new event gets its readable address from its title, and no registration yet
        create: (database, body) => ({ registered: 0, image: '/photos/gallery/volunteers', imageAlt: 'Bénévoles de l’association', slug: uniqueSlug(body.title, database.events.map((row) => row.slug)) }),
        toForm: sameForm,
        toRow: sameRow,
    },
    media: {
        key: 'media',
        rules: mediaRules,
        fields: { title: toText, alt: toText },
        image: 'src',
        create: () => ({ createdAt: now() }),
        toForm: sameForm,
        toRow: sameRow,
    },
}

/**
 * Fields of the request kept for a table, converted to their type (anything else is ignored).
 */
const pick = (settings: TableSettings, body: RequestBody) => Object.fromEntries(
    Object.entries(settings.fields).filter(([field]) => field in body).map(([field, convert]) => [field, convert(body[field])]),
)

/**
 * Image of the request, checked; undefined when the request does not change it.
 */
const imageOf = (settings: TableSettings, body: RequestBody): string | undefined => {
    const image = settings.image && body[settings.image]
    if (!image || image.startsWith('/images/') || image.startsWith('/photos/')) return undefined
    checkImage(image)
    return image
}

/**
 * The POST, PUT and DELETE routes of one table.
 * @param table - Table of the demo database (also the path: /products).
 * @returns Routes [method, path, handler].
 */
const crudRoutes = (table: CrudTable): Route[] => {
    const settings = TABLES[table]
    const findIndex = (database: Database, id: string) => {
        const index = database[table].findIndex((row) => row.id === Number(id))
        if (index < 0) throw new DemoError('Élément introuvable', 404)
        return index
    }

    const create = ({ body }: RouteContext) => {
        requireAdmin()
        assertValid(validate(body, settings.rules))
        const image = imageOf(settings, body)
        if (settings.image && !image) throw new DemoError('Ajoutez une image')
        return change((database) => {
            const row = settings.toRow({ id: nextId(database[table]), ...settings.create(database, body), ...pick(settings, body), ...(image && settings.image ? { [settings.image]: image } : {}) }) as unknown as Row
            ;(database[table] as Row[]).unshift(row)
            return { [settings.key]: row }
        })
    }

    const update = ({ params, body }: RouteContext) => {
        requireAdmin()
        return change((database) => {
            const index = findIndex(database, params.id ?? '')
            const current = database[table][index]
            if (!current) throw new DemoError('Élément introuvable', 404)
            const merged = { ...settings.toForm(current), ...pick(settings, body) }
            assertValid(validate(merged, settings.rules))
            const image = imageOf(settings, body)
            // The new image replaces the old one only once it is checked: a refused image leaves everything in place
            const updated = settings.toRow({ ...merged, ...(image && settings.image ? { [settings.image]: image } : {}) }) as unknown as Row
            ;(database[table] as Row[])[index] = updated
            return { [settings.key]: updated }
        })
    }

    const remove = ({ params }: RouteContext) => {
        requireAdmin()
        return change((database) => {
            const [row] = database[table].splice(findIndex(database, params.id ?? ''), 1)
            return { id: row?.id }
        })
    }

    return [
        ['POST', `/${table}`, create],
        ['PUT', `/${table}/{id}`, update],
        ['DELETE', `/${table}/{id}`, remove],
    ]
}

/** Routes of this file: [method, path, handler]. */
export const adminCatalogRoutes: Route[] = (Object.keys(TABLES) as CrudTable[]).flatMap(crudRoutes)
