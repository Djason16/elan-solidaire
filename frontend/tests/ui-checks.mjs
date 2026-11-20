/**
 * Automatic checks of the interface, run on the built site (npm run build, then serve out/):
 *   1. hover: every interactive element changes at least one style under the mouse (1440 px), except listed cases;
 *   2. forms: in every form, the vertical gap between consecutive blocks (buttons included) is --form-gap (±1 px);
 *   3. cards: every card of a kind has the same padding;
 *   4. check boxes and radio buttons centered on the first line of their text (±1 px);
 *   5. navigation: every link of the header, menus and footer that points to the page has aria-current="page";
 *   6. feedback: no error text under the fields; errors and successes are toasts (role alert / status).
 * Widths 320, 375, 768, 1024 and 1440 px.
 *
 *   BASE=http://localhost:3100 npm run test:ui        (CHROME_PATH: Chrome or Chromium to use, ONLY=hover|layout|feedback)
 *
 * Exit code 0 when everything passes, 1 otherwise (the problems are listed).
 * @module tests/ui-checks
 */
import { chromium } from 'playwright-core'
import { checkboxProblems, cardProblems, currentLinkReport, formGapReport, hoverSignature, INTERACTIVE, visibleFieldErrors } from './ui-probes.mjs'
import { feedbackChecks } from './ui-feedback.mjs'

const BASE = (process.env.BASE ?? 'http://localhost:3100').replace(/\/+$/, '')
const CHROME = process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const ONLY = process.env.ONLY ?? ''
const COOKIE = { name: 'elan-solidaire_user_prefs', value: encodeURIComponent(JSON.stringify({ essential: true, functional: false, maps: true })) }
const WIDTHS = [320, 375, 768, 1024, 1440]

const PUBLIC_PAGES = ['/', '/don/', '/adhesion/', '/virement/?reference=DON-1049&amount=30', '/boutique/', '/boutique/produit/t-shirt-elan-coton-bio/',
    '/boutique/produit/sac-cabas-solidaire/', '/panier/', '/contact/', '/connexion/', '/mentions-legales/', '/confidentialite/', '/cgv/', '/cookies/', '/mot-de-passe-oublie/',
    '/evenements/', '/evenements/atelier-tri-des-dons/', '/fonctionnalites/', '/suivi/?colis=ES000001FR']
const MEMBER_PAGES = ['/espace-membre/']
const ADMIN_PAGES = ['/admin/', '/admin/produits/', '/admin/lieux/', '/admin/evenements/', '/admin/medias/', '/admin/commandes/', '/admin/dons/', '/admin/adhesions/', '/admin/messages/', '/admin/newsletters/', '/admin/reglages/']

/** Elements without a hover effect on purpose, with the reason. */
const HOVER_EXCEPTIONS = [
    { selector: '.skip-link', reason: 'hidden until it gets the keyboard focus' },
    { selector: '.leaflet-container a, .leaflet-container button', reason: 'drawn by Leaflet inside the map (zoom, attribution)' },
    { selector: '.toasts *', reason: 'notifications come and go during the test' },
]

const stats = { hover: 0, forms: 0, gaps: 0, links: 0, pages: 0 }
const problems = []
const browser = await chromium.launch({ executablePath: CHROME, headless: true })

/** Opens a page, waits for the loader to go and for the reveal animations (scrolls down once). */
const open = async (page, path) => {
    await page.goto(BASE + path, { waitUntil: 'networkidle' })
    await page.waitForSelector('.loader', { state: 'detached', timeout: 8000 }).catch(() => {})
    await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo({ top: y, behavior: 'instant' }); await new Promise((r) => setTimeout(r, 40)) }
        window.scrollTo({ top: 0, behavior: 'instant' })
    })
    await page.waitForTimeout(1200)
}

const login = async (page, role) => {
    await open(page, '/connexion/')
    await page.getByRole('button', { name: role === 'admin' ? 'Entrer comme admin (démo)' : 'Entrer comme membre (démo)' }).click()
    await page.waitForTimeout(1500)
}

