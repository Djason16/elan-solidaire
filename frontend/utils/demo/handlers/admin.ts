import type { Route, RouteContext } from '../routeTypes'
import { projectTitle } from '../../content/programs'
import { campaignRules, validate } from '../../validation'
import { DemoError, assertValid } from '../errors'
import { requireAdmin } from '../session'
import { change, getDatabase, nextId, now } from '../storage'
import { adminCatalogRoutes } from './adminCatalog'
import { MANUAL_STATUSES, withTracking } from '../orderTracking'
import type { PaymentStatus } from '../../types'

/**
 * Administration routes of the demo API: dashboard, records (donations, members, orders, messages),
 * CSV export and newsletter. Every handler starts with requireAdmin().
 * @module utils/demo/handlers/admin
 */

// Payment details never leave the API, even for an admin
const withoutSecrets = <T extends { paymentToken: string, pendingPasswordHash?: string }>({ paymentToken, pendingPasswordHash, ...row }: T): Omit<T, 'paymentToken' | 'pendingPasswordHash'> => row

/**
 * GET /admin/overview: totals of the dashboard and amounts of the last 12 months.
 */
// Date (YYYY-MM-DD) in some days
const inDays = (days: number) => new Date(Date.now() + days * 86400000).toISOString().slice(0, 10)

const overview = () => {
    requireAdmin()
    const database = getDatabase()
    const paid = <T extends { paymentStatus: PaymentStatus }>(rows: T[]) => rows.filter((row) => row.paymentStatus === 'completed')
    const donations = paid(database.donations)
    const orders = paid(database.orders)
    const sum = <K extends string>(rows: Record<K, number>[], field: K) => Math.round(rows.reduce((total, row) => total + Number(row[field]), 0) * 100) / 100

    // The 12 months before today, oldest first: "2026-11"
    const today = new Date()
    const months = Array.from({ length: 12 }, (_, i) => {
        const date = new Date(today.getFullYear(), today.getMonth() - 11 + i, 1)
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    })
    const inMonth = <T extends { createdAt: string }>(rows: T[], month: string) => rows.filter((row) => row.createdAt.startsWith(month))

    return {
        totals: {
            donations: sum(donations, 'amount'),
            donationsCount: donations.length,
            pendingTransfers: database.donations.filter((row) => row.paymentStatus === 'pending' && row.paymentMethod === 'transfer').length,
            members: paid(database.memberships).filter((row) => (row.endDate ?? '') >= now().slice(0, 10)).length,
            orders: orders.length,
            ordersAmount: sum(orders, 'total'),
            ordersToShip: orders.map((row) => withTracking(row)).filter((row) => ['paid', 'preparing'].includes(row.status)).length,
            subscribers: database.subscribers.filter((row) => row.isActive).length,
            messages: database.messages.length,
        },
        fundraiser: database.fundraiser,
        // Paid memberships that end within the next 30 days, the soonest first
        expiring: paid(database.memberships)
            .filter((row) => (row.endDate ?? '') >= now().slice(0, 10) && (row.endDate ?? '') <= inDays(30))
            .sort((a, b) => (a.endDate ?? '').localeCompare(b.endDate ?? ''))
            .map(({ id, fullName, email, endDate }) => ({ id, fullName, email, endDate })),
        monthly: months.map((month) => ({
            month,
            donations: sum(inMonth(donations, month), 'amount'),
            orders: sum(inMonth(orders, month), 'total'),
        })),
    }
}

/**
 * Builds the handler of a POST /{table}/{id}/{action} that sets a flag to true (receipt sent, card shipped...).
 * @param table - Table of the demo database.
 * @param field - Boolean field to set.
 * @returns Route handler returning { id }.
 */
const markAs = (table: 'donations' | 'memberships', field: 'receiptSent' | 'cardShipped') => ({ params }: RouteContext) => {
    requireAdmin()
    return change((database) => {
        const rows: { id: number, paymentStatus: PaymentStatus, receiptSent?: boolean, cardShipped?: boolean }[] = database[table]
        const row = rows.find((candidate) => candidate.id === Number(params.id))
        if (!row) throw new DemoError('Élément introuvable', 404)
        if (row.paymentStatus && row.paymentStatus !== 'completed') throw new DemoError('Paiement pas encore reçu', 409)
        row[field] = true
        return { id: row.id }
    })
}

