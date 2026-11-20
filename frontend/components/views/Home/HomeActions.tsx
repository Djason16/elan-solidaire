import Icon from '@/components/ui/Icon/Icon'
import { useReveal } from '@/composables/useReveal'
import { actions, type HomeAction } from './homeContent'
import Marked from './Marked'
import { cx } from '@/utils/cx'

/**
 * One daily action: its title, its green square icon and its description, rising when it comes on screen.
 * @param props
 */
function ActionItem({ action }: { action: HomeAction }) {
    const [ref, visible] = useReveal<HTMLLIElement>()

    return (
        <li ref={ref} className={cx('action gap-m', visible && 'is-visible')}>
            <h3 className="action-title text-medium text-large">{action.title}</h3>
            <div className="action-content gap-xxxl">
                <div className="action-icon"><Icon icon={action.icon} /></div>
                <p className="action-description text-normal"><Marked parts={action.description} /></p>
            </div>
        </li>
    )
}

/**
 * List of the daily actions of the association (original design: lines separated by thin grey rules).
 */
export default function HomeActions() {
    return (
        <ul className="actions-index">
            {actions.map((action) => <ActionItem key={action.title} action={action} />)}
        </ul>
    )
}
