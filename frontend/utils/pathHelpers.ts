/**
 * Address helpers. The site is exported with a final slash on every page (/about/), the helpers follow the same rule.
 * @module utils/pathHelpers
 */
export const TRAILING_SLASH_ENABLED = true

/**
 * Adds the final slash when it is on and missing: withTrailingSlash('/about') -> '/about/'.
 * @param path
 * @param [enabled=TRAILING_SLASH_ENABLED]
 */
export const withTrailingSlash = (path: string, enabled = TRAILING_SLASH_ENABLED) =>
    enabled && !path.endsWith('/') ? `${path}/` : path

/**
 * Joins a base address and a path without doubling the slash: joinUrl('https://site.com/', '/about').
 * @param [base='']
 * @param [path='/']
 */
export const joinUrl = (base = '', path = '/'): string => `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`
