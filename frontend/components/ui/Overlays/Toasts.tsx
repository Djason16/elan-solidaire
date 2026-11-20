import Icon from '@/components/ui/Icon/Icon'
import { useNotificationsStore } from '@/stores/notifications'
import { cx } from '@/utils/cx'
import { circleCheck, circleInfo, circleXmark, xmark, type IconData } from '@/utils/icons'
import type { ToastType } from '@/utils/types'

const ICONS: Record<ToastType, IconData> = { success: circleCheck, error: circleXmark, info: circleInfo }
const TITLES: Record<ToastType, string> = { success: 'Réussi', error: 'Erreur', info: 'Information' }

/**
 * Toasts of the site (stores/notifications.js), in place of the alert() windows and of the messages under the fields:
 * white cards with the grey border of the design and the icon of their kind, stacked top right (bottom of the
 * screen on a phone, above the round buttons). An error is an alert (read at once), the others a status.
 * The time stops while the mouse or the focus is on a toast; the cross closes it. Entry and exit animated.
 */
export default function Toasts() {
    const toasts = useNotificationsStore((state) => state.toasts)
    const dismiss = useNotificationsStore((state) => state.dismiss)
    const pause = useNotificationsStore((state) => state.pause)
    const resume = useNotificationsStore((state) => state.resume)

    return (
        <section className="toasts gap-xs" aria-label="Notifications">
            {toasts.map((toast) => (
                <div key={toast.id} className={cx('toast gap-s', `toast-${toast.type}`, toast.leaving && 'is-leaving')}
                    role={toast.type === 'error' ? 'alert' : 'status'}
                    onMouseEnter={() => pause(toast.id)} onMouseLeave={() => resume(toast.id)}
                    onFocus={() => pause(toast.id)} onBlur={() => resume(toast.id)}>
                    <Icon icon={ICONS[toast.type]} label={TITLES[toast.type]} className="toast-icon" />
                    <p className="text-normal">{toast.message}</p>
                    <button type="button" className="toast-close" onClick={() => dismiss(toast.id)} aria-label="Fermer la notification" title="Fermer la notification">
                        <Icon icon={xmark} />
                    </button>
                </div>
            ))}
        </section>
    )
}
