/*
 * Starting data of the demo: products of the shop, places on the map, photos of the gallery.
 * Everything is fictional.
 * Products: weight in grams, dimensions of the parcel in cm (length, width, height), and the sizes of the clothes
 * with their own stock (null = one size, then `stock` is the stock of the product). With sizes, `stock` is their sum.
 */
import type { MediaItem, Place, Product } from '../../types'

export const products: Product[] = [
    { id: 1, reference: 'ES-TSH-001', slug: 't-shirt-elan-coton-bio', name: 'T-shirt Élan coton bio', price: 24, category: 'Vêtements', stock: 42, weight: 180, dimensions: { length: 30, width: 25, height: 2 }, sizes: [{ label: 'S', stock: 8 }, { label: 'M', stock: 12 }, { label: 'L', stock: 12 }, { label: 'XL', stock: 6 }, { label: 'XXL', stock: 4 }], popularity: 98, image: '/photos/products/tshirt', createdAt: '2026-03-02 10:00:00', description: 'T-shirt unisexe en coton biologique, sérigraphié à la main par un atelier d’insertion. Coupe droite, tailles du S au XXL.' },
    { id: 2, reference: 'ES-SAC-002', slug: 'sac-cabas-solidaire', name: 'Sac cabas solidaire', price: 18, category: 'Accessoires', stock: 60, weight: 250, dimensions: { length: 42, width: 38, height: 1 }, sizes: null, popularity: 91, image: '/photos/products/tote', createdAt: '2026-02-14 10:00:00', description: 'Grand sac en toile noire épaisse, anses renforcées, poche intérieure. Assez solide pour le marché de la semaine.' },
    { id: 3, reference: 'ES-MUG-003', slug: 'mug-emaille', name: 'Mug émaillé', price: 14, category: 'Artisanat', stock: 25, weight: 340, dimensions: { length: 12, width: 9, height: 9 }, sizes: null, popularity: 74, image: '/photos/products/mug', createdAt: '2026-04-20 10:00:00', description: 'Mug en métal émaillé blanc à liseré noir, 35 cl, léger et incassable : il part en randonnée comme sur le bureau.' },
    { id: 4, reference: 'ES-CAR-004', slug: 'carnet-de-terrain', name: 'Carnet de terrain', price: 12, category: 'Livres', stock: 80, weight: 300, dimensions: { length: 21, width: 15, height: 1.5 }, sizes: null, popularity: 66, image: '/photos/products/notebook', createdAt: '2026-01-08 10:00:00', description: 'Carnet A5 de 120 pages en papier recyclé, couverture crème souple.' },
    { id: 5, reference: 'ES-CAS-005', slug: 'casquette-en-coton', name: 'Casquette en coton', price: 22, category: 'Vêtements', stock: 0, weight: 110, dimensions: { length: 26, width: 19, height: 12 }, sizes: null, popularity: 58, image: '/photos/products/cap', createdAt: '2026-05-11 10:00:00', description: 'Casquette en coton avec le logo brodé, réglable à l’arrière. Bientôt de retour en stock.' },
    { id: 6, reference: 'ES-BRA-006', slug: 'bracelet-tisse-en-perles', name: 'Bracelet tissé en perles', price: 9, category: 'Artisanat', stock: 120, weight: 15, dimensions: { length: 10, width: 7, height: 1 }, sizes: null, popularity: 87, image: '/photos/products/bracelet', createdAt: '2026-06-03 10:00:00', description: 'Bracelet en perles tissées à la main par une coopérative de femmes. Chaque pièce est unique.' },
    { id: 7, reference: 'ES-GOU-007', slug: 'gourde-inox-50-cl', name: 'Gourde inox 50 cl', price: 26, category: 'Accessoires', stock: 34, weight: 320, dimensions: { length: 27, width: 7.5, height: 7.5 }, sizes: null, popularity: 80, image: '/photos/products/bottle', createdAt: '2026-07-19 10:00:00', description: 'Gourde isotherme en acier inoxydable : 12 heures au chaud, 24 heures au frais, sans plastique.' },
    { id: 8, reference: 'ES-CRT-008', slug: 'lot-de-cartes-et-enveloppes', name: 'Lot de cartes et enveloppes', price: 10, category: 'Livres', stock: 55, weight: 120, dimensions: { length: 16, width: 11.5, height: 1.5 }, sizes: null, popularity: 52, image: '/photos/products/cards', createdAt: '2026-08-27 10:00:00', description: 'Huit cartes postales illustrées des programmes de l’association, avec enveloppes kraft.' },
    { id: 9, reference: 'ES-SWE-009', slug: 'sweat-shirt-coton-bio', name: 'Sweat-shirt coton bio', price: 45, category: 'Vêtements', stock: 18, weight: 600, dimensions: { length: 35, width: 30, height: 6 }, sizes: [{ label: 'S', stock: 3 }, { label: 'M', stock: 6 }, { label: 'L', stock: 5 }, { label: 'XL', stock: 4 }], popularity: 70, image: '/photos/products/hoodie', createdAt: '2026-09-15 10:00:00', description: 'Sweat-shirt col rond en coton bio molletonné, coloris vert sauge. Chaud et doux, coupe droite.' },
    { id: 10, reference: 'ES-BOU-010', slug: 'bougie-parfumee', name: 'Bougie parfumée', price: 16, category: 'Autres', stock: 3, weight: 420, dimensions: { length: 9, width: 9, height: 10 }, sizes: null, popularity: 61, image: '/photos/products/candle', createdAt: '2026-10-02 10:00:00', description: 'Bougie blanche à la cire végétale, parfum figue et cèdre, coulée dans un bocal en verre réutilisable.' },
]

