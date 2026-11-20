import Icon from '@/components/ui/Icon/Icon'
import Highlight from './Highlight'
import { memberBenefits } from './supportContent'

/**
 * Right column of the membership form (original design): "Avantages membres" in a white card.
 */
export default function MemberInfo() {
    return (
        <div className="support-info">
            <section className="card" aria-labelledby="benefits-title">
                <h2 id="benefits-title" className="form-title text-semibold text-normal">Avantages membres</h2>
                <ul className="reasons-list">
                    {memberBenefits.map((benefit) => (
                        <li key={benefit.text} className="text-normal">
                            <Icon icon={benefit.icon} className="reason-icon" />
                            <span><Highlight text={benefit.text} /></span>
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    )
}
