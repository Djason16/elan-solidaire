import Link from 'next/link'
import type { ComponentProps, MouseEvent } from 'react'
import { useRouter } from 'next/router'

// Waits for an element of the new page to exist (the page changes without reloading), at most about two seconds
const whenPresent = (id: string, tries = 40) => new Promise<HTMLElement | null>((resolve) => {
    const look = (left: number) => {
        const element = document.getElementById(id)
        if (element || !left) resolve(element)
        else setTimeout(() => look(left - 1), 50)
    }
    look(tries)
})

/**
 * Link between the pages of the site: the page changes without reloading (next/link).
 * Every link of the site has a `title` describing its destination.
 * A link to a section ("/#our-section") scrolls smoothly to it without "#" in the address (opens the page first if needed).
 * @param props - Props of next/link.
 */
export default function AppLink({ href, title, onClick, ...props }: ComponentProps<typeof Link>) {
    const router = useRouter()
    const [path, id] = typeof href === 'string' ? href.split('#') : [undefined]

    if (!id) return <Link href={href} title={title} onClick={onClick} {...props} />

    const goToSection = async (event: MouseEvent<HTMLAnchorElement>) => {
        onClick?.(event)
        if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.button === 1) return
        event.preventDefault()
        const target = path || router.pathname
        if (router.pathname !== target) await router.push(target, undefined, { scroll: true })
        const element = await whenPresent(id)
        element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    // The address of the link is the page alone: no "#" is ever shown (status bar, copied link, page without script).
    // data-section tells it is a section link, never the current page (aria-current, tests/ui-probes.mjs)
    return <Link href={path || router.pathname} title={title} onClick={goToSection} data-section={id} {...props} />
}
