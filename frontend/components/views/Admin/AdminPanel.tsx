import type { ReactNode } from 'react'
import Expandable from '@/components/ui/Expandable/Expandable'

/**
 * A card of the admin, as in the original: either always open (a form, with its title and intro), or a folding list
 * whose header gives the summary of the records ("12 dons confirmés (540,00 €) • 3 en attente").
 * @param props
 * @param [props.title] - Title of an open card.
 * @param [props.intro] - Short text under the title (highlighted words in <mark>).
 * @param [props.summary] - Header of a folding card (the card is then folding).
 * @param [props.defaultOpen=false] - A folding card opened at first.
 * @param props.children
 */
interface AdminPanelProps {
    title?: string
    intro?: ReactNode
    summary?: ReactNode
    defaultOpen?: boolean
    children?: ReactNode
}

export default function AdminPanel({ title, intro, summary, defaultOpen = false, children }: AdminPanelProps) {
    if (summary) {
        return (
            <section className="card admin-card admin-card-folding">
                <Expandable header={<span className="text-normal">{summary}</span>} defaultOpen={defaultOpen}>
                    <div className="admin-card-body">{children}</div>
                </Expandable>
            </section>
        )
    }

    return (
        <section className="card admin-card">
            {title && <h3 className="admin-card-title text-semibold text-normal">{title}</h3>}
            {intro && <p className="admin-intro text-normal">{intro}</p>}
            {children}
        </section>
    )
}
