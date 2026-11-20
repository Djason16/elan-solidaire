/**
 * Readable address part of a name: lower case, no accent, words joined by hyphens, nothing else.
 *
 *   slugify('T-shirt Élan coton bio')   // 't-shirt-elan-coton-bio'
 *   slugify('Mug émaillé 35 cl')        // 'mug-emaille-35-cl'
 *
 * @param text
 */
export const slugify = (text: unknown): string => String(text ?? '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

/**
 * A slug that no other row uses yet: the slug of the name, then -2, -3... when it is taken.
 * @param text
 * @param taken - Slugs already used.
 */
export const uniqueSlug = (text: unknown, taken: string[]): string => {
    const base = slugify(text) || 'produit'
    let slug = base
    for (let index = 2; taken.includes(slug); index++) slug = `${base}-${index}`
    return slug
}
