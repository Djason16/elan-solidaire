import type { ReactNode } from 'react'
import type { IconData } from '@/utils/icons'
import { bagShopping, calendarCheck, cartShopping, circleInfo, envelope, handHoldingHeart, idCard, locationDot, photoFilm, scaleBalanced, shieldHalved } from '@/utils/icons'
import AdminCatalog from './AdminCatalog'
import AdminNewsletter from './AdminNewsletter'
import AdminOverview from './AdminOverview'
import AdminRecords from './AdminRecords'
import AdminSettings from './AdminSettings'

/**
 * Sections of the admin, in the order of the original (plus the dashboard and the messages of the demo).
 * Each one is a real page with a French address: /admin/ for the dashboard, /admin/<slug>/ for the others
 * (/admin/produits/, /admin/dons/... pages/admin/[section].jsx); the ids stay those of the code.
 * @module components/views/Admin/adminSections
 */
export interface AdminSection {
    id: string
    slug: string
    label: string
    icon: IconData
    render: () => ReactNode
}

export const ADMIN_SECTIONS: AdminSection[] = [
    { id: 'overview', slug: '', label: 'Tableau de bord', icon: scaleBalanced, render: () => <AdminOverview /> },
    { id: 'locations', slug: 'lieux', label: 'Localisations', icon: locationDot, render: () => <AdminCatalog kind="locations" /> },
    { id: 'events', slug: 'evenements', label: 'Événements', icon: calendarCheck, render: () => <AdminCatalog kind="events" /> },
    { id: 'media', slug: 'medias', label: 'Médias', icon: photoFilm, render: () => <AdminCatalog kind="media" /> },
    { id: 'products', slug: 'produits', label: 'Boutique', icon: bagShopping, render: () => <AdminCatalog kind="products" /> },
    { id: 'orders', slug: 'commandes', label: 'Commandes', icon: cartShopping, render: () => <AdminRecords kind="orders" /> },
    { id: 'donations', slug: 'dons', label: 'Dons', icon: handHoldingHeart, render: () => <AdminRecords kind="donations" /> },
    { id: 'memberships', slug: 'adhesions', label: 'Adhésions', icon: idCard, render: () => <AdminRecords kind="memberships" /> },
    { id: 'messages', slug: 'messages', label: 'Messages', icon: circleInfo, render: () => <AdminRecords kind="messages" /> },
    { id: 'newsletter', slug: 'newsletters', label: 'Newsletters', icon: envelope, render: () => <AdminNewsletter /> },
    { id: 'settings', slug: 'reglages', label: 'Paramètres', icon: shieldHalved, render: () => <AdminSettings /> },
]

/**
 * Address of a section.
 * @param id
 */
export const sectionHref = (id: string) => {
    const slug = ADMIN_SECTIONS.find((item) => item.id === id)?.slug
    return slug ? `/admin/${slug}/` : '/admin/'
}
