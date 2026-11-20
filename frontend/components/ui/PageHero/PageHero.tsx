import type { ReactNode } from 'react'
interface PageHeroProps {
    eyebrow?: ReactNode
    title: string
    text?: ReactNode
    large?: boolean
    children?: ReactNode
}

/*
 * Top of a page: small title, large title, text and buttons (assets/css/components/page-hero.css, decorated by the DC Scaffold design while it is on).
 *   <PageHero eyebrow="À propos" title="Qui sommes-nous" text="Une petite équipe passionnée de web.">
 *       <AppLink href="/contact/" className="btn btn-primary">Nous contacter</AppLink>
 *   </PageHero>
 * eyebrow: a text, or any element (the badge of the home page). large: taller, for the home page.
 * AppLink (components/ui/AppLink): links between pages, without reloading.
 */

export default function PageHero({ eyebrow, title, text, large = false, children }: PageHeroProps) {
    return (
        <div className={large ? 'page-hero gap-m page-hero-large' : 'page-hero gap-m'}>
            {typeof eyebrow === 'string' ? <p className="page-hero-eyebrow text-small text-extrabold">{eyebrow}</p> : eyebrow}
            <h1>{title}</h1>
            {text && <p className="page-hero-text text-large">{text}</p>}
            {children && <div className="page-hero-actions gap-m">{children}</div>}
        </div>
    )
}