// A cell of a CSV file: quoted, inner quotes doubled, and no formula (=, +, -, @) run by the spreadsheet
const csvCell = (value: unknown) => {
    const text = String(value ?? '')
    return `"${(/^[=+\-@]/.test(text) ? `'${text}` : text).replaceAll('"', '""')}"`
}

/**
 * GET /donations/export: every donation as a CSV file (opened by Excel: ";" and a BOM for the accents).
 */
const exportDonations = () => {
    requireAdmin()
    const header = ['Référence', 'Date', 'Nom', 'E-mail', 'Projet', 'Montant', 'Paiement', 'Statut', 'Reçu envoyé']
    const rows = getDatabase().donations.map((row) => [
        row.reference, row.createdAt, row.fullName, row.email, projectTitle(row.project),
        String(row.amount).replace('.', ','), row.paymentMethod, row.paymentStatus, row.receiptSent ? 'oui' : 'non',
    ])
    const content = '﻿' + [header, ...rows].map((row) => row.map(csvCell).join(';')).join('\r\n')
    return { file: { name: `dons-${now().slice(0, 10)}.csv`, type: 'text/csv;charset=utf-8', content } }
}

/**
 * POST /newsletter/send: saves the campaign and returns the e-mail of the first recipient as a preview.
 * Nothing is sent, even to the active subscribers.
 */
const sendCampaign = ({ body }: RouteContext) => {
    requireAdmin()
    assertValid(validate(body, campaignRules))
    return change((database) => {
        const recipients = database.subscribers.filter((row) => row.isActive)
        const [first] = recipients
        if (!first) throw new DemoError('Aucun abonné actif')
        const campaign = { id: nextId(database.campaigns), subject: body.subject.trim(), body: body.body.trim(), recipients: recipients.length, sentAt: now() }
        database.campaigns.unshift(campaign)
        return {
            campaign,
            recipients: recipients.length,
            mail: { to: first.email, subject: campaign.subject, body: `${campaign.body}\n\nSe désinscrire : /newsletter/unsubscribe?token=${first.unsubscribeToken}` },
        }
    })
}

/**
 * Builds the handler of GET /{table}: every row of a table for the admin.
 * @param table - Table of the demo database, also the key of the response.
 */
const list = (table: 'donations' | 'memberships' | 'orders') => () => {
    requireAdmin()
    const database = getDatabase()
    if (table === 'orders') return { orders: database.orders.map(withoutSecrets).map((row) => withTracking(row)) }
    return { [table]: database[table].map(withoutSecrets) }
}

/**
 * POST /orders/{id}/status: the admin cancels or refunds an order by hand (the other steps are automatic).
 */
const setOrderStatus = ({ params, body }: RouteContext) => {
    requireAdmin()
    if (!MANUAL_STATUSES.includes(body.status)) throw new DemoError('Statut inconnu')
    return change((database) => {
        const order = database.orders.find((row) => row.id === Number(params.id))
        if (!order) throw new DemoError('Commande introuvable', 404)
        order.manualStatus = body.status
        order.manualAt = now()
        return { order: withTracking(withoutSecrets(order)) }
    })
}

/** Routes of this file and of the admin catalog editor: [method, path, handler]. */
export const adminRoutes: Route[] = [
    ['GET', '/admin/overview', overview],
    ['GET', '/donations', list('donations')],
    ['GET', '/donations/export', exportDonations],
    ['GET', '/memberships', list('memberships')],
    ['GET', '/orders', list('orders')],
    ['GET', '/contact', () => {
        requireAdmin()
        return { messages: getDatabase().messages }
    }],
    ['POST', '/donations/{id}/receipt-sent', markAs('donations', 'receiptSent')],
    ['POST', '/memberships/{id}/card-shipped', markAs('memberships', 'cardShipped')],
    ['POST', '/orders/{id}/status', setOrderStatus],
    ['GET', '/newsletter/subscribers', () => {
        requireAdmin()
        return { subscribers: getDatabase().subscribers.map(({ unsubscribeToken, ...row }) => row) }
    }],
    ['GET', '/newsletter', () => {
        requireAdmin()
        return { campaigns: getDatabase().campaigns }
    }],
    ['POST', '/newsletter/send', sendCampaign],
    ...adminCatalogRoutes,
]
