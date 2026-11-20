import type { PublicMembership } from '@/utils/types'
import BaseButton from '@/components/ui/BaseButton/BaseButton'
import Icon from '@/components/ui/Icon/Icon'
import { planOf } from '@/utils/content/programs'
import { formatDate, formatEuros } from '@/utils/format'
import { idCard, userPlus } from '@/utils/icons'

/**
 * Membership card of the member space, in the dark block of the design (like "Ce que votre adhésion permet"), or the invitation
 * to join when the account has no paid membership.
 * @param props - Memberships of GET /account.
 */
export default function MemberCard({ memberships }: { memberships: PublicMembership[] }) {
    const membership = memberships.find((row) => row.paymentStatus === 'completed')
    const plan = membership && planOf(membership.plan)

    return (
        <section className="info-extra gap-l member-card" aria-labelledby="membership-title">
            <h2 id="membership-title" className="text-normal">Mon adhésion</h2>
            {membership ? (
                <div className="impact-list gap-l">
                    <p className="impact-item gap-m">
                        <span className="impact-price text-bold text-large" aria-hidden="true"><Icon icon={idCard} /></span>
                        <span className="impact-description text-normal">
                            <mark>{plan?.title}</mark> ({formatEuros(membership.amount)}) valable du <mark>{formatDate(membership.startDate)}</mark> au <mark>{formatDate(membership.endDate)}</mark>.
                        </span>
                    </p>
                    <p className="impact-description text-normal">
                        {membership.cardShipped ? 'Votre carte de membre est partie par courrier.' : 'Votre carte de membre est en préparation.'}
                    </p>
                </div>
            ) : (
                <div className="impact-list gap-l">
                    <p className="impact-description text-normal">Vous n’êtes pas encore <mark>membre</mark> de l’association.</p>
                    <BaseButton href="/adhesion/" title="Devenir membre de l’association" icon={userPlus}>Devenir membre</BaseButton>
                </div>
            )}
        </section>
    )
}
