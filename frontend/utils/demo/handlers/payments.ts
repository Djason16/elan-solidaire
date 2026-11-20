import type { Route, RouteContext } from '../routeTypes'
import { donationProjects, membershipPlans, planOf } from '../../content/programs'
import { parcelWeight, stockOf } from '../../products'
import { roundCents, shippingCost } from '../../shipping'
import { checkoutRules, donationRules, membershipRules, validate } from '../../validation'
import { hashPassword, randomToken } from '../crypto'
import { DemoError, assertValid } from '../errors'
import { donationMail, membershipMail, orderMail, transferMail } from '../mail'
import { change, getDatabase, nextId, now } from '../storage'
import { subscribe } from './catalog'
import type { Database, Donation, Mail, Membership, Order, PayableKind } from '../../types'

/**
 * Routes that create something to pay (donation, membership, order) and the simulated payment confirmation.
 *
 * Flow, the same as with Stripe or PayPal on a real API:
 *   1. POST /donations (or /memberships, /orders): the record is saved "pending", its amount computed here
 *      (never taken from the browser), and a random paymentToken is returned.
 *   2. The site shows the payment window (components/ui/PaymentDialog), which plays the role of the provider.
 *   3. POST /payments/confirm with the token: the record becomes "completed", the e-mail is returned (never sent).
 * @module utils/demo/handlers/payments
 */

// Table of each kind of payment
const TABLES: Record<PayableKind, 'donations' | 'memberships' | 'orders'> = { donation: 'donations', membership: 'memberships', order: 'orders' }

const clean = (value: unknown) => String(value ?? '').trim()

/**
 * POST /donations
 */
const createDonation = ({ body }: RouteContext) => {
    assertValid(validate(body, donationRules(donationProjects.map((project) => project.id))))
    const donation = change((database) => {
        const id = nextId(database.donations)
        const row: Donation = {
            id,
            fullName: clean(body.fullName),
            email: clean(body.email),
            project: body.project,
            amount: roundCents(Number(body.amount)),
            frequency: body.frequency === 'monthly' ? 'monthly' : 'once',
            paymentMethod: body.paymentMethod,
            paymentStatus: 'pending',
            reference: `DON-${1000 + id}`,
            transactionId: null,
            paymentToken: randomToken(),
            newsletter: Boolean(body.newsletter),
            receiptSent: false,
            createdAt: now(),
        }
        database.donations.unshift(row)
        if (row.newsletter) subscribe(database, row, 'donation')
        return row
    })
    const { id, amount, reference, paymentToken } = donation
    // A transfer is paid later: the e-mail with the bank details goes now
    return { donation: { id, amount, reference, paymentToken }, ...(body.paymentMethod === 'transfer' ? { mail: transferMail(donation) } : {}) }
}

/**
 * POST /memberships. The password of the member space is kept hashed until the payment, then the account is created.
 */
const createMembership = async ({ body }: RouteContext) => {
    assertValid(validate(body, membershipRules(membershipPlans.map((plan) => plan.id))))
    const passwordHash = await hashPassword(body.password)
    const membership = change((database) => {
        const row: Membership = {
            id: nextId(database.memberships),
            userId: null,
            fullName: clean(body.fullName),
            email: clean(body.email),
            phone: clean(body.phone),
            address: clean(body.address),
            birthDate: body.birthDate,
            plan: body.plan,
            amount: planOf(body.plan)?.amount ?? 0,
            paymentMethod: body.paymentMethod,
            paymentStatus: 'pending',
            transactionId: null,
            paymentToken: randomToken(),
            pendingPasswordHash: passwordHash,
            startDate: null,
            endDate: null,
            cardShipped: false,
            newsletter: Boolean(body.newsletter),
            createdAt: now(),
        }
        database.memberships.unshift(row)
        return row
    })
    const { id, amount, paymentToken } = membership
    return { membership: { id, amount, paymentToken } }
}

/**
 * Items of the cart with the prices, names, weights and dimensions of the catalog (the browser only sends ids, sizes
 * and quantities). The stock is checked per size for the clothes.
 * @param items - [{ productId, size, quantity }]
 * @throws Unknown product or size, wrong quantity or not enough stock.
 */
const priceItems = (items: unknown) => {
    if (!Array.isArray(items) || !items.length) throw new DemoError('Le panier est vide')
    const { products } = getDatabase()
    const lines = items.map(({ productId, size = null, quantity }) => {
        const product = products.find((row) => row.id === Number(productId))
        const count = Number(quantity)
        if (!product) throw new DemoError("Un article du panier n’existe plus", 409)
        const sized = Boolean(product.sizes?.length)
        if (sized && !product.sizes?.some((item) => item.label === size)) throw new DemoError(`Choisissez une taille pour « ${product.name} »`)
        if (!Number.isInteger(count) || count < 1 || count > 20) throw new DemoError('Quantité invalide')
        if (count > stockOf(product, size)) throw new DemoError(`Stock insuffisant pour « ${product.name} »${sized ? ` en ${size}` : ''}`, 409)
        return {
            productId: product.id,
            name: product.name,
            size: sized ? size : null,
            price: product.price,
            weight: product.weight,
            dimensions: product.dimensions,
            quantity: count,
        }
    })
    return { lines, subtotal: roundCents(lines.reduce((sum, line) => sum + line.price * line.quantity, 0)) }
}

