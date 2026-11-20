/** Records of the demo database: orders, donations, memberships, accounts, messages. */
import type { Dimensions, Event, Fundraiser, MediaItem, Parcel, Place, Product } from './typesCatalog'
import type { Role, PaymentMethod, PaymentStatus } from './typesBase'

export interface OrderItem {
    productId: number
    name: string
    size: string | null
    price: number
    weight: number
    dimensions: Dimensions
    quantity: number
}

export type OrderStatus = 'awaiting' | 'paid' | 'preparing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
export type ManualOrderStatus = 'cancelled' | 'refunded'

export interface Order {
    id: number
    fullName: string
    email: string
    phone: string
    address: string
    postalCode: string
    city: string
    country: string
    items: OrderItem[]
    subtotal: number
    parcel?: Parcel
    shipping: number
    total: number
    paymentMethod: PaymentMethod
    paymentStatus: PaymentStatus
    transactionId: string | null
    paymentToken: string
    shipped: boolean
    createdAt: string
    paidAt?: string
    manualStatus?: ManualOrderStatus
    manualAt?: string
}

export interface OrderHistoryStep {
    status: OrderStatus
    label: string
    at: string
}

/** An order with its status computed from the time (utils/demo/orderTracking.ts). */
export type TrackedOrder = Omit<Order, 'paymentToken'> & {
    status: OrderStatus
    statusLabel: string
    history: OrderHistoryStep[]
    trackingNumber?: string | null
    trackingUrl?: string | null
}

export interface Donation {
    id: number
    fullName: string
    email: string
    phone?: string
    address?: string
    postalCode?: string
    city?: string
    project: string
    amount: number
    frequency?: 'once' | 'monthly'
    paymentMethod: PaymentMethod
    paymentStatus: PaymentStatus
    reference: string
    transactionId: string | null
    paymentToken: string
    newsletter: boolean
    receiptSent: boolean
    createdAt: string
}

export interface Membership {
    id: number
    userId: number | null
    fullName: string
    email: string
    phone: string
    address: string
    postalCode?: string
    city?: string
    birthDate: string
    plan: string
    amount: number
    paymentMethod: PaymentMethod
    paymentStatus: PaymentStatus
    transactionId: string | null
    paymentToken: string
    pendingPasswordHash?: string
    startDate: string | null
    endDate: string | null
    cardShipped: boolean
    newsletter: boolean
    createdAt: string
}

/** A record as the API shows it: payment secrets removed. */
export type PublicRecord<T> = Omit<T, 'paymentToken' | 'pendingPasswordHash'>
export type PublicDonation = PublicRecord<Donation>
export type PublicMembership = PublicRecord<Membership>
export type PublicOrder = PublicRecord<Order>

/** Registration of a visitor to an event, as the member space shows it. */
export interface RegistrationSummary {
    id: number
    createdAt: string
    title: string
    slug?: string
    date?: string
    time?: string
    place?: string
}

export interface Registration {
    id: number
    eventId: number
    fullName: string
    email: string
    createdAt: string
}

export interface User {
    id: number
    name: string
    email: string
    role: Role
    passwordHash: string
    createdAt: string
}

export type PublicUser = Pick<User, 'id' | 'name' | 'email' | 'role'>

export interface ContactMessage {
    id: number
    fullName: string
    email: string
    phone?: string
    address?: string
    postalCode?: string
    city?: string
    subject: string
    message: string
    createdAt: string
}

export interface Subscriber {
    id: number
    fullName: string
    email: string
    source: string
    isActive: boolean
    unsubscribeToken: string
    subscribedAt: string
}

export interface Campaign {
    id: number
    subject: string
    body: string
    recipients: number
    sentAt: string
}

export interface PasswordReset {
    userId: number
    tokenHash: string
    expiresAt: number
}

/** The whole demo database (localStorage). */
export interface Database {
    version: number
    users: User[]
    products: Product[]
    locations: Place[]
    media: MediaItem[]
    donations: Donation[]
    memberships: Membership[]
    orders: Order[]
    messages: ContactMessage[]
    subscribers: Subscriber[]
    campaigns: Campaign[]
    events: Event[]
    registrations: Registration[]
    fundraiser: Fundraiser
    passwordResets: PasswordReset[]
    sessionUserId: number | null
}

/** Answer of GET /account. */
export interface AccountData {
    user: PublicUser
    memberships: PublicMembership[]
    donations: PublicDonation[]
    orders: TrackedOrder[]
    registrations: RegistrationSummary[]
}
