/**
 * Functions run inside the page by tests/ui-checks.mjs (page.evaluate): they read the computed styles and boxes.
 * @module tests/ui-probes
 */

/** Interactive elements whose hover is checked. */
export const INTERACTIVE = [
    'a[href]', 'button:not(:disabled)', '[role="tab"]', 'select:not(:disabled)',
    'input:not([type="checkbox"]):not([type="radio"]):not([type="hidden"]):not([type="file"]):not(:disabled)', 'textarea:not(:disabled)',
    '.checkbox-field:not(.disabled)', '.radio-item', '.size-option:not(.is-disabled)',
].join(', ')

/**
 * Styles that can show a hover, of the element and of its first descendants (an icon, a box, a label).
 * @param {Element} node
 * @returns {string}
 */
export const hoverSignature = (node) => {
    const props = ['color', 'background-color', 'background-image', 'border-top-color', 'box-shadow', 'transform', 'opacity', 'outline-color', 'font-weight']
    const nodes = [node, ...node.querySelectorAll('*')].slice(0, 6)
    return nodes.map((item) => { const style = getComputedStyle(item); return props.map((prop) => style.getPropertyValue(prop)).join('|') }).join('||')
}

/**
 * Cards of the same kind with a different padding.
 * @returns {string[]}
 */
export const cardProblems = () => {
    const out = []
    const visible = (el) => el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden'
    for (const kind of ['.card', '.contact-card', '.stat-item']) {
        const paddings = new Map()
        for (const el of document.querySelectorAll(kind)) {
            if (!visible(el)) continue
            const s = getComputedStyle(el)
            const value = [s.paddingTop, s.paddingRight, s.paddingBottom, s.paddingLeft].join(' ')
            paddings.set(value, (paddings.get(value) ?? 0) + 1)
        }
        if (paddings.size > 1) out.push(`${kind} : paddings différents ${[...paddings.keys()].join(' / ')}`)
    }
    return out
}

/**
 * Every form of the page: the vertical gap between two consecutive blocks (field, group of choices, amounts, check
 * box, help text, buttons) must be --form-gap (1 px at most of difference). Rows of fields side by side count as
 * one line; wrappers of fields (rows, payment card, admin grid) are opened.
 * @returns {{ forms: number, gaps: number, problems: string[] }}
 */
export const formGapReport = () => {
    const WRAPPERS = ['form-row', 'cart-form-row', 'payment-row', 'payment-card', 'admin-form-fields']
    const problems = []
    let forms = 0
    let gaps = 0
    const shown = (el) => {
        const s = getComputedStyle(el)
        const r = el.getBoundingClientRect()
        return s.display !== 'none' && s.visibility !== 'hidden' && !['absolute', 'fixed'].includes(s.position) && r.height > 2 && !el.classList.contains('visually-hidden')
    }
    // Element children read with the getter of Element: a form exposes its fields by name (a field named "children"
    // would hide the list)
    const childrenOf = Object.getOwnPropertyDescriptor(Element.prototype, 'children').get
    const blocksOf = (container) => [...childrenOf.call(container)].filter(shown)
        .flatMap((child) => (WRAPPERS.some((name) => child.classList.contains(name)) ? blocksOf(child) : [child]))

    for (const form of document.querySelectorAll('form.support-form, .customer-form, form.admin-form, form.payment, .product-buy')) {
        if (!shown(form) && form.tagName !== 'FORM') continue
        if (!form.getClientRects().length) continue
        forms++
        const expected = parseFloat(getComputedStyle(form).getPropertyValue('--form-gap'))
        // Lines: blocks whose tops are within 2 px make one line (fields side by side)
        const lines = []
        for (const block of blocksOf(form).map((el) => ({ el, rect: el.getBoundingClientRect() })).sort((a, b) => a.rect.top - b.rect.top)) {
            const line = lines.find((item) => Math.abs(item.top - block.rect.top) <= 2)
            if (line) {
                line.bottom = Math.max(line.bottom, block.rect.bottom)
                line.names.push(block.el)
            } else {
                lines.push({ top: block.rect.top, bottom: block.rect.bottom, names: [block.el] })
            }
        }
        const label = (el) => (el.querySelector('legend, label, h2, h3')?.textContent ?? el.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 28)
        const formName = form.getAttribute('aria-label') ?? form.querySelector('h2, h3, legend, label')?.textContent?.trim() ?? form.className
        for (let i = 1; i < lines.length; i++) {
            const gap = lines[i].top - lines[i - 1].bottom
            gaps++
            if (Math.abs(gap - expected) > 1) {
                problems.push(`« ${formName} » : ${gap.toFixed(1)} px au lieu de ${expected} px entre « ${label(lines[i - 1].names[0])} » et « ${label(lines[i].names[0])} »`)
            }
        }
    }
    return { forms, gaps, problems }
}

/**
 * Check boxes and radio buttons whose box is not centered on the first line of their text (1 px at most).
 * @returns {string[]}
 */
export const checkboxProblems = () => {
    const out = []
    const pairs = [
        ...[...document.querySelectorAll('.checkbox-field')].map((label) => [label.querySelector('.checkbox-custom'), label.querySelector('.checkbox-label')]),
        ...[...document.querySelectorAll('.radio-item')].map((label) => [label.querySelector('input'), label.querySelector('span')]),
    ]
    for (const [box, text] of pairs) {
        if (!box || !text || !box.getClientRects().length) continue
        const range = document.createRange()
        range.selectNodeContents(text)
        const firstLine = [...range.getClientRects()].find((rect) => rect.height > 0) ?? text.getBoundingClientRect()
        const lineHeight = parseFloat(getComputedStyle(text).lineHeight) || firstLine.height
        // Middle of the first line box: the glyph box sits centered in the line height
        const lineCenter = firstLine.top + firstLine.height / 2
        const b = box.getBoundingClientRect()
        const diff = Math.abs((b.top + b.height / 2) - lineCenter)
        if (diff > 1 && lineHeight) out.push(`« ${text.innerText.trim().slice(0, 30)} » décalée de ${diff.toFixed(1)} px`)
    }
    return out
}

/**
 * Navigation links (header, menus, footer, admin) that point to the current page without aria-current="page".
 * @returns {{ checked: number, problems: string[] }}
 */
export const currentLinkReport = () => {
    const normalize = (path) => (path.replace(/\/+$/, '') || '/')
    const here = normalize(location.pathname)
    const problems = []
    let checked = 0
    for (const link of document.querySelectorAll('header a[href], nav a[href], footer a[href]')) {
        const url = new URL(link.getAttribute('href'), location.href)
        // A section link (AppLink, data-section) scrolls to a part of a page: it is never the current page
        if (url.origin !== location.origin || url.hash || link.dataset.section || normalize(url.pathname) !== here) continue
        checked++
        if (link.getAttribute('aria-current') !== 'page') problems.push(`« ${(link.textContent || link.title).trim()} » (${link.className}) sans aria-current`)
    }
    return { checked, problems }
}

/**
 * Error texts still written under the fields (forbidden: every error is a toast).
 * @returns {string[]}
 */
export const visibleFieldErrors = () => [...document.querySelectorAll('.field-error, form [role="alert"]')]
    .filter((el) => el.getClientRects().length && !el.classList.contains('visually-hidden'))
    .map((el) => el.textContent.trim().slice(0, 40))
