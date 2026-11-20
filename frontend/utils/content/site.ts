import { instagram, snapchat, tiktok, whatsapp } from '../icons'

/*
 * Identity of the fictional association shown on the demo. Every value is invented:
 * the ".example" domain, the phone number and the identifiers do not belong to anyone.
 */
export const association = {
    name: 'Élan Solidaire',
    tagline: 'Agir ensemble, là où chaque geste compte',
    legalForm: 'Association loi 1901 (fictive)',
    email: 'contact@elan-solidaire.example',
    phone: '01 00 00 00 00',
    address: '12 rue des Tilleuls, 69000 Lyon',
    rna: 'W000000000 (fictif)',
    siret: '000 000 000 00000 (fictif)',
    founded: 2019,
    iban: 'FR76 0000 0000 0000 0000 0000 000',
    bic: 'DEMOFRPPXXX',
    bank: 'Banque Exemple',
}

// Designer and developer of the site (footer credit, legal notice, meta author, JSON-LD author), like the other sites
export const developer = {
    name: 'Djason CHERY',
    href: 'https://djason-chery.dev',
    title: 'Voir le portfolio de Djason CHERY, développeur web (nouvel onglet)',
    // Profiles listed in the JSON-LD of djason-chery.dev (sameAs), copied as they are there
    profiles: [
        'https://www.linkedin.com/in/djason-chery-3b87702b4',
        'https://github.com/Djason16',
        'https://www.malt.fr/profile/djasonchery',
        'https://www.instagram.com/djasonchery',
        'https://www.tiktok.com/@djasonchery.dev',
        'https://www.facebook.com/profile.php?id=61596350354677',
    ],
}

// Project generator the site was built with (legal notice, meta generator)
export const generator = {
    name: 'DC Scaffold',
    href: 'https://tools.djason-chery.dev/fr/scaffold/',
    title: 'Découvrir DC Scaffold (nouvel onglet)',
}

// Main menu of the site
export const navigationLinks = [
    { href: '/', label: 'Accueil', title: 'Aller à l’accueil' },
    { href: '/don/', label: 'Nous soutenir', title: 'Faire un don ou adhérer' },
    { href: '/boutique/', label: 'Boutique', title: 'Parcourir la boutique' },
    { href: '/evenements/', label: 'Agenda', title: 'Voir les prochains événements' },
    { href: '/contact/', label: 'Contact', title: 'Écrire à l’association' },
]

// Legal pages (footer)
export const legalLinks = [
    { href: '/mentions-legales/', label: 'Mentions légales', title: 'Lire les mentions légales' },
    { href: '/confidentialite/', label: 'Politique de confidentialité', title: 'Lire la politique de confidentialité' },
    { href: '/cgv/', label: 'CGV', title: 'Lire les conditions générales de vente' },
    { href: '/cookies/', label: 'Politique de cookies', title: 'Lire la politique de cookies' },
]

// Networks of the footer. The association is fictional: the links open the home page of each network
export const socialLinks = [
    { name: 'instagram', url: 'https://www.instagram.com/', title: 'Instagram (exemple de lien)', icon: instagram },
    { name: 'snapchat', url: 'https://www.snapchat.com/', title: 'Snapchat (exemple de lien)', icon: snapchat },
    { name: 'tiktok', url: 'https://www.tiktok.com/', title: 'TikTok (exemple de lien)', icon: tiktok },
    { name: 'whatsapp', url: 'https://www.whatsapp.com/', title: 'WhatsApp (exemple de lien)', icon: whatsapp },
]
