/*
 * Programs of the association: shown on the home page and offered as donation projects.
 * "image" is a photo of public/photos/programs/ (Pexels, docs/en/credits.md).
 */
import type { MembershipPlan, Program } from '../types'

export const programs: Program[] = [
    {
        id: 'water',
        title: 'Accès à l’eau',
        text: 'Forages, puits et filtres pour que les villages partenaires aient une eau potable toute l’année.',
        impact: '30 € financent un filtre familial pour un an',
        image: '/photos/programs/water',
    },
    {
        id: 'education',
        title: 'Éducation',
        text: 'Kits scolaires, salles de classe rénovées et soutien aux enseignants des écoles rurales.',
        impact: '25 € équipent un enfant pour toute l’année scolaire',
        image: '/photos/programs/education',
    },
    {
        id: 'nutrition',
        title: 'Nutrition',
        text: 'Repas chauds dans les centres d’accueil et colis alimentaires pour les familles isolées.',
        impact: '15 € offrent dix repas équilibrés',
        image: '/photos/programs/nutrition',
    },
    {
        id: 'health',
        title: 'Santé',
        text: 'Consultations mobiles, trousses de soins et prévention dans les zones éloignées des hôpitaux.',
        impact: '40 € financent une journée de consultation mobile',
        image: '/photos/programs/health',
    },
    {
        id: 'reforestation',
        title: 'Reboisement',
        text: 'Plantation d’arbres fruitiers avec les habitants pour lutter contre l’érosion et nourrir les villages.',
        impact: '5 € plantent un arbre fruitier',
        image: '/photos/programs/reforestation',
    },
]

// Projects a donation can go to: the programs, plus a free donation used where it is most needed
export const donationProjects = [
    { id: 'free', title: 'Là où c’est le plus utile' },
    ...programs.map(({ id, title }) => ({ id, title })),
]

export const projectTitle = (id: string) => donationProjects.find((project) => project.id === id)?.title ?? id

// Suggested amounts of the donation form (euros)
export const donationAmounts = [15, 30, 50, 100]

// Membership plans: one payment for a year
export const membershipPlans: MembershipPlan[] = [
    { id: 'standard', title: 'Membre', amount: 30, text: 'La carte de membre, le journal trimestriel et le vote à l’assemblée générale.' },
    { id: 'support', title: 'Membre solidaire', amount: 60, text: 'Les avantages du membre, plus les invitations aux actions de terrain.' },
    { id: 'benefactor', title: 'Membre bienfaiteur', amount: 120, text: 'Tous les avantages, et un rapport détaillé de chaque projet soutenu.' },
]

export const planOf = (id: string) => membershipPlans.find((plan) => plan.id === id)

// Tax reduction on donations to a general interest association (France): 66 % of the amount
export const TAX_REDUCTION_RATE = 0.66
