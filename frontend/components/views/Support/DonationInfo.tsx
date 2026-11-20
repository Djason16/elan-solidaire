import Icon from '@/components/ui/Icon/Icon'
import { formatEuros } from '@/utils/format'
import Highlight from './Highlight'
import { impacts, reasons } from './supportContent'

/**
 * Right column of the donation form (original design): "Pourquoi donner ?" in a white card, then the dark
 * "Impact de votre don" block with a green price square per line.
 */
export default function DonationInfo() {
    return (
        <div className="support-info">
            <section className="card" aria-labelledby="reasons-title">
                <h2 id="reasons-title" className="form-title text-semibold text-normal">Pourquoi donner ?</h2>
                <ul className="reasons-list">
                    {reasons.map((reason) => (
                        <li key={reason.text} className="text-normal">
                            <Icon icon={reason.icon} className="reason-icon" />
                            <span><Highlight text={reason.text} /></span>
                        </li>
                    ))}
                </ul>
            </section>

            <section className="info-extra gap-l" aria-labelledby="impact-title">
                <h2 id="impact-title" className="text-normal">Impact de votre don</h2>
                <ul className="impact-list gap-l">
                    {impacts.map((impact) => (
                        <li key={impact.price} className="impact-item gap-m">
                            <span className="impact-price text-bold text-large">{formatEuros(impact.price).replace(',00', '')}</span>
                            <span className="impact-description text-normal"><Highlight text={impact.text} /></span>
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    )
}
