/*
 * Rules of every form, used twice with the same code: by the form before sending (messages under the fields)
 * and by the demo API when it receives the data (utils/demo/), like a real API would check them again.
 *
 *   const errors = validate(values, donationRules)   // { email: 'Adresse e-mail invalide' } or {}
 */
import type { FieldErrors } from './types'

/** A rule: the message when the value is refused, null when it is fine. Gets all the values to compare fields. */
export type Rule = (value: unknown, values?: Record<string, unknown>) => string | null
export type Rules = Record<string, Rule[]>

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE = /^\+?[0-9 .-]{8,20}$/
const POSTAL_CODE = /^[0-9A-Za-z -]{3,10}$/

const required = (label: string): Rule => (value) => (value === undefined || value === null || String(value).trim() === '' ? `${label} est obligatoire` : null)
const maxLength = (max: number): Rule => (value) => (String(value ?? '').length > max ? `${max} caractères au plus` : null)
const pattern = (regex: RegExp, message: string): Rule => (value) => (value && !regex.test(String(value).trim()) ? message : null)
const number = (min: number, max: number, message: string): Rule => (value) => {
    const amount = Number(value)
    return Number.isFinite(amount) && amount >= min && amount <= max ? null : message
}
const oneOf = (values: unknown[], message: string): Rule => (value) => (values.includes(value) ? null : message)
const optional = (rule: Rule): Rule => (value) => (value ? rule(value) : null)

const email: Rule[] = [required('L’adresse e-mail'), pattern(EMAIL, 'Adresse e-mail invalide'), maxLength(120)]
const fullName: Rule[] = [required('Le nom'), maxLength(100)]
const phone: Rule[] = [required('Le téléphone'), pattern(PHONE, 'Numéro de téléphone invalide')]
const password: Rule[] = [required('Le mot de passe'), (value) => (String(value ?? '').length < 10 ? '10 caractères au moins' : null), maxLength(100)]

export const PAYMENT_METHODS = ['card', 'paypal']

export const contactRules: Rules = {
    fullName,
    email,
    phone: [optional(pattern(PHONE, 'Numéro de téléphone invalide'))],
    subject: [required('Le sujet'), maxLength(150)],
    message: [required('Le message'), (value) => (String(value ?? '').trim().length < 20 ? '20 caractères au moins' : null), maxLength(3000)],
}

export const newsletterRules: Rules = { fullName, email }

export const donationRules = (projectIds: string[]): Rules => ({
    fullName,
    email,
    project: [oneOf(projectIds, 'Choisissez un projet')],
    amount: [number(5, 10000, 'Montant entre 5 € et 10 000 €')],
    frequency: [oneOf(['once', 'monthly'], 'Choisissez un don ponctuel ou mensuel')],
    paymentMethod: [oneOf([...PAYMENT_METHODS, 'transfer'], 'Choisissez un moyen de paiement')],
})

/** Registration to an event of the agenda. */
export const registrationRules: Rules = { fullName, email }

/** Event of the agenda (admin). */
export const eventRules: Rules = {
    title: [required('Le titre'), maxLength(120)],
    date: [required('La date'), pattern(/^\d{4}-\d{2}-\d{2}$/, 'Date au format AAAA-MM-JJ')],
    time: [required('L’heure'), pattern(/^\d{2}:\d{2}$/, 'Heure au format HH:MM')],
    place: [required('Le lieu'), maxLength(150)],
    capacity: [number(1, 2000, 'Entre 1 et 2 000 places')],
    description: [required('La description'), maxLength(1000)],
}

export const membershipRules = (planIds: string[]): Rules => ({
    fullName,
    email,
    phone,
    address: [required('L’adresse'), maxLength(200)],
    birthDate: [required('La date de naissance'), (value) => (value && (new Date(String(value)) > new Date(Date.now() - 16 * 365.25 * 864e5)) ? 'Il faut avoir 16 ans au moins' : null)],
    plan: [oneOf(planIds, 'Choisissez une formule')],
    paymentMethod: [oneOf(PAYMENT_METHODS, 'Choisissez un moyen de paiement')],
    password,
})

export const checkoutRules: Rules = {
    fullName,
    email,
    phone,
    address: [required('L’adresse'), maxLength(200)],
    postalCode: [required('Le code postal'), pattern(POSTAL_CODE, 'Code postal invalide')],
    city: [required('La ville'), maxLength(100)],
    country: [required('Le pays')],
    paymentMethod: [oneOf(PAYMENT_METHODS, 'Choisissez un moyen de paiement')],
}

export const loginRules: Rules = { email, password: [required('Le mot de passe')] }
export const forgotRules: Rules = { email }
export const resetRules: Rules = { password }

// Sizes typed in the admin: "S:8, M:12" (a size label, a colon, a whole stock), several separated by commas
const SIZES_TEXT = /^\s*[A-Za-z0-9]{1,4}\s*:\s*\d{1,5}\s*(,\s*[A-Za-z0-9]{1,4}\s*:\s*\d{1,5}\s*)*$/

export const productRules: Rules = {
    name: [required('Le nom'), maxLength(100)],
    price: [number(1, 1000, 'Prix entre 1 € et 1 000 €')],
    category: [required('La catégorie')],
    // With sizes, the stock is the sum of the sizes: the field is then not used
    stock: [(value, values) => (String(values?.sizes ?? '').trim() ? null : number(0, 10000, 'Stock entre 0 et 10 000')(value))],
    weight: [required('Le poids'), number(1, 30000, 'Poids entre 1 g et 30 000 g')],
    length: [required('La longueur'), number(0.1, 200, 'Longueur entre 0,1 et 200 cm')],
    width: [required('La largeur'), number(0.1, 200, 'Largeur entre 0,1 et 200 cm')],
    height: [required('La hauteur'), number(0.1, 200, 'Hauteur entre 0,1 et 200 cm')],
    // Clothes always have sizes; the other products are one size (empty field)
    sizes: [(value, values) => {
        const text = String(value ?? '').trim()
        if (values?.category === 'Vêtements' && !text) return 'Les vêtements ont des tailles : S:8, M:12...'
        if (values?.category !== 'Vêtements' && text) return 'Seuls les vêtements ont des tailles'
        return text && !SIZES_TEXT.test(text) ? 'Format attendu : S:8, M:12, L:5' : null
    }],
    description: [required('La description'), maxLength(1000)],
}

export const locationRules: Rules = {
    city: [required('La ville'), maxLength(100)],
    country: [required('Le pays'), maxLength(100)],
    latitude: [number(-90, 90, 'Latitude entre -90 et 90')],
    longitude: [number(-180, 180, 'Longitude entre -180 et 180')],
    centers: [number(0, 500, 'Entre 0 et 500')],
    children: [number(0, 100000, 'Entre 0 et 100 000')],
}

export const mediaRules: Rules = {
    title: [required('Le titre'), maxLength(100)],
    alt: [required('La description de l’image'), maxLength(200)],
}

export const campaignRules: Rules = {
    subject: [required('Le sujet'), maxLength(150)],
    body: [required('Le message'), maxLength(5000)],
}

/** Error message of each field that breaks a rule (empty object when everything is valid). */
export const validate = (values: Record<string, unknown>, rules: Rules): FieldErrors => {
    const errors: FieldErrors = {}
    for (const [field, fieldRules] of Object.entries(rules)) {
        // A rule gets the value of its field, and all the values for the rules that compare fields
        const message = fieldRules.map((rule) => rule(values[field], values)).find(Boolean)
        if (message) errors[field] = message
    }
    return errors
}
