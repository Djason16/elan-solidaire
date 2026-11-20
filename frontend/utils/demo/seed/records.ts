import type { PaymentMethod, Campaign, ContactMessage, Donation, Membership, Order, Subscriber, User } from '../../types'
import { products } from './catalog'

/*
 * Starting records of the demo (donations, members, orders, messages, newsletter), built from fixed lists so that
 * every visitor and every build get the same data. All names and addresses are invented.
 *
 * Demo accounts (also written in the README):
 *   admin   admin@elan-solidaire.example   Demo-Admin-2026
 *   member  membre@elan-solidaire.example  Demo-Membre-2026
 * Passwords are kept as SHA-256 of "elan-solidaire:" + password (utils/demo/crypto.js), never in clear.
 */
export const users: User[] = [
    { id: 1, name: 'Camille Admin', email: 'admin@elan-solidaire.example', role: 'admin', passwordHash: '9401380d502862fc6422a2ee9e5bcb58624510c6b0b2c1015a094abe90170a92', createdAt: '2025-01-10 09:00:00' },
    { id: 2, name: 'Léa Martin', email: 'membre@elan-solidaire.example', role: 'member', passwordHash: 'ae42c2e0d5db782d8b7424ad0dc7cd8870076f08a6f4665bb1490c0eec1731c4', createdAt: '2026-02-03 18:20:00' },
]

const firstNames = ['Léa', 'Hugo', 'Inès', 'Lucas', 'Chloé', 'Nathan', 'Manon', 'Yanis', 'Sarah', 'Tom', 'Jade', 'Rayan', 'Louise', 'Adam', 'Emma', 'Noé']
const lastNames = ['Martin', 'Bernard', 'Petit', 'Robert', 'Richard', 'Durand', 'Moreau', 'Laurent', 'Simon', 'Michel', 'Garcia', 'David', 'Bertrand', 'Roux']
const cities: [string, string][] = [['69003', 'Lyon'], ['75011', 'Paris'], ['33000', 'Bordeaux'], ['59000', 'Lille'], ['44000', 'Nantes'], ['31000', 'Toulouse'], ['13001', 'Marseille']]
const projects = ['free', 'water', 'education', 'nutrition', 'health', 'reforestation']
const amounts = [15, 20, 30, 50, 75, 100, 150, 30, 50, 25]
const methods: PaymentMethod[] = ['card', 'card', 'paypal', 'card', 'transfer']

// The n-th fictional person: same input, same person
const pick = <T>(list: T[], index: number): T => list[index % list.length] as T

const person = (n: number) => {
    const first = pick(firstNames, n)
    const last = pick(lastNames, n * 5 + 3)
    const [postalCode, city] = pick(cities, n)
    return {
        fullName: `${first} ${last}`,
        email: `${first}.${last}${n}@exemple.fr`.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''),
        phone: `06 00 00 ${String(10 + (n % 89)).padStart(2, '0')} ${String(10 + ((n * 7) % 89)).padStart(2, '0')}`,
        address: `${1 + (n % 40)} rue de l’Exemple`,
        postalCode,
        city,
    }
}

// A date in the 12 months before 2026-11-15, spread with the index
const dateAt = (n: number, spread = 330) => {
    const date = new Date(Date.UTC(2026, 10, 15, 9 + (n % 9), (n * 13) % 60) - ((n * 37) % spread) * 864e5)
    return date.toISOString().slice(0, 19).replace('T', ' ')
}

const token = (n: number) => (n * 2654435761 % 4294967296).toString(16).padStart(8, '0').repeat(4)

export const donations = Array.from({ length: 48 }, (_, i): Donation => {
    const n = i + 1
    const method = pick(methods, n)
    const pending = method === 'transfer' && n % 3 === 0
    return {
        id: n,
        ...person(n),
        project: pick(projects, n),
        amount: pick(amounts, n),
        paymentMethod: method,
        paymentStatus: pending ? 'pending' : 'completed',
        reference: `DON-${String(1000 + n)}`,
        transactionId: pending ? null : `${method === 'paypal' ? 'PAYID' : 'pi'}_demo_${token(n).slice(0, 12)}`,
        paymentToken: token(n),
        newsletter: n % 2 === 0,
        receiptSent: !pending && n % 4 !== 0,
        createdAt: dateAt(n),
    }
}).sort((a, b) => b.createdAt.localeCompare(a.createdAt))

