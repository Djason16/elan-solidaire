import { supportActions } from './actions/supportActions'
import { createActionStore } from './createActionStore'

/**
 * What visitors send to the association: donations, memberships, orders and their simulated payment, contact
 * messages and newsletter sign-ups. No state of its own: the results go back to the views, the lists to the admin.
 * Actions (stores/actions/supportActions.js): createDonation, createMembership, createOrder, confirmPayment,
 * sendContactMessage, subscribeNewsletter.
 * @module stores/support
 */
export const useSupportStore = createActionStore({}, supportActions)
