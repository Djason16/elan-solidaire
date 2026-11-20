/**
 * Builds a class list: keeps the strings that are filled, drops false, null, undefined and empty strings, so a class
 * attribute never gets a double space or a trailing one.
 *
 *   cx('icon', spin && 'icon-spin', className)   // 'icon icon-spin reason-icon' or 'icon'
 *
 * @param names
 */
export const cx = (...names: unknown[]): string => names.filter((name): name is string => typeof name === 'string' && Boolean(name.trim())).map((name) => name.trim()).join(' ')
