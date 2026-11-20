import { useRouter } from 'next/router'
import SectionIntro from '@/components/ui/SectionIntro/SectionIntro'
import { useReveal } from '@/composables/useReveal'
import { association } from '@/utils/content/site'
import { formatEuros } from '@/utils/format'
import MessagePage from '@/components/views/NotFound/MessagePage'
import { linkSlash } from '@/utils/icons'
import { cx } from '@/utils/cx'

/**
 * Bank transfer page of the original design: the details to finish a donation by transfer, in a card (fictional bank
 * account). The reference and the amount come from the address written by the donation form:
 * /virement/?reference=DON-1049&amount=30. A missing or malformed reference shows "Lien indisponible".
 */
export default function BankTransferView() {
    const { query, isReady } = useRouter()
    const [ref, visible] = useReveal<HTMLDivElement>(0.05)
    const reference = /^DON-\d{1,8}$/.test(String(query.reference ?? '')) ? String(query.reference) : null
    const amount = Number(query.amount)

    if (!isReady) return null
    if (!reference || !(amount > 0 && amount <= 10000)) {
        return (
            <MessagePage icon={linkSlash} title="Lien indisponible" level={1}
                text="Ce lien est invalide ou incomplet. Les coordonnées bancaires sont aussi dans l’e-mail du don (aperçu sur cette démonstration)." />
        )
    }

    const details = [
        ['Bénéficiaire', association.name, ''],
        ['IBAN', association.iban, 'rib-mono'],
        ['BIC', association.bic, 'rib-mono'],
        ['Montant', formatEuros(amount), ''],
        ['Libellé', reference, 'rib-mono'],
    ]

    return (
        <>
            <SectionIntro title="Virement bancaire" level={1}>
                <p>Tout ce qu’il vous faut pour envoyer votre <mark>don</mark> par virement.</p>
            </SectionIntro>
            <div ref={ref} className={cx('page-content', 'reveal-block', visible && 'is-visible')}>
                <section className="card reveal-item" aria-label="Coordonnées bancaires">
                    <dl className="rib-list">
                        {details.map(([label, value, className]) => (
                            <div key={label} className="rib-item gap-xxs">
                                <dt className="text-small">{label}</dt>
                                <dd className={cx('text-normal', className)}>{value}</dd>
                            </div>
                        ))}
                    </dl>
                    <ul className="rib-steps text-small">
                        <li>Enregistrez le bénéficiaire grâce à l’IBAN et au BIC.</li>
                        <li>Indiquez précisément le montant.</li>
                        <li>Reprenez le libellé tel quel.</li>
                        <li>Gardez le justificatif de votre banque.</li>
                    </ul>
                    <p className="rib-hint text-small">
                        Coordonnées fictives : n’envoyez pas d’argent. Sur un vrai site, elles seraient aussi envoyées par e-mail.
                    </p>
                </section>
            </div>
        </>
    )
}
