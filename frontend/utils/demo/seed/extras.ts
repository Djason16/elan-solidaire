/**
 * Starting data of the fundraiser in progress and of the events (all fictional).
 * @module utils/demo/seed/extras
 */

/** Fundraiser shown on the home page, the donation page and the dashboard: every demo donation adds to it. */
import type { Event, Fundraiser } from '../../types'

export const fundraiser: Fundraiser = {
    title: 'Un puits pour l’école de Kara',
    goal: 5000,
    raised: 3450,
}

/** Events of the agenda (/evenements/): published ones are public, people register online. */
export const events: Event[] = [
    {
        id: 1, image: '/photos/events/walk', imageAlt: 'Adultes et enfants marchant sur un sentier aux couleurs d’automne', slug: 'marche-solidaire-du-parc', title: 'Marche solidaire du parc', date: '2026-12-13', time: '10:00',
        place: 'Parc de la Tête d’Or, Lyon', capacity: 120, registered: 74, isPublished: true,
        description: 'Une boucle de 6 km en famille, à son rythme. Chaque inscription finance une semaine de repas pour un enfant. Café et goûter offerts à l’arrivée.',
    },
    {
        id: 2, image: '/photos/events/sorting', imageAlt: 'Bénévoles triant des vêtements donnés dans un entrepôt lumineux', slug: 'atelier-tri-des-dons', title: 'Atelier de tri des dons', date: '2027-01-17', time: '14:00',
        place: 'Local de l’association, Lyon 3e', capacity: 20, registered: 11, isPublished: true,
        description: 'Un après-midi pour trier les vêtements et fournitures collectés avant leur départ. Aucune expérience demandée, juste un peu de bonne humeur.',
    },
    {
        id: 3, image: '/photos/events/evening', imageAlt: 'Public attentif écoutant une intervenante dans une salle comble', slug: 'soiree-photos-terrain', title: 'Soirée photos du terrain', date: '2027-02-06', time: '19:00',
        place: 'Maison des associations, Villeurbanne', capacity: 60, registered: 60, isPublished: true,
        description: 'Les bénévoles rentrés de mission racontent leur année en images, puis échangent avec le public autour d’un verre.',
    },
    {
        id: 4, image: '/photos/events/assembly', imageAlt: 'Adhérents assis écoutant une présentation en réunion', slug: 'assemblee-generale-2027', title: 'Assemblée générale 2027', date: '2027-03-21', time: '15:00',
        place: 'Salle municipale, Lyon 7e', capacity: 150, registered: 38, isPublished: true,
        description: 'Bilan de l’année, comptes, projets à venir et vote des adhérents. Ouverte à tous, le vote est réservé aux membres à jour.',
    },
    {
        id: 5, image: '/photos/events/meal', imageAlt: 'Vue de dessus d’un repas partagé autour d’une grande table', slug: 'repas-solidaire-d-automne', title: 'Repas solidaire d’automne', date: '2026-10-11', time: '12:00',
        place: 'Salle des fêtes, Lyon 8e', capacity: 80, registered: 80, isPublished: true,
        description: 'Un grand repas partagé avec les familles accompagnées et les bénévoles. Les bénéfices ont financé les fournitures de la rentrée.',
    },
]
