import type { IconData } from '@/utils/icons'
import Icon from '@/components/ui/Icon/Icon'

/**
 * Small dark round button with an icon (the "classic button" of the original design): quantities and removal of a
 * cart line. Its accessible name is its title.
 * @param props
 * @param props.icon - Icon of utils/icons.js.
 * @param props.title - What the button does ("Retirer un article").
 * @param [props.disabled=false]
 * @param props.onClick
 */
export default function RoundIconButton({ icon, title, disabled = false, onClick }: { icon: IconData, title: string, disabled?: boolean, onClick: () => void }) {
    return (
        <button type="button" className="classic-btn round-icon-button" title={title} aria-label={title} disabled={disabled} onClick={onClick}>
            <Icon icon={icon} />
        </button>
    )
}
