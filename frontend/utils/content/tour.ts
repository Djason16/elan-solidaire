/**
 * Steps of the guided tour (button "Visite guidée" of the demo banner). Each step opens its page behind the bubble;
 * `login` logs in with a demo account first (member space, admin).
 */
export interface TourStep {
    title: string
    text: string
    href: string
    login?: 'member' | 'admin'
}

export const tourSteps: TourStep[] = [
    {
        title: 'Bienvenue sur la démo',
        text: 'Tout ce que vous voyez fonctionne vraiment, mais rien ne sort de votre navigateur : les dons, les paiements et les e-mails sont simulés.',
        href: '/',
    },
    {
        title: 'Faire un don',
        text: 'Choisissez un projet, un montant ponctuel ou mensuel : la réduction d’impôt se calcule en direct, et un reçu fiscal PDF fictif est proposé après le paiement.',
        href: '/don/',
    },
    {
        title: 'Adhérer',
        text: 'Trois formules d’adhésion, payées en une fois pour un an. L’adhérent reçoit un compte et sa carte de membre.',
        href: '/adhesion/',
    },
    {
        title: 'La boutique solidaire',
        text: 'Tailles, stock, frais de port au poids et paiement simulé. Après l’achat, la commande avance seule : préparation, expédition avec numéro de suivi, livraison.',
        href: '/boutique/',
    },
    {
        title: 'L’espace membre',
        text: 'Vous êtes connecté avec le compte membre de démonstration : adhésion, dons, reçus fiscaux et commandes au même endroit.',
        href: '/espace-membre/',
        login: 'member',
    },
    {
        title: 'L’administration',
        text: 'Compte admin de démonstration : tableau de bord, collecte, produits, événements, dons, commandes suivies automatiquement et newsletter. « Remettre à zéro » efface tout.',
        href: '/admin/',
        login: 'admin',
    },
]
