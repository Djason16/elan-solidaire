import { api } from '@/utils/api'
import type { ApiResult, Event, Mail, PaymentConfirmation, PaymentResult } from '@/utils/types'
import { useAuthStore } from '../auth'
import { useCartStore } from '../cart'
import { useFundraiserStore } from '../fundraiser'

/**
 * Actions of the support store (stores/support.js): everything a visitor sends to the association. Donations,
 * memberships and orders are created "pending" by the API, then paid in the simulated payment window
 * (confirmPayment). Each action returns the response of the API.
 * @module stores/actions/supportActions
 */
/** The record created before its payment. */
interface Created {
    id: number
    amount: number
    paymentToken: string
}

type PaymentResultFields = Omit<PaymentResult, 'success'>

export const supportActions = {
    /**
     * Creates a donation (amount checked by the API).
     * @param values - fullName, email, project, amount, paymentMethod, newsletter.
     *
     */
    createDonation(values: { amount: number | string }): Promise<ApiResult<{ donation: Created & { reference: string }, mail?: Mail }>> {
        return api.post('/donations', { ...values, amount: Number(values.amount) })
    },

    /**
     * Creates a membership (price of the plan computed by the API).
     * @param values - fullName, email, phone, address, birthDate, plan, paymentMethod, password, newsletter.
     *
     */
    createMembership(values: object): Promise<ApiResult<{ membership: Created }>> {
        return api.post('/memberships', values)
    },

    /**
     * Creates the order of the cart (prices, sizes, stock and shipping computed again by the API).
     * @param customer - Delivery details and paymentMethod.
     *
     */
    createOrder(customer: object): Promise<ApiResult<{ order: { id: number, total: number, paymentToken: string } }>> {
        const items = useCartStore.getState().items.map(({ productId, size, quantity }) => ({ productId, size, quantity }))
        return api.post('/orders', { ...customer, items })
    },

    /**
     * Answer of the simulated payment provider. After a paid order the cart is emptied; after a paid membership the
     * new member is logged in.
     * @param payment
     *
     */
    async confirmPayment(payment: PaymentConfirmation): Promise<ApiResult<PaymentResultFields>> {
        const result = await api.post<PaymentResultFields>('/payments/confirm', payment)
        if (!result.success) return result
        if (payment.kind === 'order') useCartStore.getState().clear()
        if (payment.kind === 'membership') await useAuthStore.getState().checkSession()
        // A paid donation adds to the fundraiser in progress
        if (payment.kind === 'donation') await useFundraiserStore.getState().load()
        return result
    },

    /**
     * Sends the contact form (the acknowledgement e-mail is previewed, never sent).
     * @param values - fullName, email, phone, subject, message.
     */
    sendContactMessage(values: object): Promise<ApiResult<{ mail: Mail }>> {
        return api.post('/contact', values)
    },

    /**
     * Subscribes an address to the newsletter.
     * @param values
     */
    subscribeNewsletter(values: { fullName: string, email: string }): Promise<ApiResult> {
        return api.post('/newsletter', values)
    },

    /**
     * Registration to an event of the agenda.
     * @param eventId
     * @param values
     */
    registerToEvent(eventId: number, values: { fullName: string, email: string }): Promise<ApiResult<{ event: Event, message: string }>> {
        return api.post(`/events/${eventId}/register`, values)
    },
}
