import { fileURLToPath } from 'node:url'

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Static site in out/ (like "nuxt generate"), sent as it is (Cloudflare Pages, any static host).
    output: 'export',
    trailingSlash: true,
    // Photos prepared as WebP in several widths (public/photos/), chosen by utils/imageLoader.ts in the srcset;
    // SVG files and admin uploads (already WebP) are served as they are
    images: { loader: 'custom', loaderFile: './utils/imageLoader.ts', deviceSizes: [640, 960, 1280, 1920], imageSizes: [320] },
    // The project folder is the root (a package-lock.json higher on the disk must not be taken for it)
    turbopack: { root: fileURLToPath(new URL('.', import.meta.url)) },
    // No AGENTS.md written in the project by "next dev"
    agentRules: false,
    // Several development servers side by side (NEXT_DIST_DIR=.next-2 npx next dev -p 3011): one build folder each
    ...(process.env.NEXT_DIST_DIR ? { distDir: process.env.NEXT_DIST_DIR } : {}),
}

export default nextConfig