/**
 * Subtotal, weight charged by the carrier, shipping and total of a cart for a country.
 */
const quote = (country: string, items: unknown) => {
    const { lines, subtotal } = priceItems(items)
    const parcel = parcelWeight(lines)
    const shipping = shippingCost(country, subtotal, parcel.billableKg)
    if (shipping === null) throw new DemoError('Pas de livraison dans ce pays')
    return { lines, subtotal, parcel, shipping, total: roundCents(subtotal + shipping) }
}

/**
 * POST /orders
 */
const createOrder = ({ body }: RouteContext) => {
    assertValid(validate(body, checkoutRules))
    const { lines, subtotal, parcel, shipping, total } = quote(body.country, body.items)
    const order = change((database) => {
        const row: Order = {
            id: nextId(database.orders),
            fullName: clean(body.fullName),
            email: clean(body.email),
            phone: clean(body.phone),
            address: clean(body.address),
            postalCode: clean(body.postalCode),
            city: clean(body.city),
            country: clean(body.country),
            items: lines,
            subtotal,
            parcel,
            shipping,
            total,
            paymentMethod: body.paymentMethod,
            paymentStatus: 'pending',
            transactionId: null,
            paymentToken: randomToken(),
            shipped: false,
            createdAt: now(),
        }
        database.orders.unshift(row)
        return row
    })
    return { order: { id: order.id, total: order.total, paymentToken: order.paymentToken } }
}

/**
 * What happens once a record is paid: membership dates and account, stock of the products, newsletter.
 * @returns The e-mail to show.
 */
const afterPayment = (database: Database, kind: PayableKind, record: Donation | Membership | Order): Mail => {
    if (kind === 'donation') {
        // The fundraiser in progress grows with every paid donation
        database.fundraiser.raised = Math.round((database.fundraiser.raised + (record as Donation).amount) * 100) / 100
        return donationMail(record as Donation)
    }
    if (kind === 'order') {
        const order = record as Order
        order.items.forEach((line) => {
            const product = database.products.find((row) => row.id === line.productId)
            if (!product) return
            const size = product.sizes?.find((item) => item.label === line.size)
            if (size) size.stock = Math.max(0, size.stock - line.quantity)
            product.stock = product.sizes?.length ? stockOf(product) : Math.max(0, product.stock - line.quantity)
        })
        // The carrier takes over from here (utils/demo/orderTracking.js)
        order.paidAt = now()
        return orderMail(order)
    }
    const membership = record as Membership
    const start = now().slice(0, 10)
    membership.startDate = start
    membership.endDate = `${Number(start.slice(0, 4)) + 1}${start.slice(4)}`
    let user = database.users.find((row) => row.email.toLowerCase() === record.email.toLowerCase())
    if (!user) {
        user = { id: nextId(database.users), name: record.fullName, email: record.email, role: 'member', passwordHash: membership.pendingPasswordHash ?? '', createdAt: now() }
        database.users.push(user)
    }
    membership.userId = user.id
    delete membership.pendingPasswordHash
    // The new member is logged in right away, like after a sign-up
    if (user.role === 'member') database.sessionUserId = user.id
    if (membership.newsletter) subscribe(database, membership, 'membership')
    return membershipMail(membership)
}

/**
 * POST /payments/confirm: the answer of the (simulated) payment provider.
 * `outcome: 'declined'` plays a card refused by the bank.
 * @throws 404 unknown record or wrong token, 409 already paid, 402 declined.
 */
const confirmPayment = ({ body }: RouteContext) => {
    const table = TABLES[body.kind as PayableKind]
    if (!table || !['card', 'paypal'].includes(body.method)) throw new DemoError('Paiement invalide')
    return change((database) => {
        const record = database[table].find((row) => row.id === Number(body.id))
        // Same answer for an unknown id and a wrong token: nobody can guess the records of others
        if (!record || record.paymentToken !== body.token) throw new DemoError('Paiement introuvable', 404)
        if (record.paymentStatus === 'completed') throw new DemoError('Ce paiement est déjà validé', 409)
        if (body.outcome === 'declined') {
            record.paymentStatus = 'failed'
            throw new DemoError('Paiement refusé par la banque (simulation)', 402)
        }
        record.paymentMethod = body.method
        record.paymentStatus = 'completed'
        record.transactionId = `${body.method === 'paypal' ? 'PAYID' : 'pi'}_demo_${randomToken().slice(0, 12)}`
        return { status: 'completed', mail: afterPayment(database, body.kind, record) }
    })
}

/** Routes of this file: [method, path, handler]. */
export const paymentRoutes: Route[] = [
    ['POST', '/donations', createDonation],
    ['POST', '/memberships', createMembership],
    ['POST', '/orders/shipping', ({ body }: RouteContext) => {
        const { subtotal, parcel, shipping, total } = quote(body.country, body.items)
        return { subtotal, parcel, shipping, total }
    }],
    ['POST', '/orders', createOrder],
    ['POST', '/payments/confirm', confirmPayment],
]