// Categories of the shop (the same list as the original shop)
export const productCategories = ['Vêtements', 'Accessoires', 'Artisanat', 'Livres', 'Autres']

// Places where the association acts (latitude, longitude for the map)
export const locations: Place[] = [
    { id: 1, city: 'Saint-Louis', country: 'Sénégal', latitude: 16.0326, longitude: -16.4818, program: 'water', centers: 3, children: 240, isActive: true },
    { id: 2, city: 'Kara', country: 'Togo', latitude: 9.5511, longitude: 1.1861, program: 'education', centers: 2, children: 310, isActive: true },
    { id: 3, city: 'Mopti', country: 'Mali', latitude: 14.4843, longitude: -4.1960, program: 'nutrition', centers: 4, children: 520, isActive: true },
    { id: 4, city: 'Fianarantsoa', country: 'Madagascar', latitude: -21.4527, longitude: 47.0857, program: 'reforestation', centers: 1, children: 95, isActive: true },
    { id: 5, city: 'Cap-Haïtien', country: 'Haïti', latitude: 19.7578, longitude: -72.2042, program: 'health', centers: 2, children: 180, isActive: true },
    { id: 6, city: 'Bobo-Dioulasso', country: 'Burkina Faso', latitude: 11.1771, longitude: -4.2979, program: 'water', centers: 2, children: 150, isActive: true },
    { id: 7, city: 'Lyon', country: 'France', latitude: 45.7640, longitude: 4.8357, program: 'nutrition', centers: 1, children: 60, isActive: true },
    { id: 8, city: 'Kisumu', country: 'Kenya', latitude: -0.0917, longitude: 34.7680, program: 'education', centers: 2, children: 275, isActive: true },
]

// Photos of the gallery (public/photos/gallery/, Pexels photos: docs/en/credits.md)
export const media: MediaItem[] = [
    { id: 1, src: '/photos/gallery/well', alt: 'Puits de village avec un bidon jaune au milieu de la campagne', title: 'Un puits au village', createdAt: '2026-10-12 09:00:00' },
    { id: 2, src: '/photos/gallery/classroom', alt: 'Salle de classe vide avec des pupitres en bois et un tableau vert', title: 'Une classe prête pour la rentrée', createdAt: '2026-09-20 09:00:00' },
    { id: 3, src: '/photos/gallery/trees', alt: 'Bénévoles plantant des arbres sur un terrain sablonneux', title: 'Journée de plantation', createdAt: '2026-08-30 09:00:00' },
    { id: 4, src: '/photos/gallery/meal', alt: 'Bénévole servant une soupe chaude à la louche', title: "Repas au centre d’accueil", createdAt: '2026-07-14 09:00:00' },
    { id: 5, src: '/photos/gallery/clinic', alt: "Soignant prenant la tension d’un patient dans un dispensaire", title: 'Consultation au dispensaire', createdAt: '2026-06-02 09:00:00' },
    { id: 6, src: '/photos/gallery/volunteers', alt: 'Bénévoles remplissant des cartons de dons en extérieur', title: 'Préparation des colis', createdAt: '2026-05-18 09:00:00' },
]
