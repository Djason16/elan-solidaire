import type { ReactNode } from 'react'
interface InfoLinesProps {
    lines: ReactNode[]
    groups?: boolean
    className?: string
}

/**
 * Lines of information one under the other (name and e-mail, street and city, status and tracking number), with the
 * common vertical rhythm of the site (--info-gap, assets/css/base/global.css) instead of line breaks.
 *
 *   <InfoLines lines={[row.fullName, <small key="e">{row.email}</small>]} />
 *
 * Two different pieces of information in one cell (a status, then a tracking number) are two groups: `groups` gives
 * them the larger gap between groups (--info-group-gap) instead of the tight gap of the lines of one group.
 * @param props - Empty lines are skipped.
 */
export default function InfoLines({ lines, groups = false, className = '' }: InfoLinesProps) {
    return (
        <span className={`info-lines ${groups ? 'info-groups' : ''} ${className}`.replace(/\s+/g, ' ').trim()}>
            {lines.filter((line) => line !== null && line !== undefined && line !== false && line !== '').map((line, index) => (
                <span key={index} className="info-line">{line}</span>
            ))}
        </span>
    )
}
