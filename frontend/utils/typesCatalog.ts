/** Catalog types: products, cart, places, events, photos, programs. */
import type { OrderHistoryStep, OrderStatus } from './typesRecords'
export interface Dimensions {
    length: number
    width: number
    height: number
}

export interface ProductSize {
    label: string
    stock: number
}

export interface Product {
    id: number
    reference: string
    slug: string
    name: string
    price: number
    category: string
    stock: number
    weight: number
    dimensions: Dimensions
    sizes: ProductSize[] | null
    popularity: number
    image: string
    createdAt: string
    description: string
}

/** A line of the cart: one per product and size. */
export interface CartItem {
    key: string
    productId: number
    slug: string
    size: string | null
    name: string
    price: number
    image: string
    weight: number
    dimensions: Dimensions
    quantity: number
    stock: number
}

export interface Parcel {
    actualKg: number
    volumetricKg: number
    billableKg: number
}

export interface Event {
    id: number
    image: string
    imageAlt: string
    slug: string
    title: string
    date: string
    time: string
    place: string
    capacity: number
    registered: number
    isPublished: boolean
    description: string
}

export interface EventStatus {
    label: string
    tone: 'past' | 'full' | 'few' | 'open'
}

export interface Place {
    id: number
    city: string
    country: string
    latitude: number
    longitude: number
    program: string
    centers: number
    children: number
    isActive: boolean
}

export interface PlaceStats {
    countries: number
    cities: number
    centers: number
    children: number
}

export interface MediaItem {
    id: number
    src: string
    alt: string
    title: string
    createdAt: string
}

export interface Fundraiser {
    title: string
    goal: number
    raised: number
}

export interface Program {
    id: string
    title: string
    text: string
    impact: string
    image: string
}

export interface MembershipPlan {
    id: string
    title: string
    amount: number
    text: string
}

export interface TrackingParcel {
    number: string
    status: OrderStatus
    statusLabel: string
    history: OrderHistoryStep[]
    city: string
}

export interface Link {
    href: string
    label: string
    title: string
}

/** Answers of the API that the pages read at build time or in the browser. */
export interface ProductListData {
    products: Product[]
    total: number
    page: number
    pages: number
    categories: string[]
}

export interface PlaceListData {
    locations: Place[]
    stats: PlaceStats
}
