import type { TrackingParcel } from '@/utils/types'
import { useRouter } from 'next/router'
import SectionIntro from '@/components/ui/SectionIntro/SectionIntro'
import { orderHistory } from '@/components/views/Admin/adminRecordsConfig'
import EmptyState from '@/components/views/Shop/EmptyState'
import { useApiData } from '@/composables/useApiData'
import { boxOpen } from '@/utils/icons'

/**
 * Tracking page of a parcel (/suivi/?colis=ES000015FR), as a carrier would show it: the current step and the dated
 * history. Simulated on the demo: the steps come one minute apart (utils/demo/orderTracking.js).
 */
export default function TrackingView() {
    const { query, isReady } = useRouter()
    const number = typeof query.colis === 'string' && /^ES\d{6}FR$/i.test(query.colis) ? query.colis.toUpperCase() : ''
    const { data, error } = useApiData<{ parcel: TrackingParcel }>(isReady && number ? `/tracking/${number}` : null)
    const parcel = data?.parcel

    return (
        <>
            <SectionIntro title="Suivi de colis" level={1}>
                <p>Suivi <mark>simulé</mark> pour la démonstration : chaque étape arrive une minute après la précédente.</p>
            </SectionIntro>
            <div className="page-content">
                {parcel && (
                    <section className="card tracking-card" aria-label={`Colis ${parcel.number}`}>
                        <p className="text-small text-uppercase">Colis {parcel.number} · livraison à {parcel.city}</p>
                        <h2 className="form-title text-semibold text-large">{parcel.statusLabel}</h2>
                        {orderHistory(parcel)}
                    </section>
                )}
                {isReady && (!number || error) && (
                    <EmptyState icon={boxOpen} level={2} title="Colis introuvable" text="Vérifiez le numéro de suivi indiqué dans votre espace membre."
                        href="/espace-membre/" linkLabel="Mon espace membre" />
                )}
            </div>
        </>
    )
}
