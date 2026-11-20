import { useRouter } from 'next/router'
import { useDemoStore } from '@/stores/demo'
import { notifySuccess } from '@/stores/notifications'
import { useUiStore } from '@/stores/ui'

/**
 * "Réinitialiser la démo" (demo banner and footer): a destructive action, so it asks first in the confirmation window
 * of the site, then brings back the starting data, empties the cart and the session and goes back to the home page.
 */
export function useResetDemo() {
    const router = useRouter()

    return async () => {
        const accepted = await useUiStore.getState().confirm({
            title: 'Réinitialiser la démo ?',
            text: 'Vos dons, adhésions, commandes, inscriptions, comptes et changements de l’administration seront effacés, et les données de départ reviendront.',
            confirmLabel: 'Réinitialiser',
            danger: true,
        })
        if (!accepted) return
        useDemoStore.getState().resetDemo()
        notifySuccess('La démo est revenue à son état de départ.')
        router.push('/')
    }
}
