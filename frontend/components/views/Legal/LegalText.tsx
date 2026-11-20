import { Fragment } from 'react'
import AppLink from '@/components/ui/AppLink/AppLink'
import { linkify } from '@/utils/linkify'

/**
 * A paragraph of a legal page with its links made clickable (utils/linkify.js), without any injected HTML: pages of
 * the site with AppLink, other sites in a new tab (rel="noopener noreferrer"), e-mails and phone numbers with mailto:
 * and tel:. Every link has a title and the look of the text links of the site.
 * @param props
 */
export default function LegalText({ text, className }: { text: string, className?: string }) {
    return (
        <p className={className}>
            {linkify(text).map((part, index) => {
                if (!part.href) return <Fragment key={index}>{part.text}</Fragment>
                if (part.href.startsWith('/')) return <AppLink key={index} href={part.href} title={part.title} className="text-link">{part.text}</AppLink>
                return (
                    <a key={index} href={part.href} title={part.title} className="text-link"
                        {...(part.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                        {part.text}
                    </a>
                )
            })}
        </p>
    )
}
