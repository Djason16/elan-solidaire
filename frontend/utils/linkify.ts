/**
 * Plain text cut into parts, with the links found in it (legal pages): web addresses, e-mails, phone numbers, names of
 * services that have a site, and mentions of the other pages of the site. No HTML is inserted: the page renders each
 * part itself (components/views/Legal/LegalText.jsx).
 *
 *   linkify('Contact : contact@exemple.fr') // [{ text: 'Contact : ' }, { text: 'contact@exemple.fr', href: 'mailto:...', title: '...' }]
 *
 * @module utils/linkify
 */

import { developer, generator } from './content/site'

// Pages of the site named in the texts (internal links)
interface NamedLink {
    label: string
    href: string
    title: string
}

/** A piece of text, with a link when it names an e-mail, a phone number, a web address, a page or a service. */
export interface LinkPart {
    text: string
    href?: string
    title?: string
    external?: boolean
}

const PAGES: NamedLink[] = [
    { label: 'politique de confidentialité', href: '/confidentialite/', title: 'Lire la politique de confidentialité' },
    { label: 'politique de cookies', href: '/cookies/', title: 'Lire la politique de cookies' },
    { label: 'conditions générales de vente', href: '/cgv/', title: 'Lire les conditions générales de vente' },
    { label: 'mentions légales', href: '/mentions-legales/', title: 'Lire les mentions légales' },
    { label: 'page Contact', href: '/contact/', title: 'Écrire à l’association' },
]
// Services named in the texts (external links)
const SITES: NamedLink[] = [
    { label: 'OpenStreetMap', href: 'https://www.openstreetmap.org/copyright', title: 'OpenStreetMap et ses contributeurs (nouvel onglet)' },
    { label: 'Pexels', href: 'https://www.pexels.com/fr-fr/', title: 'Pexels, banque de photos libres (nouvel onglet)' },
    { label: 'CNIL', href: 'https://www.cnil.fr/', title: 'Site de la CNIL (nouvel onglet)' },
    { label: 'Cloudflare, Inc.', href: 'https://www.cloudflare.com/fr-fr/', title: 'Site de Cloudflare (nouvel onglet)' },
    { label: 'Font Awesome Free', href: 'https://fontawesome.com/', title: 'Font Awesome (nouvel onglet)' },
    { label: developer.name, href: developer.href, title: developer.title },
    { label: generator.name, href: generator.href, title: generator.title },
]
const NAMED = [...PAGES, ...SITES]
const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// In this order: e-mail, full web address, French phone number, named page or service
const PATTERN = new RegExp([
    '[\\w.+-]+@[\\w-]+(?:\\.[\\w-]+)+',
    'https?:\\/\\/[^\\s,;()«»]+',
    '(?:\\+33[\\s\\u00a0]?|\\b0)\\d(?:[ .\\u00a0]?\\d{2}){4}\\b',
    ...NAMED.map((entry) => escape(entry.label)),
].join('|'), 'giu')

/** Link of a match: href, title and whether it opens a new tab. */
const linkOf = (match: string): Omit<LinkPart, 'text'> => {
    const named = NAMED.find((entry) => entry.label.toLowerCase() === match.toLowerCase())
    if (named) return { href: named.href, title: named.title, external: SITES.includes(named) }
    if (match.includes('@')) return { href: `mailto:${match}`, title: `Écrire à ${match}` }
    if (/^(\+33|0)\d/.test(match)) return { href: `tel:${match.replace(/[\s. ]/g, '').replace(/^0/, '+33')}`, title: `Appeler le ${match}` }
    return { href: match, title: `${match.replace(/^https?:\/\//, '')} (nouvel onglet)`, external: true }
}

/**
 * @param text
 */
export const linkify = (text: unknown): LinkPart[] => {
    const source = String(text ?? '')
    const parts: LinkPart[] = []
    let last = 0
    for (const found of source.matchAll(PATTERN)) {
        // A final dot or colon belongs to the sentence, not to the link (unless it is part of a known name: "Inc.")
        const named = NAMED.some((entry) => entry.label.toLowerCase() === found[0].toLowerCase())
        const match = named ? found[0] : found[0].replace(/[.:]+$/, '')
        const index = found.index ?? 0
        if (index > last) parts.push({ text: source.slice(last, index) })
        parts.push({ text: match, ...linkOf(match) })
        last = index + match.length
    }
    if (last < source.length) parts.push({ text: source.slice(last) })
    return parts
}
