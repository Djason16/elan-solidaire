/**
 * Image loader of next/image for the static export (next.config.mjs: images.loaderFile).
 * The photos are prepared at build time of the content in public/photos/ as WebP files in several widths
 * ("/photos/home/hero" -> /photos/home/hero-320.webp ... -1920.webp): next/image writes them in the srcset and the
 * browser downloads only the width it needs (with the `sizes` of each image).
 * Other images are served as they are: SVG files (logo, icons, map preview) and the data URLs of admin uploads.
 * @module utils/imageLoader
 */

/** Widths prepared for every photo (the same list as images.deviceSizes and imageSizes of next.config.mjs). */
export const PHOTO_WIDTHS = [320, 640, 960, 1280, 1920]

/**
 * URL of an image for a width asked by next/image.
 * @param params
 */
export default function imageLoader({ src, width }: { src: string, width: number }): string {
    if (src.startsWith('/photos/')) {
        const prepared = PHOTO_WIDTHS.find((size) => size >= width) ?? PHOTO_WIDTHS[PHOTO_WIDTHS.length - 1]
        return `${src}-${prepared}.webp`
    }
    // A vector or an uploaded picture has one file: the width only keeps the URLs of the srcset distinct
    return src.startsWith('data:') ? src : `${src}?w=${width}`
}
