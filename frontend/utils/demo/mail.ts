import { projectTitle, planOf } from '../content/programs'
import { association } from '../content/site'
import { formatEuros } from '../format'
import type { Donation, Mail, Membership, Order, ContactMessage, User } from '../types'

/**
 * E-mails of the demo. Nothing is ever sent: each function returns the message, the API hands it back
 * in its response (`mail`) and the site shows it in a preview window (components/ui/MailPreview).
 * @module utils/demo/mail
 */

/**
 * @typedef {object} Mail
 * @property {string} to - Recipient address.
 * @property {string} subject - Subject line.
 * @property {string} body - Plain text body.
 * @property {{ href: string, label: string }} [link] - Main link of the e-mail, shown as a button in the preview.
 */

const signature = `\n\nMerci pour votre confiance,\nL’équipe ${association.name}\n${association.email}`

/**
 * Thank-you e-mail and tax receipt notice for a paid donation.
 * @param donation - Row of the donations table.
 */
export const donationMail = (donation: Donation): Mail => ({
    to: donation.email,
    subject: `Merci pour votre don de ${formatEuros(donation.amount)}`,
    body: `Bonjour ${donation.fullName},\n\nNous avons bien reçu votre don de ${formatEuros(donation.amount)} pour le projet « ${projectTitle(donation.project)} » (référence ${donation.reference}).\nVotre reçu fiscal vous sera envoyé dans les prochains jours.${signature}`,
})

/**
 * Bank details e-mail for a donation paid by transfer.
 * @param donation - Row of the donations table.
 */
export const transferMail = (donation: Donation): Mail => ({
    to: donation.email,
    subject: `Votre don par virement : référence ${donation.reference}`,
    body: `Bonjour ${donation.fullName},\n\nPour finaliser votre don de ${formatEuros(donation.amount)}, faites un virement avec ces coordonnées (fictives) :\nIBAN : ${association.iban}\nBIC : ${association.bic}\nRéférence à indiquer : ${donation.reference}${signature}`,
})

/**
 * Welcome e-mail of a new member.
 * @param membership - Row of the memberships table.
 */
export const membershipMail = (membership: Membership): Mail => ({
    to: membership.email,
    subject: 'Bienvenue parmi les membres',
    body: `Bonjour ${membership.fullName},\n\nVotre adhésion « ${planOf(membership.plan)?.title} » est active jusqu’au ${(membership.endDate ?? '').split('-').reverse().join('/')}.\nVotre carte de membre part par courrier, et votre espace membre est ouvert avec cette adresse e-mail.${signature}`,
})

/**
 * Order confirmation e-mail.
 * @param order - Row of the orders table.
 */
export const orderMail = (order: Order): Mail => ({
    to: order.email,
    subject: `Commande n° ${order.id} confirmée`,
    body: `Bonjour ${order.fullName},\n\nMerci pour votre commande :\n${order.items.map((item) => `- ${item.quantity} × ${item.name}${item.size ? ` (taille ${item.size})` : ''} : ${formatEuros(item.price * item.quantity)}`).join('\n')}\nLivraison : ${formatEuros(order.shipping)}\nTotal : ${formatEuros(order.total)}${signature}`,
})

/**
 * Password reset e-mail: a link valid for one hour, usable once.
 * @param user - Row of the users table.
 * @param token - Reset token (the link of the e-mail).
 */
export const resetMail = (user: User, token: string): Mail => ({
    to: user.email,
    subject: 'Choisir un nouveau mot de passe',
    body: `Bonjour ${user.name},\n\nPour choisir un nouveau mot de passe, ouvrez le lien ci-dessous dans l’heure.\nSi vous n’avez rien demandé, ignorez ce message : votre mot de passe ne change pas.${signature}`,
    link: { href: `/connexion/?reset=${token}`, label: 'Choisir un nouveau mot de passe' },
})

/**
 * Acknowledgement of a contact message.
 * @param message - Row of the messages table.
 */
export const contactMail = (message: ContactMessage): Mail => ({
    to: message.email,
    subject: `Nous avons bien reçu votre message : ${message.subject}`,
    body: `Bonjour ${message.fullName},\n\nMerci pour votre message. Un membre de l’équipe vous répond sous 48 heures ouvrées.${signature}`,
})
