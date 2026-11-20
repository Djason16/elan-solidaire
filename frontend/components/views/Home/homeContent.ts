import type { IconData } from '@/utils/icons'
import { droplet, faceSmile, handHoldingHeart, heartPulse, book } from '@/utils/icons'

/**
 * Texts of the home page that are not data of the demo API. Highlighted words are written as parts
 * (components/views/Home/Marked.jsx): even indexes plain text, odd indexes highlighted, "\n" for a line break.
 * @module components/views/Home/homeContent
 */

/** City the association comes from (tagline of the hero, mission). */
export const HOME_CITY = 'Lyon'

/** Share of the donations that goes to the field, shown as the fourth figure of the hero. */
export const TRANSPARENCY = '100%'

/** The three pillars of the mission (carousel "essentials"). */
export const essentials: { title: string[], text: string, image: string, alt: string }[] = [
    {
        title: ['', 'L’aide concrète', ',\npour couvrir les ', 'nécessités de chaque jour', '.'],
        text: 'Repas, vêtements, eau et hygiène : nous veillons à ce que chaque enfant vive dans des conditions sûres et régulières.',
        image: '/photos/home/essentials-1',
        alt: 'Deux bénévoles préparent des cartons de denrées et de médicaments',
    },
    {
        title: ['', 'L’école d’abord', ',\npour leur ouvrir la ', 'porte du savoir', ' et de ', 'l’indépendance', '.'],
        text: 'Fournitures, soutien scolaire et ateliers : nous aidons chaque enfant à apprendre, à progresser et à prendre son envol.',
        image: '/photos/home/essentials-2',
        alt: 'Fournitures scolaires : crayons, gomme et règle sur fond jaune et vert',
    },
    {
        title: ['', 'La présence humaine', ',\npour leur ', 'rendre l’assurance', ' et ', 'le sourire', '.'],
        text: 'Des adultes disponibles, à l’écoute et patients les aident à reprendre pied et à imaginer la suite avec confiance.',
        image: '/photos/home/essentials-3',
        alt: "Une main jeune tendue vers une main âgée, symbole d’entraide",
    },
]

/** Daily actions, each with its green square icon. */
export interface HomeAction {
    title: string
    icon: IconData
    description: string[]
}

export const actions: HomeAction[] = [
    {
        title: 'Assurer le quotidien',
        icon: handHoldingHeart,
        description: ['', 'Eau', ', ', 'repas', ', ', 'vêtements', ' et ', 'fournitures scolaires', ' :\nde quoi vivre chaque journée dans de bonnes conditions.'],
    },
    {
        title: 'Creuser et entretenir des puits',
        icon: droplet,
        description: ['', 'Une eau saine', ' pour les écoles et les familles,\nau plus près des maisons, entretenue avec les habitants.'],
    },
    {
        title: 'Aller à l’école',
        icon: book,
        description: ['', 'Soutien scolaire', ', ', 'ateliers éducatifs', ' et ', 'créatifs', ' pour\néveiller la curiosité et donner le goût d’apprendre.'],
    },
    {
        title: 'Prendre soin',
        icon: heartPulse,
        description: ['', 'Suivi médical', ', ', 'soins spécialisés', ' et ', 'écoute', ' pour les\nenfants dont la santé est fragile.'],
    },
    {
        title: 'Jouer et se retrouver',
        icon: faceSmile,
        description: ['', 'Sorties', ', ', 'activités', ' et ', 'fêtes', ' pour vivre de bons\nmoments et tisser des liens.'],
    },
]

/**
 * "dans 8 pays" / "au Sénégal": where the association acts, for the sentences of the hero and of the mission.
 * @param countries - Number of countries.
 */
export const whereText = (countries: number) => (countries === 1 ? 'dans un pays' : `dans ${countries} pays`)

/**
 * "1 830 enfants" with the right plural.
 * @param count
 * @param singular
 * @param plural
 */
export const plural = (count: number, singular: string, plural: string) => `${new Intl.NumberFormat('fr-FR').format(count)} ${count > 1 ? plural : singular}`
