/**
 * Shipping costs of the shop (fictional), used by the cart (estimate) and by the demo API (the amount that counts).
 * The price depends on the zone of the delivery country and on the weight the carrier charges: the larger of the real
 * weight and the volumetric weight (length × width × height in cm / 5000), see utils/products.js parcelWeight().
 * @module utils/shipping
 */

/** Order subtotal from which shipping is free in France (euros). */
export const FREE_SHIPPING_FROM = 60

/** Weight steps of the price list (kg): up to 0.5, 1, 2, 5 kg, then more. */
export const WEIGHT_STEPS = [0.5, 1, 2, 5, Infinity]

/** Zones: countries and price of each weight step (euros). */
export const SHIPPING_ZONES = [
    { id: 'france', label: 'France', countries: ['FR'], prices: [4.9, 6.9, 8.5, 12.9, 19.9], days: '2 à 3 jours ouvrés' },
    { id: 'europe', label: 'Europe proche', countries: ['BE', 'LU', 'DE', 'ES', 'IT'], prices: [9.9, 12.9, 15.9, 22.9, 32.9], days: '4 à 6 jours ouvrés' },
    { id: 'world', label: 'Suisse et Canada', countries: ['CH', 'CA'], prices: [14.9, 19.9, 26.9, 39.9, 59.9], days: '6 à 10 jours ouvrés' },
]

/**
 * Zone of a delivery country.
 * @param country - ISO code.
 */
export const zoneOf = (country: string) => SHIPPING_ZONES.find((zone) => zone.countries.includes(country)) ?? null

/**
 * Shipping cost of an order.
 * @param country - ISO code of the delivery country.
 * @param subtotal - Price of the items (euros).
 * @param billableKg - Weight charged by the carrier (utils/products.js parcelWeight().billableKg).
 * @returns Cost in euros, or null when the country is not delivered.
 */
export const shippingCost = (country: string, subtotal: number, billableKg: number): number | null => {
    const zone = zoneOf(country)
    if (!zone) return null
    if (zone.id === 'france' && subtotal >= FREE_SHIPPING_FROM) return 0
    const step = WEIGHT_STEPS.findIndex((limit) => billableKg <= limit)
    return zone.prices[step] ?? null
}

/**
 * Rounds an amount to the cent (avoids 0.1 + 0.2 = 0.30000000000000004).
 * @param amount
 */
export const roundCents = (amount: number) => Math.round(amount * 100) / 100
