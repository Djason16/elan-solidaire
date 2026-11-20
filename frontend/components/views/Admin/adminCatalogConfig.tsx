import type { Event, MediaItem, Place, Product } from '@/utils/types'
import type { CatalogConfig } from './adminTypes'
import SiteImage from '@/components/ui/SiteImage/SiteImage'
import { programs } from '@/utils/content/programs'
import { productCategories } from '@/utils/demo/seed/catalog'
import { formatEuros, formatNumber } from '@/utils/format'
import { formatDimensions, formatWeight, sizesToText } from '@/utils/products'
import { eventRules, locationRules, mediaRules, productRules } from '@/utils/validation'
import { formatDate } from '@/utils/format'
import { cx } from '@/utils/cx'

/**
 * Settings of the catalog editors of the admin (AdminCatalog, AdminEditor): texts of the "add" card, summary of the
 * folding list, fields of a record, form fields with their rules (the same as the API) and the image field.
 * Field types: those of FormField, plus 'status' (the two "Actif / Inactif" buttons of the original) and 'image' (where
 * the image field goes; at the end when absent).
 * @module components/views/Admin/adminCatalogConfig
 */

const thumbnail = (src: string, alt: string) => <SiteImage className="admin-thumb" src={src} alt={alt} title={alt} width="120" height="120" />
const plural = (count: number, word: string, many = `${word}s`) => `${count} ${count > 1 ? many : word}`