const checkHover = async (page, tag) => {
    const exceptions = HOVER_EXCEPTIONS.map((item) => item.selector).join(', ')
    const handles = await page.locator(INTERACTIVE).elementHandles()
    for (const element of handles) {
        const skip = await element.evaluate((node, skipList) => !node.getClientRects().length || node.matches(skipList)
            || getComputedStyle(node).visibility === 'hidden' || node.closest('[inert], dialog:not([open]), [hidden]') !== null, exceptions).catch(() => true)
        if (skip) continue
        // In the middle of the screen: no floating button (back to top, cookies) over it
        await element.evaluate((node) => node.scrollIntoView({ block: 'center', behavior: 'instant' })).catch(() => {})
        await page.mouse.move(1, 1)
        await page.waitForTimeout(60)
        const before = await element.evaluate(hoverSignature).catch(() => null)
        await element.hover({ force: true, timeout: 1500 }).catch(() => {})
        await page.waitForTimeout(120)
        const after = await element.evaluate(hoverSignature).catch(() => null)
        stats.hover++
        if (before !== null && before === after) {
            const name = await element.evaluate((node) => `${node.tagName.toLowerCase()}.${[...node.classList].join('.')} « ${(node.innerText || node.getAttribute('aria-label') || node.title || '').trim().slice(0, 40)} »`)
            problems.push(`[survol] ${tag} ${name}`)
        }
    }
}

for (const width of ONLY === 'feedback' ? [] : WIDTHS) {
    const context = await browser.newContext({ viewport: { width, height: width < 768 ? 700 : 900 }, hasTouch: width < 1024 })
    await context.addCookies([{ ...COOKIE, url: BASE }])
    const page = await context.newPage()
    // A filled cart, so the checkout form shows
    await open(page, '/boutique/produit/mug-emaille/')
    await page.getByRole('button', { name: /Ajouter au panier/ }).click().catch(() => {})

    const visit = async (paths) => {
        for (const path of paths) {
            await open(page, path)
            const tag = `${path} @${width}`
            stats.pages++
            if (ONLY !== 'hover') {
                const forms = await page.evaluate(formGapReport)
                stats.forms += forms.forms
                stats.gaps += forms.gaps
                for (const problem of forms.problems) problems.push(`[formulaire] ${tag} ${problem}`)
                for (const problem of await page.evaluate(cardProblems)) problems.push(`[carte] ${tag} ${problem}`)
                for (const problem of await page.evaluate(checkboxProblems)) problems.push(`[case] ${tag} ${problem}`)
                const links = await page.evaluate(currentLinkReport)
                stats.links += links.checked
                for (const problem of links.problems) problems.push(`[lien actif] ${tag} ${problem}`)
            }
            if (width === 1440 && ONLY !== 'layout') await checkHover(page, tag)
        }
    }
    await visit(PUBLIC_PAGES)
    await login(page, 'member')
    await visit(MEMBER_PAGES)
    await login(page, 'admin')
    await visit(ADMIN_PAGES)
    await context.close()
}

// Feedback (toasts) at a phone and a desktop width
if (ONLY !== 'hover') {
    for (const width of [375, 1440]) {
        const context = await browser.newContext({ viewport: { width, height: 800 } })
        await context.addCookies([{ ...COOKIE, url: BASE }])
        for (const problem of await feedbackChecks(await context.newPage(), { open, login, visibleFieldErrors })) problems.push(`[retour] @${width} ${problem}`)
        await context.close()
    }
}
await browser.close()

const unique = [...new Set(problems)]
console.log(unique.length ? unique.join('\n') : 'ui-checks: 0 problem')
console.log(`Pages × widths: ${stats.pages} · hovered elements: ${stats.hover} · forms measured: ${stats.forms} (${stats.gaps} gaps) · links to the current page: ${stats.links}`)
console.log(`Hover exceptions: ${HOVER_EXCEPTIONS.map((item) => `${item.selector} (${item.reason})`).join('; ')}`)
process.exit(unique.length ? 1 : 0)