const plans: [string, number][] = [['standard', 30], ['support', 60], ['benefactor', 120]]

export const memberships = Array.from({ length: 18 }, (_, i): Membership => {
    const n = i + 101
    const [plan, amount] = pick(plans, n)
    const createdAt = dateAt(n, 300)
    const start = createdAt.slice(0, 10)
    const end = `${Number(start.slice(0, 4)) + 1}${start.slice(4)}`
    const isMember = i === 0
    return {
        id: i + 1,
        userId: isMember ? 2 : null,
        ...(isMember ? { ...person(n), fullName: 'Léa Martin', email: 'membre@elan-solidaire.example' } : person(n)),
        birthDate: `19${70 + (n % 30)}-0${1 + (n % 9)}-1${n % 9}`,
        plan,
        amount,
        paymentMethod: n % 3 === 0 ? 'paypal' : 'card',
        paymentStatus: 'completed',
        transactionId: `pi_demo_${token(n).slice(0, 12)}`,
        paymentToken: token(n),
        startDate: start,
        endDate: end,
        cardShipped: n % 3 !== 1,
        newsletter: n % 2 === 0,
        createdAt,
    }
}).sort((a, b) => b.createdAt.localeCompare(a.createdAt))

export const orders = Array.from({ length: 14 }, (_, i): Order => {
    const n = i + 201
    const items = [pick(products, n), pick(products, n * 3)]
        .filter((item, index, list) => list.findIndex((other) => other.id === item.id) === index)
        .map((product, index) => ({ productId: product.id, name: product.name, size: product.sizes ? 'M' : null, price: product.price, weight: product.weight, dimensions: product.dimensions, quantity: 1 + ((n + index) % 2) }))
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const shipping = subtotal >= 60 ? 0 : 4.9
    const buyer = i === 0 ? { ...person(n), fullName: 'Léa Martin', email: 'membre@elan-solidaire.example' } : person(n)
    return {
        id: i + 1,
        ...buyer,
        country: 'FR',
        items,
        subtotal,
        shipping,
        total: Math.round((subtotal + shipping) * 100) / 100,
        paymentMethod: n % 4 === 0 ? 'paypal' : 'card',
        paymentStatus: 'completed',
        transactionId: `pi_demo_${token(n).slice(0, 12)}`,
        paymentToken: token(n),
        shipped: n % 3 !== 0,
        createdAt: dateAt(n, 200),
    }
}).sort((a, b) => b.createdAt.localeCompare(a.createdAt))

const subjects: string[] = ['Devenir bénévole', 'Question sur mon reçu fiscal', 'Partenariat avec une école', 'Don de matériel', 'Organiser une collecte']

export const messages = Array.from({ length: 7 }, (_, i): ContactMessage => ({
    id: i + 1,
    ...person(i + 301),
    subject: pick(subjects, i),
    message: 'Bonjour, je souhaiterais avoir plus d’informations sur ce sujet. Pouvez-vous me recontacter ? Merci et bonne journée.',
    createdAt: dateAt(i + 301, 60),
}))

export const subscribers: Subscriber[] = [...donations, ...memberships]
    .filter((record) => record.newsletter)
    .map((record, i) => ({
        id: i + 1,
        fullName: record.fullName,
        email: record.email,
        source: 'plan' in record ? 'membership' : 'donation',
        isActive: i % 9 !== 0,
        unsubscribeToken: token(i + 401),
        subscribedAt: record.createdAt,
    }))
    .filter((subscriber, index, list) => list.findIndex((other) => other.email === subscriber.email) === index)

export const campaigns: Campaign[] = [
    { id: 1, subject: 'Nouvelles du terrain : les puits de Saint-Louis', body: 'Bonjour,\n\nTrois nouveaux puits fonctionnent depuis ce mois-ci...', recipients: 21, sentAt: '2026-10-05 10:00:00' },
    { id: 2, subject: 'Rentrée scolaire : 800 kits distribués', body: 'Bonjour,\n\nGrâce à vous, 800 enfants ont fait leur rentrée avec un kit complet...', recipients: 19, sentAt: '2026-09-07 10:00:00' },
]