export const catalogConfig: {
    locations: CatalogConfig<Place>
    events: CatalogConfig<Event>
    media: CatalogConfig<MediaItem>
    products: CatalogConfig<Product>
} = {
    locations: {
        table: 'locations',
        endpoint: '/locations',
        responseKey: 'location',
        singular: 'la localisation',
        addTitle: 'Ajouter une localisation',
        intro: <><mark>Placez un nouveau lieu d’action sur la carte</mark> pour les centres partenaires de l’association. Renseignez le <mark>programme</mark>, le <mark>nombre de centres</mark> et d&apos;<mark>enfants accompagnés</mark>.</>,
        summary: (rows) => {
            const active = rows.filter((row) => row.isActive)
            return `${plural(rows.length, 'localisation')} dont ${plural(active.length, 'active')} • ${plural(active.reduce((sum, row) => sum + Number(row.centers), 0), 'centre')} • ${formatNumber(active.reduce((sum, row) => sum + Number(row.children), 0))} enfants`
        },
        rules: locationRules,
        empty: { city: '', country: '', latitude: '', longitude: '', program: 'water', centers: '', children: '', isActive: true },
        fields: [
            { name: 'city', label: 'Ville *', placeholder: 'Saint-Louis' },
            { name: 'country', label: 'Pays *', placeholder: 'Sénégal' },
            { name: 'latitude', label: 'Latitude *', type: 'number', step: 'any', placeholder: '16.03', third: true },
            { name: 'longitude', label: 'Longitude *', type: 'number', step: 'any', placeholder: '-16.48', third: true },
            { name: 'program', label: 'Programme', type: 'select', third: true, options: programs.map((program) => ({ value: program.id, label: program.title })) },
            { name: 'centers', label: 'Nombre de centres *', type: 'number', min: 0, placeholder: '2', half: true },
            { name: 'children', label: 'Nombre d’enfants *', type: 'number', min: 0, placeholder: '150', half: true },
            { name: 'isActive', label: 'Statut', type: 'status' },
        ],
        columns: [
            { key: 'city', label: 'Ville', render: (row) => `${row.city}, ${row.country}` },
            { key: 'program', label: 'Programme', render: (row) => programs.find((program) => program.id === row.program)?.title ?? row.program },
            { key: 'centers', label: 'Centres partenaires' },
            { key: 'children', label: 'Enfants', render: (row) => formatNumber(row.children) },
            { key: 'isActive', label: 'Statut', render: (row) => <span className={cx('badge text-smaller text-semibold', row.isActive ? 'badge-success' : 'badge-warning')}>{row.isActive ? 'Actif' : 'Inactif'}</span> },
        ],
    },
    events: {
        table: 'events',
        endpoint: '/events',
        responseKey: 'event',
        singular: 'l’événement',
        addTitle: 'Nouvel événement',
        intro: <><mark>Annoncez un rendez-vous</mark> : il apparaît dans l’<mark>agenda public</mark> s’il est actif, et les visiteurs s’y <mark>inscrivent en ligne</mark>.</>,
        summary: (rows) => `${plural(rows.length, 'événement')} • ${plural(rows.reduce((sum, row) => sum + Number(row.registered), 0), 'inscription')}`,
        rules: eventRules,
        empty: { title: '', date: '', time: '', place: '', capacity: '', description: '', isPublished: true },
        fields: [
            { name: 'title', label: 'Titre *', placeholder: 'Marche solidaire du parc' },
            { name: 'date', label: 'Date *', type: 'date', placeholder: 'JJ/MM/AAAA', third: true },
            { name: 'time', label: 'Heure *', type: 'time', placeholder: '14:00', third: true },
            { name: 'capacity', label: 'Places *', type: 'number', min: 1, placeholder: '50', third: true },
            { name: 'place', label: 'Lieu *', placeholder: 'Maison des associations, Lyon' },
            { name: 'description', label: 'Description *', type: 'textarea', placeholder: 'Programme, public, ce qu’il faut apporter…' },
            { name: 'isPublished', label: 'Statut', type: 'status' },
        ],
        columns: [
            { key: 'title', label: 'Événement' },
            { key: 'date', label: 'Date', render: (row) => `${formatDate(row.date)} à ${row.time}` },
            { key: 'registered', label: 'Inscrits', render: (row) => `${row.registered} / ${row.capacity}` },
            { key: 'isPublished', label: 'Statut', render: (row) => <span className={cx('badge text-smaller text-semibold', row.isPublished ? 'badge-success' : 'badge-warning')}>{row.isPublished ? 'Publié' : 'Masqué'}</span> },
        ],
    },
    media: {
        table: 'media',
        endpoint: '/media',
        responseKey: 'media',
        singular: 'le média',
        addTitle: 'Nouvelle photo',
        intro: <><mark>Ajoutez une photo</mark> des actions de terrain. Elle apparaît dans la <mark>galerie de l’accueil</mark>. Décrivez-la pour les <mark>personnes malvoyantes</mark>.</>,
        summary: (rows) => `${plural(rows.length, 'média')} dans la galerie`,
        rules: mediaRules,
        image: 'src',
        imageLabel: 'Photo',
        empty: { title: '', alt: '' },
        fields: [
            { name: 'title', label: 'Titre *', placeholder: 'Journée de plantation' },
            { name: 'alt', label: 'Description de l’image *', placeholder: 'Bénévoles qui plantent des arbres' },
        ],
        columns: [
            { key: 'src', label: 'Aperçu', wide: true, render: (row) => thumbnail(row.src, row.alt) },
            { key: 'title', label: 'Titre' },
            { key: 'alt', label: 'Description' },
        ],
    },
    products: {
        table: 'products',
        endpoint: '/products',
        responseKey: 'product',
        singular: 'le produit',
        addTitle: 'Ajouter un produit',
        intro: <><mark>Mettez en vente un article</mark> en précisant son <mark>nom</mark>, <mark>prix</mark>, <mark>stock</mark> et <mark>photo</mark>. Les bénéfices financent les programmes.</>,
        summary: (rows) => {
            const out = rows.filter((row) => Number(row.stock) <= 0).length
            return [`${plural(rows.length, 'produit')} en boutique`, out && `${out} épuisé${out > 1 ? 's' : ''}`].filter(Boolean).join(' • ')
        },
        rules: productRules,
        image: 'image',
        imageLabel: 'Image du produit',
        empty: { name: '', price: '', category: productCategories[0], stock: '', weight: '', length: '', width: '', height: '', sizes: '', description: '' },
        toForm: (row) => ({ ...row, ...row.dimensions, sizes: sizesToText(row.sizes) }),
        fields: [
            { name: 'name', label: 'Nom de l’article *', placeholder: 'Gourde inox 50 cl' },
            { name: 'description', label: 'Description *', type: 'textarea', placeholder: 'Décrivez le produit en quelques lignes…' },
            { name: 'category', label: 'Catégorie *', type: 'select', options: productCategories.map((value) => ({ value, label: value })) },
            { name: 'image', type: 'image' },
            { name: 'price', label: 'Prix (€) *', type: 'number', min: 1, step: '0.1', placeholder: '19.99', third: true },
            { name: 'stock', label: 'Stock (sans tailles)', type: 'number', min: 0, placeholder: '50', third: true, hint: 'Avec des tailles, le stock est leur total' },
            { name: 'weight', label: 'Poids (g) *', type: 'number', min: 1, step: '1', placeholder: '250', third: true },
            { name: 'length', label: 'Longueur (cm) *', type: 'number', min: 0.1, step: '0.1', placeholder: '30', third: true },
            { name: 'width', label: 'Largeur (cm) *', type: 'number', min: 0.1, step: '0.1', placeholder: '25', third: true },
            { name: 'height', label: 'Hauteur (cm) *', type: 'number', min: 0.1, step: '0.1', placeholder: '2', third: true },
            { name: 'sizes', label: 'Tailles et stock (vêtements)', placeholder: 'S:8, M:12, L:5', hint: 'Une taille et son stock, séparés par des virgules. Vide pour une taille unique.' },
        ],
        columns: [
            { key: 'image', label: 'Image', wide: true, render: (row) => thumbnail(row.image, `Photo du produit ${row.name}`) },
            { key: 'name', label: 'Nom' },
            { key: 'category', label: 'Catégorie' },
            { key: 'price', label: 'Prix', render: (row) => formatEuros(row.price) },
            { key: 'weight', label: 'Poids', render: (row) => formatWeight(row.weight) },
            { key: 'dimensions', label: 'Dimensions', render: (row) => formatDimensions(row.dimensions) },
            { key: 'sizes', label: 'Tailles', render: (row) => (row.sizes?.length ? sizesToText(row.sizes) : 'Unique') },
            { key: 'stock', label: 'Stock', render: (row) => (Number(row.stock) > 0 ? row.stock : <span className="badge text-smaller text-semibold badge-danger">Épuisé</span>) },
        ],
    },
}
