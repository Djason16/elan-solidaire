import {
    bagShopping, calendarCheck, chartLine, circleUser, download, envelopeOpenText, eye, fileInvoice, handHoldingHeart, idCard,
    lock, magnifyingGlass, pen, peopleGroup, scaleBalanced, shieldHalved, star, truck,
    type IconData,
} from '@/utils/icons'

/**
 * Texts of the page "Ce que comprend ce site" (/fonctionnalites/): the features of the demo by group, one icon, a
 * short title and one clear sentence each.
 * @module components/views/Features/featuresContent
 */
export interface FeatureGroupData {
    id: string
    title: string
    items: { icon: IconData, title: string, text: string }[]
}

export const featureGroups: FeatureGroupData[] = [
    {
        id: 'dons',
        title: 'Dons et adhésions',
        items: [
            { icon: handHoldingHeart, title: 'Don ponctuel ou mensuel', text: 'Sur un projet précis ou libre, avec le coût réel après réduction d’impôt calculé en direct.' },
            { icon: fileInvoice, title: 'Reçu fiscal en PDF', text: 'Généré dans le navigateur juste après le don, et retrouvé à tout moment dans l’espace membre.' },
            { icon: idCard, title: 'Adhésion en ligne', text: 'Trois formules payées en une fois pour un an, avec la carte de membre à la clé.' },
            { icon: chartLine, title: 'Collecte en cours', text: 'Une barre de progression qui avance à chaque don, sur l’accueil et la page de don.' },
        ],
    },
    {
        id: 'boutique',
        title: 'Boutique solidaire',
        items: [
            { icon: bagShopping, title: 'Catalogue complet', text: 'Recherche, catégories, tri, tailles et stock, avec une fiche détaillée pour chaque article.' },
            { icon: scaleBalanced, title: 'Frais de port justes', text: 'Calculés au poids réel ou volumétrique, selon le pays de livraison.' },
            { icon: truck, title: 'Suivi de commande', text: 'Préparation, expédition avec numéro de suivi puis livraison : la commande avance toute seule.' },
        ],
    },
    {
        id: 'membre',
        title: 'Espace membre',
        items: [
            { icon: circleUser, title: 'Tout au même endroit', text: 'Adhésion, dons, reçus fiscaux, commandes suivies et inscriptions aux événements.' },
            { icon: lock, title: 'Compte sécurisé', text: 'Connexion, mot de passe oublié avec lien à usage unique, changement du mot de passe.' },
        ],
    },
    {
        id: 'agenda',
        title: 'Agenda',
        items: [
            { icon: calendarCheck, title: 'Événements à venir', text: 'Marches, ateliers, soirées : date, lieu, places restantes et événements passés à part.' },
            { icon: peopleGroup, title: 'Inscription en ligne', text: 'Un nom, un e-mail, et la place est réservée ; le compte du membre la retrouve.' },
        ],
    },
    {
        id: 'admin',
        title: 'Administration',
        items: [
            { icon: chartLine, title: 'Tableau de bord', text: 'Dons par mois, objectif de collecte, adhésions à renouveler et tâches du jour.' },
            { icon: pen, title: 'Contenus modifiables', text: 'Produits, événements, lieux de la carte et photos se gèrent sans toucher au code.' },
            { icon: download, title: 'Suivi et exports', text: 'Dons, adhésions, commandes et messages, export CSV et envoi de newsletters.' },
            { icon: envelopeOpenText, title: 'Newsletter', text: 'Rédaction, aperçu et envoi aux abonnés actifs, en quelques clics.' },
        ],
    },
    {
        id: 'qualite',
        title: 'Qualité',
        items: [
            { icon: eye, title: 'Accessible', text: 'Contrastes, navigation au clavier et lecteurs d’écran pris en compte partout.' },
            { icon: star, title: 'Rapide', text: 'Photos optimisées et pages légères, notées au plus haut par Lighthouse.' },
            { icon: magnifyingGlass, title: 'Bien référencé', text: 'Adresses en français, titres, descriptions et données structurées pour les moteurs.' },
            { icon: shieldHalved, title: 'Respect des données', text: 'RGPD pris en compte, et sur la démo rien ne quitte votre navigateur.' },
            { icon: idCard, title: 'Dès 320 px', text: 'Chaque page reste lisible et utilisable sur les plus petits téléphones.' },
        ],
    },
]
