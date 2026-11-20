import AppLink from '@/components/ui/AppLink/AppLink'
import { useResetDemo } from '@/composables/useResetDemo'
import { useTourStore } from '@/stores/tour'
import { useIsCurrent } from '@/composables/useIsCurrent'

/**
 * Thin banner at the very top of every page, inside the header block (it moves with it): this is a demonstration site
 * of a fictional association, with the tools of the demo: guided tour, what the site includes and reset of the data.
 * Plain text and buttons, no live region: screen readers do not announce it at each page change.
 */
export default function DemoBanner() {
    const startTour = useTourStore((state) => state.start)
    const resetDemo = useResetDemo()
    const isCurrent = useIsCurrent()

    return (
        <div className="demo-banner">
            <p className="demo-banner-text">
                <strong>Site de démonstration</strong>
                <span className="demo-banner-detail"> · association fictive, paiements et e-mails simulés</span>
            </p>
            <ul className="demo-banner-tools" aria-label="Outils de la démonstration">
                <li><button type="button" className="demo-banner-link text-semibold" onClick={startTour}>Visite guidée</button></li>
                <li><AppLink href="/fonctionnalites/" className="demo-banner-link text-semibold" title="Voir tout ce que comprend ce site"
                    aria-current={isCurrent('/fonctionnalites/') ? 'page' : undefined}>Ce que comprend le site</AppLink></li>
                <li><button type="button" className="demo-banner-link text-semibold" onClick={resetDemo}>Remettre à zéro</button></li>
            </ul>
        </div>
    )
}
