import Image, { type ImageProps } from 'next/image'
import { useState } from 'react'

// Shown in place of an image that cannot be loaded (light grey picture, same box)
type SiteImageProps = Omit<ImageProps, 'width' | 'height' | 'src'> & { alt: string, width: number | string, height: number | string, src: string }

export const FALLBACK_IMAGE = '/images/photo-fallback.svg'

/**
 * Image of the site (next/image): lazy loaded unless `priority`, with its size reserved (no layout shift).
 * The `title` comes from the `alt` when it is not given, so every image has both (rule of the site).
 * Photos of public/photos/ are served in several prepared WebP widths (utils/imageLoader.js, srcset + sizes).
 * Safety net: when a file cannot be loaded (deleted upload, old data), a neutral picture takes its place in the same
 * box instead of a broken image icon.
 *
 *   <SiteImage src="/photos/home/hero" alt="Bénévoles en gilet bleu" width={560} height={460} priority />
 *
 * @param props
 * @param props.src - Path of public/ or a data URL.
 * @param props.alt - Description of the image (always filled, never "").
 * @param [props.title] - Name shown on hover (the alt by default).
 * @param props.width - Intrinsic width (pixels).
 * @param props.height - Intrinsic height (pixels).
 */
export default function SiteImage({ alt, title, width, height, src, ...props }: SiteImageProps) {
    // The failed source is kept: a new src (another product) shows normally again
    const [failedSrc, setFailedSrc] = useState<string | null>(null)
    const failed = failedSrc === src

    return (
        // A priority image (first screen) is also fetched first by the browser (fetchpriority=high on the image and its preload)
        <Image alt={alt} title={title ?? alt} width={Number(width)} height={Number(height)} fetchPriority={props.priority ? 'high' : undefined} {...props}
            src={failed ? FALLBACK_IMAGE : src} unoptimized={failed || props.unoptimized}
            onError={() => setFailedSrc(src)} />
    )
}
