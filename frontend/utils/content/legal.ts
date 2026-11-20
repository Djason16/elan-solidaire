import { association, developer, generator } from './site'

/**
 * Legal pages of the demo: written like the pages of a real association, with a fictional publisher.
 * Each page: title, intro (words between ** ** highlighted), then numbered sections (title + paragraphs).
 * @module utils/content/legal
 */
const demoNotice: LegalSection = {
    title: 'Site de démonstration',
    paragraphs: [
        `${association.name} est une association imaginaire. Ce site montre le travail de son développeur : aucune donnée n’est envoyée à un serveur, tout reste dans votre navigateur.`,
    ],
}

export interface LegalSection {
    title: string
    paragraphs: string[]
    action?: 'cookieSettings'
}

export interface LegalPage {
    intro: string
    title: string
    sections: LegalSection[]
}

export type LegalPageKey = 'legalNotice' | 'privacyPolicy' | 'termsOfSale' | 'cookiePolicy'

export const legalPages: Record<LegalPageKey, LegalPage> = {
    legalNotice: {
        intro: 'Qui publie ce site de démonstration, qui l’héberge et qui l’a réalisé (**Élan Solidaire** est fictive).',
        title: 'Mentions légales',
        sections: [
            demoNotice,
            {
                title: 'Responsable de la publication',
                paragraphs: [
                    `${association.name}, ${association.legalForm}, ${association.address}.`,
                    `RNA : ${association.rna}. SIRET : ${association.siret}.`,
                    `Contact : ${association.email} ou ${association.phone}.`,
                ],
            },
            {
                title: 'Conception et développement',
                paragraphs: [
                    `Site conçu et réalisé par ${developer.name}, développeur web.`,
                    `Construit avec ${generator.name}, le générateur de projets de son développeur.`,
                ],
            },
            {
                title: 'Hébergement',
                paragraphs: ['Site statique hébergé par Cloudflare, Inc., 101 Townsend Street, San Francisco, CA 94107, États-Unis.'],
            },
            {
                title: 'Propriété intellectuelle',
                paragraphs: [
                    'Crédits photos : Antoni Shkraba, Brando.ltd, Chris F, cottonbro studio, fauxels, Julia M Cameron, Kaboompics, KATRIN BOLOVTSOVA, KİRİK SÜLEYMAN, Lucie Liz, Luis Quintero, Mikhail Nilov, Mr. Mockup, Muhammad Zubair, Ninthgrid, Omar Ramadan, Ouya Obunga, Pavel Danilyuk, RDNE Stock project, Ron Lach, Stephanie Ho, Thirdman, Torrans Mayorquin, Tường Chopper, Valentin Ivantsov sur Pexels, sous sa licence d’utilisation libre. Les personnes photographiées n’ont aucun lien avec cette association fictive.',
                    'Le logo et les icônes du site ont été créés pour cette démonstration ; les icônes reprennent Font Awesome Free, sous licence CC BY 4.0. La police Public Sans est publiée sous licence SIL Open Font License.',
                    'Le fond de carte vient d’OpenStreetMap et de ses contributeurs (licence ODbL).',
                ],
            },
        ],
    },
    privacyPolicy: {
        intro: 'Ce que deviennent **les données saisies** sur cette démonstration.',
        title: 'Politique de confidentialité',
        sections: [
            demoNotice,
            {
                title: 'Données saisies',
                paragraphs: [
                    'Les formulaires (don, adhésion, commande, contact, newsletter) gardent ce que vous saisissez dans le stockage local de votre navigateur, pour que la démonstration fonctionne. Rien n’est transmis à un serveur ni à un tiers.',
                    'Le bouton « Remettre à zéro », dans la bannière en haut de chaque page, efface ces données. Vider les données du site dans votre navigateur a le même effet.',
                ],
            },
            {
                title: 'Paiements et e-mails',
                paragraphs: [
                    'Les paiements sont simulés : aucun numéro de carte n’est enregistré, aucune somme n’est prélevée. Les e-mails ne sont jamais envoyés, le site en montre seulement un aperçu.',
                ],
            },
            {
                title: 'Vos droits',
                paragraphs: [
                    'Pour une vraie association, vous auriez un droit d’accès, de rectification, d’effacement et d’opposition sur vos données (RGPD), à exercer auprès de son responsable de traitement, et le droit de saisir la CNIL.',
                ],
            },
        ],
    },
    termsOfSale: {
        intro: 'Conditions de **la boutique solidaire** de démonstration.',
        title: 'Conditions générales de vente',
        sections: [
            demoNotice,
            {
                title: 'Commandes',
                paragraphs: [
                    'Les articles de la boutique sont fictifs. Une commande passée sur ce site n’engage personne : elle n’est ni payée, ni préparée, ni livrée.',
                ],
            },
            {
                title: 'Prix et frais de port',
                paragraphs: [
                    'Les prix sont indiqués toutes taxes comprises. Les frais de port dépendent du pays de livraison et sont offerts à partir de 60 € d’achat en France.',
                ],
            },
            {
                title: 'Rétractation',
                paragraphs: [
                    'Lors d’un achat à distance réel, le client a deux semaines après avoir reçu sa commande pour changer d’avis, sans donner de motif (article L221-18 du Code de la consommation).',
                ],
            },
        ],
    },
    cookiePolicy: {
        intro: '**Cookies** et **stockage local** utilisés par la démonstration.',
        title: 'Politique de cookies',
        sections: [
            demoNotice,
            {
                title: 'Ce que le site enregistre',
                paragraphs: [
                    'Un cookie garde votre choix du bandeau cookies pendant six mois. Le stockage local du navigateur garde le panier et les données de la démonstration : ils sont nécessaires au fonctionnement du site.',
                ],
            },
            {
                title: 'Carte interactive',
                paragraphs: [
                    'La carte des actions charge des images d’OpenStreetMap seulement après votre accord (catégorie « Carte » du bandeau cookies). Sans accord, aucune requête ne part vers ce service.',
                ],
            },
            {
                title: 'Changer d’avis',
                paragraphs: ['Vous pouvez modifier votre choix à tout moment avec le bouton ci-dessous.'],
                // Button that opens the cookie banner again (components/views/Legal/LegalView.jsx)
                action: 'cookieSettings',
            },
        ],
    },
}
