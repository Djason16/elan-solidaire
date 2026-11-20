/** Types of the API: answers, failures, payment window, admin overview, toasts, mails. */
import type { Fundraiser } from './typesCatalog'
import type { PayableKind, ToastType } from './typesBase'
/** Mail previewed in a window (nothing is ever sent). */
export interface Mail {
    to: string
    subject: string
    body: string
    link?: { href: string, label: string }
}

export interface Toast {
    id: number
    message: string
    type: ToastType
    leaving: boolean
}

export type FieldErrors = Record<string, string>

/** Failure of an API call (the API never throws). */
export interface ApiFailure {
    success: false
    error: string
    status?: number
    errors?: FieldErrors
    retryAfter?: number
}

/** Answer of an API call: `{ success: true, ...data }` or a failure. */
export type ApiResult<T extends object = object> = ({ success: true } & T) | ApiFailure

/** Overview of the admin dashboard. */
export interface AdminOverview {
    totals: {
        donations: number
        donationsCount: number
        pendingTransfers: number
        members: number
        orders: number
        ordersAmount: number
        ordersToShip: number
        subscribers: number
        messages: number
    }
    fundraiser: Fundraiser
    expiring: { id: number, fullName: string, email: string, endDate: string | null }[]
    monthly: { month: string, donations: number, orders: number }[]
}

/** What identifies a record to pay in the simulated payment window. */
export interface PaymentTicket {
    kind: PayableKind
    id: number
    token: string
}

export type CardMethod = 'card' | 'paypal'

/** Payment window to open (stores/ui.ts). */
export interface PaymentRequest extends PaymentTicket {
    amount: number
    method: CardMethod
    label: string
}

/** Answer of the payment provider sent to POST /payments/confirm. */
export interface PaymentConfirmation extends PaymentTicket {
    method: CardMethod
    outcome: 'paid' | 'declined'
}

/** Answer of the API once the payment is confirmed. */
export type PaymentResult = { success: true, status: 'completed', mail: Mail }

/** The record created by the API before its payment. */
export interface PayableRecord {
    id: number
    paymentToken: string
    amount?: number
    total?: number
}

/** Options of the confirmation window. */
export interface ConfirmOptions {
    title: string
    text?: string
    confirmLabel?: string
    danger?: boolean
}

export type ApiSuccess<T extends object = object> = { success: true } & T
