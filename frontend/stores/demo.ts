import { resetDatabase } from '@/utils/demo/storage'
import { useAdminStore } from './admin'
import { useAuthStore } from './auth'
import { forgetCart, useCartStore } from './cart'
import { createActionStore } from './createActionStore'

/**
 * The demo itself. Action resetDemo: brings back the starting data (every donation, order, account and change of
 * the admin made in this browser is forgotten), empties the cart, the admin cache and the session.
 * @module stores/demo
 */
export const useDemoStore = createActionStore({}, {
    /** Back to the starting data of the demo. */
    resetDemo(): void {
        resetDatabase()
        forgetCart()
        useCartStore.getState().clear()
        useAdminStore.getState().clear()
        useAuthStore.getState().forget()
    },
})
