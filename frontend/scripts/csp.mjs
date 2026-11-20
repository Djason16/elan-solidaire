/**
 * Strict Content Security Policy for the static export, run after "npm run build" (postbuild).
 * Next.js writes a small inline bootstrap script in each page: instead of allowing every inline script
 * ('unsafe-inline'), this script hashes the inline scripts of the built pages and writes their SHA-256 in the
 * Content-Security-Policy of out/_headers (Cloudflare Pages). JSON scripts (page data, JSON-LD) are not run, so they
 * need no hash.
 *
 *   node scripts/csp.mjs out
 */
import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const outDir = process.argv[2] ?? 'out'
const headersFile = join(outDir, '_headers')
if (!existsSync(headersFile)) {
    console.error(`csp: ${headersFile} not found`)
    process.exit(1)
}

const walk = (dir) => readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => (entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)]))

const INLINE_SCRIPT = /<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g
const hashes = new Set()
for (const file of walk(outDir).filter((path) => path.endsWith('.html'))) {
    for (const [, attributes, body] of readFileSync(file, 'utf8').matchAll(INLINE_SCRIPT)) {
        if (/type="application\/(ld\+)?json"/.test(attributes) || !body.trim()) continue
        hashes.add(`'sha256-${createHash('sha256').update(body).digest('base64')}'`)
    }
}

const headers = readFileSync(headersFile, 'utf8')
const updated = headers.replace(/script-src 'self' 'unsafe-inline'/, `script-src 'self' ${[...hashes].join(' ')}`)
writeFileSync(headersFile, updated)
console.log(`csp: ${hashes.size} inline script hash(es) -> ${headersFile}`)
