import type { IconData } from '@/utils/icons'
import type { PaymentMethod } from '@/utils/types'
import { bowlFood, buildingColumns, calendarCheck, chartLine, creditCard, envelopeOpenText, eye, fileInvoice, fileLines, handHoldingHeart, heart, idCard, paypal, peopleGroup, school, stethoscope, tree, water } from '@/utils/icons'

/**
 * Texts and choices of the "Nous soutenir" page (fictional association), in the order of the original design.
 * Words between ** ** are highlighted (<mark>) by components/views/Support/Highlight.jsx.
 * @module components/views/Support/supportContent
 */

/** Donation projects: the ids of utils/content/programs.js, with the icon and the picture of the form. */
export interface DonationType {
    value: string
    label: string
    icon: IconData
    image: string
    alt: string
}

export const donationTypes: DonationType[] = [
    { value: 'free', label: 'Don libre', icon: heart, image: '/photos/support/free', alt: 'Mains se transmettant une boîte de dons' },
    { value: 'water', label: 'Accès à l’eau', icon: water, image: '/photos/programs/water', alt: "Femme puisant de l’eau à une pompe manuelle dans un village" },
    { value: 'education', label: 'Éducation', icon: school, image: '/photos/programs/education', alt: 'Mains tenant un cartable garni de fournitures scolaires' },
    { value: 'nutrition', label: 'Nutrition', icon: bowlFood, image: '/photos/programs/nutrition', alt: "Bénévole remettant une boîte de repas lors d’une distribution alimentaire" },
    { value: 'health', label: 'Santé', icon: stethoscope, image: '/photos/programs/health', alt: "Gros plan d’une prise de tension avec un tensiomètre" },
    { value: 'reforestation', label: 'Reboisement', icon: tree, image: '/photos/programs/reforestation', alt: 'Deux bénévoles plantant de jeunes arbres dans un pré' },
]

/** Suggested amounts and what each one pays for. */
export const donationPresets = [10, 20, 50, 100, 200, 400]
export const presetDescriptions: Record<number, string> = {
    10: 'Le matériel de classe d’un élève',
    20: 'Sept jours de repas pour un enfant',
    50: 'Sept jours de repas pour une classe',
    100: 'Des consultations et des médicaments',
    200: 'Un équipement adapté à un enfant handicapé',
    400: 'Une part du chantier d’un nouveau puits',
}

/** Smallest donation accepted by the API (utils/validation.js). */
export const MIN_DONATION = 5

/** Payment methods (PaymentChoice). */
export const paymentMethods: { value: PaymentMethod, label: string, icon: IconData }[] = [
    { value: 'card', label: 'Carte bancaire', icon: creditCard },
    { value: 'paypal', label: 'PayPal', icon: paypal },
    { value: 'transfer', label: 'Virement bancaire', icon: buildingColumns },
]

/** "Pourquoi donner ?" */
export const reasons: { icon: IconData, text: string }[] = [
    { icon: handHoldingHeart, text: '**Chaque euro va au projet** que vous choisissez' },
    { icon: fileInvoice, text: '**Attestation fiscale** pour **déduire votre don**' },
    { icon: eye, text: '**Des comptes publiés** chaque année' },
    { icon: chartLine, text: '**Nouvelles du terrain** tout au long de l’année' },
]

/** "Impact de votre don" */
export const impacts: { price: number, text: string }[] = [
    { price: 10, text: '**cahiers, crayons et sac** pour qu’**un élève** suive la classe **sans rien lui manquer**.' },
    { price: 20, text: '**une semaine de repas** pour **un enfant**, de quoi apprendre et jouer **le ventre plein**.' },
    { price: 50, text: '**dix enfants** nourris pendant **une semaine** dans un centre d’accueil partenaire.' },
    { price: 100, text: '**consultations et médicaments** pour **plusieurs enfants**, suivis par **une équipe soignante**.' },
    { price: 200, text: '**un équipement sur mesure** pour **un enfant handicapé**, pour qu’il **prenne part à tout**.' },
    { price: 400, text: 'une part **du chantier d’un puits**, qui donnera **une eau saine** en toute saison.' },
]

/** "Agir autrement à nos côtés": the three choices and their card. */
export const otherWays: { value: string, label: string, title: string, text: string, image: string }[] = [
    {
        value: 'sponsor',
        label: 'Parrainer un enfant',
        title: 'Soutenir un enfant, **c’est l’accompagner.**',
        text: 'Avec un **parrainage chaque mois**, vous **aidez dans la durée** un enfant pour **son école**, **sa santé** et **sa vie de tous les jours**.\nVous recevez **ses nouvelles plusieurs fois par an** et voyez **ce que votre aide change**.',
        image: '/photos/home/essentials-3',
    },
    {
        value: 'school',
        label: 'Offrir un kit de rentrée',
        title: '**Une rentrée sereine** pour tous les élèves.',
        text: '**Un sac**, des **cahiers et crayons** et une **tenue d’école** composent chaque kit.\nAvec **25 €**, **un élève démarre l’année** bien équipé.',
        image: '/photos/programs/education',
    },
    {
        value: 'volunteer',
        label: 'Donner de son temps',
        title: 'Le temps est **aussi un don.**',
        text: '**Collectes**, **tri des dons**, **événements** : il y a une place pour vous, **même quelques heures**.\nPassez par la **page Contact** pour rejoindre l’équipe bénévole.',
        image: '/photos/gallery/volunteers',
    },
]

/** "Avantages membres" */
export const memberBenefits: { icon: IconData, text: string }[] = [
    { icon: envelopeOpenText, text: '**Une lettre réservée aux membres**' },
    { icon: calendarCheck, text: '**Accès** aux **rencontres et sorties**' },
    { icon: fileLines, text: '**Bilans complets** de **chaque projet**' },
    { icon: peopleGroup, text: '**Droit de vote** à **l’assemblée générale**' },
    { icon: idCard, text: '**Carte d’adhérent nominative**' },
]
