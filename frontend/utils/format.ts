/**
 * Formatting helpers shared by the views and the demo e-mails (French locale).
 * @module utils/format
 */

const euros = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })
const integers = new Intl.NumberFormat('fr-FR')

/**
 * Amount in euros: 1234.5 -> "1 234,50 €".
 * @param amount
 */
export const formatEuros = (amount: unknown) => euros.format(Number(amount) || 0)

/**
 * Whole number with French thousands separators: 12500 -> "12 500".
 * @param value
 */
export const formatNumber = (value: unknown) => integers.format(Number(value) || 0)

/**
 * Stored date ("2026-11-20 14:05:00" or "2026-11-20") to "20/11/2026".
 * Read from the text, not with Date, so the server build and the browser always print the same day.
 * @param value
 */
export const formatDate = (value: string | null | undefined) => (value ? value.slice(0, 10).split('-').reverse().join('/') : '')

/** Labels of the payment methods and statuses shown in the interface. */
export const paymentLabels: Record<string, string> = {
    card: 'Carte',
    paypal: 'PayPal',
    transfer: 'Virement',
    completed: 'Payé',
    pending: 'En attente',
    failed: 'Refusé',
}

/** Shipping countries of the shop (ISO code: label). */
export const countries: Record<string, string> = {
    FR: 'France',
    BE: 'Belgique',
    CH: 'Suisse',
    LU: 'Luxembourg',
    DE: 'Allemagne',
    ES: 'Espagne',
    IT: 'Italie',
    CA: 'Canada',
}
