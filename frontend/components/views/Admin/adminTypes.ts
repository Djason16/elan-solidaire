import type { ReactNode } from 'react'
import type { Column } from '@/components/ui/DataList/DataList'
import type { FieldOption } from '@/components/ui/FormField/FormField'
import type {
    ContactMessage, Event, MediaItem, Place, Product, PublicDonation, PublicMembership, TrackedOrder,
} from '@/utils/types'
import type { Rules } from '@/utils/validation'

/**
 * Types of the settings of the admin lists (adminCatalogConfig.tsx, adminRecordsConfig.tsx). A setting is written
 * for the real kind of row (Place, Product...); the screens, which work for every kind, read it as a CatalogRow or
 * a RecordRow.
 * @module components/views/Admin/adminTypes
 */

export type CatalogKind = 'locations' | 'events' | 'media' | 'products'
export type CatalogRow = Place | Event | MediaItem | Product

export type RecordKind = 'donations' | 'memberships' | 'orders' | 'messages'
export type RecordRow = PublicDonation | PublicMembership | TrackedOrder | ContactMessage

/** A field of the add / edit form. */
export interface FieldConfig {
    name: string
    label?: string
    type?: string
    placeholder?: string
    hint?: string
    step?: string
    min?: number
    half?: boolean
    third?: boolean
    options?: FieldOption[]
}

/** Settings of an editable list (places, events, photos, products). */
export interface CatalogConfig<R extends { id: number }> {
    table: CatalogKind
    endpoint: string
    responseKey: string
    singular: string
    addTitle: string
    intro: ReactNode
    summary: (rows: R[]) => string
    rules: Rules
    image?: string
    imageLabel?: string
    empty: Record<string, unknown>
    toForm?: (row: R) => Record<string, unknown>
    fields: FieldConfig[]
    columns: Column<R>[]
}

export interface RecordFilter {
    field: string
    label: string
    options: [string, string][]
}

/** Settings of a list of records (donations, memberships, orders, messages). */
export interface RecordsConfig<R extends { id: number }> {
    title: string
    summary: (rows: R[]) => string
    searchFields: string[]
    filters: RecordFilter[]
    columns: Column<R>[]
    action?: { label: string, field: string, endpoint: (row: R) => string, confirm: (row: R) => string }
    statusActions?: { status: 'cancelled' | 'refunded', label: string, confirm: (row: R) => string }[]
    exportEndpoint?: string
    note?: string
}
